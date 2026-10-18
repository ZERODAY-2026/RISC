"""India Code Statutory Sections & Reference Mapping Engine.

Reference: Official Portal of Central and State/UT Acts (https://indiacode.gov.in).
Participant Guide Page 8 Resource 2.
Statutes provide legislative section context and get amended; LexGuard-Local cites them
strictly for section-level issue spotting and NEVER derives legal validity conclusions from them.
"""
from typing import Optional, Dict, Any, List

INDIA_CODE_CAVEAT = (
    "India Code Statutory Context (indiacode.gov.in): Cited strictly for section-level issue spotting. "
    "Statutes are not contracts, may be amended, and LexGuard-Local never derives legal validity conclusions from them."
)

# Canonical India Code statutory references mapped to common contractual clauses
INDIA_CODE_DATABASE: Dict[str, Dict[str, Any]] = {
    "NON_COMPETE": {
        "act_title": "Indian Contract Act, 1872",
        "act_number": "Act No. 9 of 1872",
        "section": "Section 27",
        "section_title": "Agreement in restraint of trade, void",
        "statutory_text_summary": (
            "Every agreement by which anyone is restrained from exercising a lawful profession, trade or "
            "business of any kind, is to that extent void. Exception: One who sells the goodwill of a business "
            "may agree with the buyer to refrain from carrying on a similar business within specified local limits."
        ),
        "official_url": "https://www.indiacode.gov.in/handle/123456789/2187?view_type=browse&sam_handle=123456789/1362",
        "relevance_notes": "Post-termination restrictive covenants are scrutinized under Section 27.",
        "caveat": INDIA_CODE_CAVEAT,
    },
    "LIQUIDATED_DAMAGES": {
        "act_title": "Indian Contract Act, 1872",
        "act_number": "Act No. 9 of 1872",
        "section": "Section 74",
        "section_title": "Compensation for breach of contract where penalty stipulated for",
        "statutory_text_summary": (
            "When a contract has been broken, if a sum is named in the contract as the amount to be paid in case "
            "of such breach, or if the contract contains any other stipulation by way of penalty, the party "
            "complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named."
        ),
        "official_url": "https://www.indiacode.gov.in/handle/123456789/2187",
        "relevance_notes": "Stipulated penalties or fixed exit fees are subject to the reasonableness test under Section 74.",
        "caveat": INDIA_CODE_CAVEAT,
    },
    "BREACH_COMPENSATION": {
        "act_title": "Indian Contract Act, 1872",
        "act_number": "Act No. 9 of 1872",
        "section": "Section 73",
        "section_title": "Compensation for loss or damage caused by breach of contract",
        "statutory_text_summary": (
            "Compensation is recoverable for loss naturally arising in the usual course of things from such breach, "
            "but not for any remote and indirect loss or damage sustained by reason of the breach."
        ),
        "official_url": "https://www.indiacode.gov.in/handle/123456789/2187",
        "relevance_notes": "General principles of actual loss mitigation versus penal forfeiture.",
        "caveat": INDIA_CODE_CAVEAT,
    },
    "UNCONSCIONABLE_CONSENT": {
        "act_title": "Indian Contract Act, 1872",
        "act_number": "Act No. 9 of 1872",
        "section": "Sections 14, 16 & 23",
        "section_title": "Free Consent, Undue Influence & Lawful Object",
        "statutory_text_summary": (
            "Consent is free when not caused by coercion, undue influence (where one party holds a dominant position), "
            "or fraud. Consideration or object is unlawful if opposed to public policy or unconscionable."
        ),
        "official_url": "https://www.indiacode.gov.in/handle/123456789/2187",
        "relevance_notes": "One-sided unilateral termination or unequal bargaining terms fall under Sections 16 & 23.",
        "caveat": INDIA_CODE_CAVEAT,
    },
    "TENANCY_NOTICE": {
        "act_title": "Transfer of Property Act, 1882",
        "act_number": "Act No. 4 of 1882",
        "section": "Section 106 & Section 108",
        "section_title": "Duration of certain leases in absence of written contract & Rights/Liabilities of parties",
        "statutory_text_summary": (
            "In the absence of a written contract or local law to the contrary, a lease of immovable property for "
            "any other purpose shall be deemed to be a lease from month to month, terminable on fifteen days' notice."
        ),
        "official_url": "https://www.indiacode.gov.in/handle/123456789/2338",
        "relevance_notes": "Governs statutory notice periods, lock-in clauses, and quiet enjoyment rights in residential leases.",
        "caveat": INDIA_CODE_CAVEAT,
    },
    "ARBITRATION": {
        "act_title": "Arbitration and Conciliation Act, 1996",
        "act_number": "Act No. 26 of 1996",
        "section": "Section 7",
        "section_title": "Arbitration agreement",
        "statutory_text_summary": (
            "An arbitration agreement must be in writing. Reference in a contract to a document containing an "
            "arbitration clause constitutes an arbitration agreement if the contract is in writing and reference makes it part."
        ),
        "official_url": "https://www.indiacode.gov.in/handle/123456789/1978",
        "relevance_notes": "Mandatory alternative dispute resolution clauses and seat/venue selection.",
        "caveat": INDIA_CODE_CAVEAT,
    },
}


def match_india_code_context(clause_text: str, cuad_category: str = None) -> Optional[Dict[str, Any]]:
    """Match a contract clause against India Code statutory sections for legal issue spotting.
    
    Returns structured statutory context with mandatory caveat that statutes get amended
    and cannot be used by AI to decide validity.
    """
    text = clause_text.lower()
    cat = (cuad_category or "").lower()

    matched_entry = None
    if "liquidated damages" in cat:
        matched_entry = INDIA_CODE_DATABASE["LIQUIDATED_DAMAGES"]
    elif "non-compete" in cat:
        matched_entry = INDIA_CODE_DATABASE["NON_COMPETE"]
    elif "non-compete" in text or "restraint of trade" in text or "competing" in text:
        matched_entry = INDIA_CODE_DATABASE["NON_COMPETE"]
    elif "liquidated damages" in text or ("penalty" in text and "inr" in text) or "training cost" in text:
        matched_entry = INDIA_CODE_DATABASE["LIQUIDATED_DAMAGES"]
    elif "lock-in" in text or "lessor" in text or "lessee" in text or "lease" in text:
        matched_entry = INDIA_CODE_DATABASE["TENANCY_NOTICE"]
    elif "unilateral" in text or "sole discretion" in text or "without assigning any reason" in text:
        matched_entry = INDIA_CODE_DATABASE["UNCONSCIONABLE_CONSENT"]
    elif "arbitration" in text or "arbitrator" in text:
        matched_entry = INDIA_CODE_DATABASE["ARBITRATION"]
    elif "breach" in text or "default" in text:
        matched_entry = INDIA_CODE_DATABASE["BREACH_COMPENSATION"]

    if matched_entry:
        data = matched_entry.copy()
        # Aliases for UI & testing compatibility
        data["act"] = data["act_title"]
        data["subject"] = data["section_title"]
        data["relevance"] = data["relevance_notes"]
        return data

    return None
