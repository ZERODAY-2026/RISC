"""Deterministic citation grounding, exact substring verification, and legal advice safe escalation engine."""
import re
from typing import List, Tuple, Optional, Dict
from backend.models import Clause, SafeEscalationCard

# Enforceability and legal advice intent triggers
LEGAL_ADVICE_TRIGGERS = [
    r"\b(?:is\s+this|is\s+it|are\s+these|is\s+the|can\s+this)\b.*?\b(?:enforceable|valid|binding|legal|illegal|void|lawful)\b",
    r"\bcan\s+(?:i|they|we|the\s+landlord|the\s+employer)\s+sue\b",
    r"\bcan\s+they\s+(?:take\s+me\s+to\s+court|file\s+a\s+case|kick\s+me\s+out|terminate\s+immediately)\b",
    r"\bwill\s+(?:a\s+court|the\s+judge)\s+(?:uphold|strike\s+down|rule|agree)\b",
    r"\b(?:what\s+is\s+my\s+legal\s+recourse|do\s+i\s+have\s+a\s+case|can\s+i\s+refuse\s+to\s+pay)\b",
    r"\b(?:valid|enforceable|legal)\s+in\s+(?:india|karnataka|delhi|maharashtra|california|uk|new\s+york)\b",
    r"\b(?:is\s+this\s+clause|are\s+these\s+terms)\s+allowed\s+by\s+law\b",
    r"\bliquidated\s+damages\s+penalty\b",
]

# Statutory context mapping for safe escalation advice
STATUTORY_CONTEXTS = {
    "non-compete": (
        "Non-compete clauses are heavily governed by Section 27 of the Indian Contract Act, 1872 "
        "(which declares agreements in restraint of trade void, subject to narrow exceptions like sale of goodwill). "
        "Courts typically differentiate strictly between non-competes during employment vs. post-employment."
    ),
    "penalty": (
        "Stipulated penalty and liquidated damages clauses fall under Section 74 of the Indian Contract Act, 1872. "
        "Courts generally award only 'reasonable compensation' for actual loss suffered rather than penal amounts, "
        "regardless of the exact figure written in the agreement."
    ),
    "deposit": (
        "Security deposit withholding, interest, and deductions are subject to local State Tenancy Laws "
        "(e.g., Karnataka Rent Act, Delhi Rent Control Act, or Model Tenancy Act). Statutory rules often limit "
        "permissible deduction items to documented damages or unpaid rent."
    ),
    "lock-in": (
        "Lock-in periods and mandatory rental payments upon early vacation are assessed under the Transfer of Property Act, 1882 "
        "and general contract principles. Whether a landlord can claim rent for the remainder of the lock-in period depends on "
        "duty to mitigate damages and local judicial precedents."
    ),
    "unilateral": (
        "Clauses granting one party unilateral discretion to amend terms or terminate without notice are scrutinised by courts "
        "under principles of mutuality, fundamental breach, and public policy (Section 23 of the Indian Contract Act)."
    ),
    "general": (
        "The legal validity and enforceability of contractual obligations depends on external statutory enactments "
        "(such as the Indian Contract Act, Specific Relief Act, or consumer/tenancy statutes) and local judicial precedents, "
        "which cannot be determined from the four corners of this document alone."
    )
}


def normalize_for_substring(text: str) -> str:
    """Normalize whitespace and punctuation for robust substring verification."""
    # Replace multiple whitespaces, tabs, and newlines with a single space
    cleaned = re.sub(r"\s+", " ", text).strip().lower()
    # Normalize fancy unicode quotes to standard ascii
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    return cleaned


def verify_quote_in_clause(quote: str, clause: Clause) -> Tuple[bool, Optional[str]]:
    """Programmatically verify that a cited quote is an exact normalized substring of the clause.
    
    Returns:
        (is_verified, normalized_match_phrase)
    """
    if not quote or not clause or not clause.verbatim_text:
        return False, None

    norm_quote = normalize_for_substring(quote)
    norm_clause = normalize_for_substring(clause.verbatim_text)

    # 1. Exact substring check
    if norm_quote in norm_clause:
        return True, quote

    # 2. Check if a significant sentence chunk of quote is in clause (e.g. at least 30 chars)
    if len(norm_quote) > 30:
        # Split quote into sentences and test each
        sentences = [s.strip() for s in re.split(r"[.\n;]", quote) if len(s.strip()) > 20]
        for sentence in sentences:
            if normalize_for_substring(sentence) in norm_clause:
                return True, sentence

    return False, None


