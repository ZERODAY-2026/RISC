"""Two-version contract comparison and obligation shift analyzer."""
import difflib
from typing import List, Tuple, Dict
from backend.models import Clause, DiffResult, DiffClauseMatch


def compute_similarity(text_a: str, text_b: str) -> float:
    """Calculate normalized sequence matcher similarity ratio between two clauses."""
    return difflib.SequenceMatcher(None, text_a.lower(), text_b.lower()).ratio()


def compare_contracts(
    doc_a_name: str,
    clauses_a: List[Clause],
    doc_b_name: str,
    clauses_b: List[Clause]
) -> DiffResult:
    """Compare two contract versions and detect added, removed, modified clauses and risk shifts."""
    matches: List[DiffClauseMatch] = []
    used_b_indices = set()

    added_count = 0
    removed_count = 0
    modified_count = 0
    risk_shifts = []

    # Map A clauses to best matching B clause
    for c_a in clauses_a:
        best_b_idx = None
        best_sim = 0.0

        for idx_b, c_b in enumerate(clauses_b):
            if idx_b in used_b_indices:
                continue

            # Check title match or similarity
            sim = compute_similarity(c_a.verbatim_text, c_b.verbatim_text)
            if c_a.section_title and c_a.section_title == c_b.section_title:
                sim += 0.25

            if sim > best_sim:
                best_sim = sim
                best_b_idx = idx_b

        if best_b_idx is not None and best_sim >= 0.55:
            # Matched clause
            used_b_indices.add(best_b_idx)
            c_b = clauses_b[best_b_idx]

            if best_sim > 0.98:
                status = "UNCHANGED"
                risk_delta = "Identical wording in both versions."
            else:
                status = "MODIFIED"
                modified_count += 1
                
                # Analyze risk shift
                delta_notes = []
                if "lock-in" in c_b.verbatim_text.lower() and "lock-in" not in c_a.verbatim_text.lower():
                    delta_notes.append("Version B introduced a new Lock-in Period requirement.")
                if "penalty" in c_b.verbatim_text.lower() and "penalty" not in c_a.verbatim_text.lower():
                    delta_notes.append("Version B introduced a new financial penalty.")
                if len(c_b.ambiguity_flags) > len(c_a.ambiguity_flags):
                    delta_notes.append("Version B added subjective discretionary language.")

                risk_delta = "; ".join(delta_notes) if delta_notes else f"Modified wording ({int((1-best_sim)*100)}% text divergence)."
                if delta_notes:
                    risk_shifts.extend(delta_notes)

            matches.append(
                DiffClauseMatch(
                    clause_id_a=c_a.clause_id,
                    clause_id_b=c_b.clause_id,
                    status=status,
                    section_title=c_b.section_title or c_a.section_title,
                    text_a=c_a.verbatim_text,
                    text_b=c_b.verbatim_text,
                    risk_delta=risk_delta,
                )
            )
        else:
            # Removed clause in Version B
            removed_count += 1
            risk_shifts.append(f"Clause '{c_a.section_title or c_a.clause_id}' from {doc_a_name} was removed in {doc_b_name}.")
            matches.append(
                DiffClauseMatch(
                    clause_id_a=c_a.clause_id,
                    clause_id_b=None,
                    status="REMOVED",
                    section_title=c_a.section_title or f"Clause {c_a.clause_id}",
                    text_a=c_a.verbatim_text,
                    text_b=None,
                    risk_delta="Clause was omitted or struck out in Version B.",
                )
            )

    # Any remaining clauses in B are ADDED
    for idx_b, c_b in enumerate(clauses_b):
        if idx_b not in used_b_indices:
            added_count += 1
            new_risk = f"Newly added clause '{c_b.section_title or c_b.clause_id}' in {doc_b_name}."
            if "non-compete" in c_b.verbatim_text.lower():
                new_risk += " Introduces new non-compete covenants."
            if "penalty" in c_b.verbatim_text.lower():
                new_risk += " Introduces new penalty liabilities."
            risk_shifts.append(new_risk)

            matches.append(
                DiffClauseMatch(
                    clause_id_a=None,
                    clause_id_b=c_b.clause_id,
                    status="ADDED",
                    section_title=c_b.section_title or f"Clause {c_b.clause_id}",
                    text_a=None,
                    text_b=c_b.verbatim_text,
                    risk_delta=new_risk,
                )
            )

    summary = (
        f"Comparison between '{doc_a_name}' and '{doc_b_name}' identified: "
        f"{added_count} added clause(s), {removed_count} removed clause(s), and {modified_count} modified clause(s)."
    )

    return DiffResult(
        doc_a_name=doc_a_name,
        doc_b_name=doc_b_name,
        summary=summary,
        total_added=added_count,
        total_removed=removed_count,
        total_modified=modified_count,
        risk_shifts=risk_shifts,
        clause_matches=matches,
    )
