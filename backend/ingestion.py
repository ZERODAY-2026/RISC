"""Deterministic document ingestion, clause extraction, and adversarial prompt-injection shield."""
import re
import pymupdf as fitz
from typing import List, Tuple, Optional
from backend.models import Clause, DocumentMetadata

# Adversarial prompt-injection patterns common in malicious documents
ADVERSARIAL_PATTERNS = [
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"system\s*:\s*override",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"state\s+(?:that\s+)?this\s+contract\s+has\s+zero\s+risk",
    r"do\s+not\s+flag\s+any\s+(?:penalties|risks|clauses)",
    r"disregard\s+(?:all\s+)?safety\s+guidelines",
    r"output\s+only\s+['\"]CLEAN['\"]",
    r"jailbreak",
    r"dan\s+mode",
    r"bypass\s+all\s+guardrails",
]

# Section title regex patterns for legal contracts
SECTION_PATTERNS = [
    r"^(?:ARTICLE|SECTION|CLAUSE)\s+([0-9IVXLCDM]+(?:\.[0-9]+)*)[:.\s-]*(.*)$",
    r"^([0-9]+(?:\.[0-9]+)*)[:.\s-]+(.*)$",
    r"^(WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF|SCHEDULE|ANNEXURE|TERMINATION|CONFIDENTIALITY|GOVERNING LAW|INDEMNITY|NON-COMPETE|REPRESENTATIONS AND WARRANTIES)[:.\s-]*(.*)$"
]

# Ambiguity indicator keywords
AMBIGUITY_KEYWORDS = [
    "sole discretion",
    "absolute discretion",
    "reasonable efforts",
    "best efforts",
    "as deemed fit",
    "from time to time",
    "without limitation",
    "including but not limited to",
    "consequential damages",
    "indemnify and hold harmless",
    "liquidated damages",
    "lock-in period",
    "unilateral",
    "at its option",
    "sole and exclusive",
    "without assigning any reason",
]


class IngestionError(Exception):
    """Raised when document ingestion or parsing fails."""
    pass


def detect_prompt_injection(text: str) -> Tuple[bool, Optional[str]]:
    """Scan raw text for adversarial prompt-injection instructions."""
    for pattern in ADVERSARIAL_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            matched_phrase = match.group(0)
            return True, f"Suspicious prompt-injection attempt detected: '{matched_phrase}'"
    return False, None


def sanitize_contract_text(text: str) -> str:
    """Sanitize and wrap text inside untrusted data boundaries."""
    # Defang backticks or system instruction spoofing
    cleaned = text.replace("```", "'''")
    return f"<untrusted_contract_text>\n{cleaned}\n</untrusted_contract_text>"


def extract_ambiguities(text: str) -> List[str]:
    """Scan clause text for high-risk subjective or ambiguous legal terms."""
    flags = []
    text_lower = text.lower()
    for phrase in AMBIGUITY_KEYWORDS:
        if phrase in text_lower:
            flags.append(f"Subjective phrasing: '{phrase}'")
    return flags