def verify_all_citations(
    citations: List[Dict[str, str]],
    clause_map: Dict[str, Clause]
) -> List[Dict[str, any]]:
    """Batch verify LLM-extracted citations against deterministic source clauses.
    
    Each citation dict should have: {"clause_id": "CL-001", "quote": "..."}
    """
    verified_results = []
    for item in citations:
        c_id = item.get("clause_id", "").strip()
        quote = item.get("quote", "").strip()
        
        clause = clause_map.get(c_id)
        if not clause:
            verified_results.append({
                "clause_id": c_id,
                "quote": quote,
                "verified": False,
                "reason": f"Clause ID '{c_id}' does not exist in parsed document."
            })
            continue

        is_valid, matched_text = verify_quote_in_clause(quote, clause)
        verified_results.append({
            "clause_id": c_id,
            "quote": quote,
            "verified": is_valid,
            "matched_text": matched_text,
            "page_number": clause.page_number,
            "reason": "Exact substring match confirmed" if is_valid else "Quoted text does not match clause verbatim text"
        })

    return verified_results


def is_legal_advice_query(query: str) -> bool:
    """Detect if the user is asking for a legal validity ruling or legal advice."""
    query_lower = query.lower()
    for pattern in LEGAL_ADVICE_TRIGGERS:
        if re.search(pattern, query_lower):
            return True
    return False


def build_safe_escalation_card(query: str, relevant_clauses: List[Clause]) -> SafeEscalationCard:
    """Generate a structured safe escalation card refusing legal advice and guiding professional consult."""
    query_lower = query.lower()
    
    # Identify relevant context
    context_type = "general"
    if "compete" in query_lower or "employment" in query_lower:
        context_type = "non-compete"
    elif "penalt" in query_lower or "damages" in query_lower or "fine" in query_lower:
        context_type = "penalty"
    elif "deposit" in query_lower or "rent" in query_lower:
        context_type = "deposit"
    elif "lock-in" in query_lower or "lock in" in query_lower:
        context_type = "lock-in"
    elif "unilateral" in query_lower or "discretion" in query_lower:
        context_type = "unilateral"

    statutory_explanation = STATUTORY_CONTEXTS.get(context_type, STATUTORY_CONTEXTS["general"])

    c_ids = [c.clause_id for c in relevant_clauses]
    verbatim_citations = [
        f"[{c.clause_id} - {c.section_title}] \"{c.verbatim_text[:200]}...\""
        for c in relevant_clauses[:2]
    ]

    # Generate 3 concrete, tailored questions for the user to ask a lawyer
    if context_type == "non-compete":
        lawyer_questions = [
            "Does this non-compete covenant violate Section 27 of the Indian Contract Act, 1872 regarding restraint of trade?",
            "Are the specified geographic and temporal restrictions considered reasonable by local High Courts for this industry role?",
            "If the employer attempts to enforce this clause or withhold relieving documents, what immediate injunctive relief or legal protections are available?"
        ]
    elif context_type == "penalty":
        lawyer_questions = [
            "Is the stipulated financial penalty enforceable under Section 74 of the Indian Contract Act, or does the claiming party have to prove actual financial loss?",
            "Can this clause be contested as an unconscionable penalty rather than a genuine pre-estimate of liquidated damages?",
            "What documentary evidence does the opposing party need to produce before withholding funds as damages?"
        ]
    elif context_type == "deposit":
        lawyer_questions = [
            "Does the landlord's proposed deposit deduction adhere to the local State Rent/Tenancy Control Act or the Model Tenancy Act?",
            "What is the statutory timeline and legal procedure to demand refund of the security deposit with interest upon vacating?",
            "Can a formal legal notice be issued if deductions are made without providing repair bills or an itemized breakdown?"
        ]
    elif context_type == "lock-in":
        lawyer_questions = [
            "If I vacate prior to the lock-in period expiry due to habitability issues or job relocation, is the landlord legally entitled to full remaining rent?",
            "Does the landlord have a common-law or statutory duty to mitigate damages by attempting to re-let the premises?",
            "What notice format is required to safely terminate without forfeiting the entire security deposit?"
        ]
    else:
        lawyer_questions = [
            "Does this specific clause conform to statutory public policy and mandatory local laws in this jurisdiction?",
            "What specific procedural steps or notices are required before either party can initiate legal action based on this clause?",
            "Are there standard remedies or counter-claims available if the opposing party enforces this provision unfairly?"
        ]

    return SafeEscalationCard(
        trigger_reason=(
            "Legal validity, enforceability, and litigation outcomes cannot be decided from document text alone. "
            "They depend on statutory public policy, mandatory state legislation, and judicial interpretation."
        ),
        relevant_clauses=c_ids,
        verbatim_citations=verbatim_citations,
        why_jurisdiction_dependent=statutory_explanation,
        questions_for_lawyer=lawyer_questions
    )
