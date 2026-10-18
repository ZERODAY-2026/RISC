"""Local in-memory hybrid retriever with deterministic 'Document is Silent' thresholding."""
import re
from typing import List, Tuple, Optional, Set
from rank_bm25 import BM25Okapi
from backend.models import Clause
from backend.config import SILENCE_BM25_THRESHOLD

# Common English stopwords to exclude when checking semantic term presence
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what",
    "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd",
    "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
}


def tokenize(text: str) -> List[str]:
    """Simple alphanumeric tokenizer for legal text."""
    return re.findall(r"\b[a-zA-Z0-9_\-]{2,}\b", text.lower())


def get_content_words(text: str) -> Set[str]:
    """Extract non-stopword alphanumeric terms."""
    words = tokenize(text)
    return {w for w in words if w not in STOPWORDS}


class LocalClauseIndex:
    """In-memory hybrid clause index with BM25 and exact keyword verification."""

    def __init__(self, clauses: List[Clause]):
        self.clauses: List[Clause] = clauses
        self.clause_map = {c.clause_id: c for c in clauses}
        self.corpus_tokenized = [tokenize(f"{c.section_title} {c.verbatim_text}") for c in clauses]
        
        # Pre-compute document-wide vocabulary
        self.doc_vocab: Set[str] = set()
        for tok_list in self.corpus_tokenized:
            self.doc_vocab.update(tok_list)

        # Initialize BM25Okapi if corpus has terms
        if any(self.corpus_tokenized):
            self.bm25 = BM25Okapi(self.corpus_tokenized)
        else:
            self.bm25 = None

    def search(
        self,
        query: str,
        top_k: int = 4
    ) -> Tuple[List[Tuple[Clause, float]], bool, List[str]]:
        """Search the document index for relevant clauses.
        
        Returns:
            Tuple of:
            - List of (Clause, score) sorted by relevance
            - is_silent (bool): True if the query asks about topics completely absent from the text
            - missing_terms (List[str]): Query content words that are not found anywhere in the doc
        """
        query_content_words = get_content_words(query)
        if not query_content_words:
            # Query is purely stopwords or empty
            return [], True, []

        missing_terms = [w for w in query_content_words if w not in self.doc_vocab]

        # If ALL or vast majority of core query terms are missing from the entire document
        if len(missing_terms) == len(query_content_words) or (
            len(query_content_words) >= 2 and len(missing_terms) >= len(query_content_words) - 1
        ):
            return [], True, missing_terms

        if not self.bm25:
            return [], True, list(query_content_words)

        tokenized_query = tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)

        # Pair each clause with its score
        scored_clauses = []
        for idx, score in enumerate(scores):
            # Add bonus for exact title or phrase match
            clause = self.clauses[idx]
            query_lower = query.lower()
            if any(term in clause.verbatim_text.lower() for term in query_content_words):
                term_match_count = sum(1 for term in query_content_words if term in clause.verbatim_text.lower())
                score += (term_match_count * 0.5)

            if score > 0.05:
                scored_clauses.append((clause, float(score)))

        scored_clauses.sort(key=lambda x: x[1], reverse=True)

        # Silence threshold check
        top_score = scored_clauses[0][1] if scored_clauses else 0.0
        if top_score < SILENCE_BM25_THRESHOLD and len(missing_terms) > 0:
            return scored_clauses[:top_k], True, missing_terms

        if not scored_clauses:
            return [], True, list(query_content_words)

        return scored_clauses[:top_k], False, missing_terms

    def get_clause(self, clause_id: str) -> Optional[Clause]:
        return self.clause_map.get(clause_id)