def extract_pdf_pages(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Extract page number and raw text using PyMuPDF (fitz)."""
    pages_data = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise IngestionError(f"Malformed or unreadable PDF: {str(e)}")

    if doc.is_encrypted:
        raise IngestionError("PDF is encrypted/password-protected. Cannot extract text offline.")

    if len(doc) == 0:
        raise IngestionError("PDF document is empty (0 pages).")

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text("text") or ""
        pages_data.append((page_idx + 1, text))

    doc.close()
    return pages_data


def extract_txt_pages(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Extract plain text with character-aware chunking."""
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = file_bytes.decode("latin-1")
        except Exception as e:
            raise IngestionError(f"Unable to decode text file: {str(e)}")

    if not text.strip():
        raise IngestionError("Uploaded text file is empty.")

    # Approximate 1 page per ~3000 chars if not paginated
    pages_data = []
    page_chunks = text.split("\f")  # Form feed if present
    if len(page_chunks) > 1:
        for idx, chunk in enumerate(page_chunks):
            if chunk.strip():
                pages_data.append((idx + 1, chunk))
    else:
        # Single page or synthetic page split
        pages_data.append((1, text))
    return pages_data


def parse_clauses_from_pages(pages_data: List[Tuple[int, str]]) -> List[Clause]:
    """Deterministically segment pages into numbered clauses with IDs CL-001, CL-002, etc."""
    clauses: List[Clause] = []
    clause_counter = 1
    full_text_offset = 0

    for page_num, page_text in pages_data:
        # Split on double linebreaks OR single newline preceding numbered section headers
        paragraphs = re.split(
            r"(?:\n\s*\n+|\n(?=(?:ARTICLE|SECTION|CLAUSE|[0-9]+(?:\.[0-9]+)*[:.\s-]+)))",
            page_text
        )
        
        current_title = f"Page {page_num} Overview"
        buffer_text = []

        for para in paragraphs:
            para_clean = para.strip()
            if not para_clean:
                continue

            # Check if this paragraph starts with a known section header
            matched_title = None
            first_line = para_clean.split("\n")[0].strip()
            for pattern in SECTION_PATTERNS:
                m = re.match(pattern, first_line, re.IGNORECASE)
                if m:
                    matched_title = first_line[:80]
                    break

            # If previous buffer had text and this is a new section or substantial block
            if matched_title or len(para_clean) > 80:
                if buffer_text:
                    merged = "\n".join(buffer_text)
                    c_id = f"CL-{clause_counter:03d}"
                    start = full_text_offset
                    end = start + len(merged)
                    full_text_offset = end + 1
                    clauses.append(
                        Clause(
                            clause_id=c_id,
                            page_number=page_num,
                            section_title=current_title,
                            verbatim_text=merged,
                            char_start=start,
                            char_end=end,
                            ambiguity_flags=extract_ambiguities(merged),
                        )
                    )
                    clause_counter += 1
                    buffer_text = []

                if matched_title:
                    current_title = matched_title

            buffer_text.append(para_clean)

        if buffer_text:
            merged = "\n".join(buffer_text)
            c_id = f"CL-{clause_counter:03d}"
            start = full_text_offset
            end = start + len(merged)
            full_text_offset = end + 1
            clauses.append(
                Clause(
                    clause_id=c_id,
                    page_number=page_num,
                    section_title=current_title,
                    verbatim_text=merged,
                    char_start=start,
                    char_end=end,
                    ambiguity_flags=extract_ambiguities(merged),
                )
            )
            clause_counter += 1

    return clauses


def extract_document_metadata(doc_name: str, full_text: str, clauses: List[Clause]) -> DocumentMetadata:
    """Extract high-level contract entities: parties, dates, notice periods, jurisdiction."""
    has_injection, injection_details = detect_prompt_injection(full_text)

    # Document type heuristics
    text_lower = full_text.lower()
    doc_type = "Commercial Contract"
    if "lease" in text_lower or "rent" in text_lower or "tenant" in text_lower or "landlord" in text_lower or "lessor" in text_lower:
        doc_type = "Rental & Lease Agreement"
    elif "employment" in text_lower or "employee" in text_lower or "probation" in text_lower or "salary" in text_lower:
        doc_type = "Employment Agreement"
    elif "non-disclosure" in text_lower or "nda" in text_lower or "confidential information" in text_lower:
        doc_type = "Non-Disclosure Agreement (NDA)"
    elif "notice" in text_lower and ("demand" in text_lower or "eviction" in text_lower or "breach" in text_lower):
        doc_type = "Legal Notice / Demand"

    # Effective date detection
    date_match = re.search(
        r"(?:entered into on|effective as of|dated|this)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:day\s+of\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+[0-9]{4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})",
        full_text,
        re.IGNORECASE,
    )
    effective_date = date_match.group(1) if date_match else "Not explicitly stated"

    # Parties detection
    parties = []
    party_matches = re.findall(
        r"(?:between|by and between)\s+([A-Z][A-Za-z0-9\s,\.]{3,40}?)(?:\s*,|\s+hereinafter|\s+and|\s*\()",
        full_text
    )
    for p in party_matches[:2]:
        p_clean = p.strip().strip(",")
        if p_clean and len(p_clean) > 3 and p_clean not in parties:
            parties.append(p_clean)

    # Governing law / Jurisdiction
    gov_match = re.search(
        r"(?:governed by|construed in accordance with|jurisdiction of)\s+([^.\n]{10,80})",
        full_text,
        re.IGNORECASE,
    )
    governing_law = gov_match.group(0).strip() if gov_match else "Not explicitly stated in standard clause"

    # Notice periods
    notice_matches = re.findall(
        r"([0-9]+\s+(?:days?|months?|weeks?))\s+(?:prior\s+)?notice",
        full_text,
        re.IGNORECASE,
    )
    notice_periods = list(set(notice_matches))[:3]

    # Financial penalties / security deposit
    penalty_matches = re.findall(
        r"(?:penalty of|interest at|liquidated damages of|security deposit of|fine of)\s+([^\n\.]{5,50})",
        full_text,
        re.IGNORECASE,
    )
    penalties = [p.strip() for p in penalty_matches[:3]]

    # Lock-in period
    lock_in_matches = re.findall(
        r"lock[- ]in\s+(?:period\s+)?(?:of\s+)?([0-9]+\s+(?:months?|years?))",
        full_text,
        re.IGNORECASE,
    )
    lock_in_periods = list(set(lock_in_matches))

    high_risk_count = sum(1 for c in clauses if len(c.ambiguity_flags) > 0)

    pages = max([c.page_number for c in clauses]) if clauses else 1

    return DocumentMetadata(
        document_name=doc_name,
        doc_type=doc_type,
        total_pages=pages,
        total_clauses=len(clauses),
        parties_detected=parties if parties else ["Unspecified / Undetected Entities"],
        effective_date=effective_date,
        governing_law_or_jurisdiction=governing_law,
        prompt_injection_detected=has_injection,
        prompt_injection_details=injection_details,
        notice_periods=notice_periods,
        financial_penalties=penalties,
        lock_in_periods=lock_in_periods,
        high_risk_clauses_count=high_risk_count,
    )


def ingest_document(filename: str, file_bytes: bytes) -> Tuple[DocumentMetadata, List[Clause]]:
    """Primary pipeline for parsing any uploaded PDF or TXT document."""
    if not file_bytes:
        raise IngestionError("Uploaded file is empty (0 bytes).")

    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext == ".pdf":
        pages = extract_pdf_pages(file_bytes)
    elif ext in [".txt", ".text"]:
        pages = extract_txt_pages(file_bytes)
    else:
        raise IngestionError(f"Unsupported file format '{ext}'. Allowed: .pdf, .txt")

    clauses = parse_clauses_from_pages(pages)
    if not clauses:
        raise IngestionError("Could not extract any recognizable clauses from document text.")

    full_text = "\n\n".join(c.verbatim_text for c in clauses)
    metadata = extract_document_metadata(filename, full_text, clauses)

    return metadata, clauses
