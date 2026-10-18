"""Pydantic data models for LexGuard-Local legal document triage."""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class Clause(BaseModel):
    """Structured legal clause representation."""
    clause_id: str = Field(description="Deterministic ID, e.g., 'CL-001'")
    page_number: int = Field(default=1, description="1-indexed source page")
    section_title: str = Field(default="", description="Detected section heading or identifier")
    verbatim_text: str = Field(description="Exact source text from document")
    char_start: int = Field(default=0, description="Character offset start in document")
    char_end: int = Field(default=0, description="Character offset end in document")
    ambiguity_flags: List[str] = Field(default_factory=list, description="Detected subjective legalese phrases")
    cuad_category: Optional[str] = Field(default=None, description="Official CUAD 41-category taxonomy match")


class DocumentMetadata(BaseModel):
    """Extracted structured metadata from the legal document."""
    document_name: str
    doc_type: str = "General Legal Agreement"
    total_pages: int = 1
    total_clauses: int = 0
    parties_detected: List[str] = Field(default_factory=list)
    effective_date: Optional[str] = None
    governing_law_or_jurisdiction: Optional[str] = None
    prompt_injection_detected: bool = False
    prompt_injection_details: Optional[str] = None
    notice_periods: List[str] = Field(default_factory=list)
    financial_penalties: List[str] = Field(default_factory=list)
    lock_in_periods: List[str] = Field(default_factory=list)
    high_risk_clauses_count: int = 0
    is_cuad_benchmark: bool = False
    cuad_caveat: Optional[str] = None


class TriageCard(BaseModel):
    """Clause-by-clause triage card with strict boundary between text and observation."""
    clause_id: str
    page_number: int
    section_title: str
    explicit_text: str = Field(description="What the document explicitly states (verbatim quote)")
    plain_language_explanation: str = Field(description="Non-lawyer translation of operative terms")
    potential_ambiguities_and_risks: List[str] = Field(
        default_factory=list,
        description="Triage observations regarding risks, missing protections, or one-sided obligations (NOT legal advice)"
    )
    confidence_badge: Literal[
        "VERIFIED_EXACT_QUOTE",
        "AMBIGUOUS_WORDING_DETECTED",
        "JURISDICTION_DEPENDENT",
        "DOCUMENT_IS_SILENT",
        "UNVERIFIED_CITATION"
    ] = "VERIFIED_EXACT_QUOTE"
    severity: Literal["LOW", "MEDIUM", "HIGH"] = "LOW"
    cuad_category: Optional[str] = None
    cuad_caveat: Optional[str] = None
    india_code_ref: Optional[dict] = None
    open_india_law_context: Optional[dict] = None


class SafeEscalationCard(BaseModel):
    """Safe escalation structure when legal advice or validity ruling is requested."""
    trigger_reason: str = Field(description="Why this query cannot be answered by document text alone")
    relevant_clauses: List[str] = Field(default_factory=list, description="Relevant cited clauses CL-XXX")
    verbatim_citations: List[str] = Field(default_factory=list, description="Exact quotes from the document")
    why_jurisdiction_dependent: str = Field(
        description="Explanation of applicable statutory frameworks (e.g., Indian Contract Act 1872) and why court interpretation is required"
    )
    questions_for_lawyer: List[str] = Field(
        default_factory=list,
        description="Concrete, actionable questions to take to a qualified legal advocate"
    )
    india_code_citation: Optional[dict] = None
    open_india_law_context: Optional[dict] = None
    statutory_non_lawyer_disclaimer: str = (
        "Statutes and court precedents provide legislative/judicial context and get amended; "
        "LexGuard-Local never derives legal validity conclusions from them."
    )


class QARequest(BaseModel):
    question: str
    document_id: Optional[str] = None


class QAResponse(BaseModel):
    question: str
    answer_markdown: str
    status: Literal["GROUNDED_ANSWER", "DOCUMENT_IS_SILENT", "SAFE_ESCALATION_REQUIRED"]
    cited_clauses: List[str] = Field(default_factory=list)
    verified_quotes: List[str] = Field(default_factory=list)
    escalation_card: Optional[SafeEscalationCard] = None
    execution_time_ms: float = 0.0
    model_used: str = "Local Gemma (Offline)"


class DiffClauseMatch(BaseModel):
    clause_id_a: Optional[str] = None
    clause_id_b: Optional[str] = None
    status: Literal["UNCHANGED", "MODIFIED", "ADDED", "REMOVED"]
    section_title: str
    text_a: Optional[str] = None
    text_b: Optional[str] = None
    risk_delta: Optional[str] = None


class DiffResult(BaseModel):
    doc_a_name: str
    doc_b_name: str
    summary: str
    total_added: int
    total_removed: int
    total_modified: int
    risk_shifts: List[str] = Field(default_factory=list)
    clause_matches: List[DiffClauseMatch] = Field(default_factory=list)


class PrivacyAuditReport(BaseModel):
    offline_status: bool = True
    active_external_sockets: int = 0
    external_connections: List[dict] = Field(default_factory=list)
    bound_interface: str = "127.0.0.1"
    memory_rss_mb: float = 0.0
    cpu_percent: float = 0.0
    ollama_model: str = "gemma4:e4b"
    ollama_connected: bool = False
    environment_flags: dict = Field(default_factory=dict)
    system_architecture: str = "ARM64/macOS Local Sandbox"
    encryption_active: bool = True
    cipher_suite: str = "AES-256-GCM (NIST SP 800-38D Authenticated AEAD)"
    key_fingerprint: str = ""
    zeroize_verified: bool = True


class DocumentUploadResponse(BaseModel):
    metadata: DocumentMetadata
    clauses: List[Clause]
    triage_cards: List[TriageCard]
    message: str = "Document successfully ingested and indexed locally."


class WipeResponse(BaseModel):
    status: str = "SUCCESS"
    message: str = "All in-memory indexes and cached documents securely wiped from RAM."
