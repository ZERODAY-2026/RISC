"""Automated compliance verification test suite for PS2 Track Requirements.

Tests pass/fail gates and core rubric criteria:
- Criterion 2: Grounding in source passages, quote matching, and silence detection.
- Criterion 3: Uncertainty, refusal of legal advice, and safe escalation.
- Criterion 4: Strict on-device network isolation and zero external telemetry.
- Criterion 6: Robustness on malformed input and adversarial prompt injection.
"""
import socket
import pytest
from pathlib import Path

from backend.ingestion import ingest_document, detect_prompt_injection, IngestionError
from backend.retriever import LocalClauseIndex
from backend.guardrails import (
    verify_quote_in_clause,
    is_legal_advice_query,
    build_safe_escalation_card,
    normalize_for_substring,
)
from backend.gemma_client import GemmaLocalClient
from backend.audit import check_network_isolation

SAMPLES_DIR = Path(__file__).resolve().parent.parent / "samples"


@pytest.fixture
def rental_document():
    path = SAMPLES_DIR / "sample_rental_agreement.txt"
    bytes_data = path.read_bytes()
    meta, clauses = ingest_document("sample_rental_agreement.txt", bytes_data)
    index = LocalClauseIndex(clauses)
    return meta, clauses, index


@pytest.fixture
def employment_document():
    path = SAMPLES_DIR / "sample_employment_contract.txt"
    bytes_data = path.read_bytes()
    meta, clauses = ingest_document("sample_employment_contract.txt", bytes_data)
    index = LocalClauseIndex(clauses)
    return meta, clauses, index


# ==============================================================================
# TEST 1: STRICT NETWORK ISOLATION (ZERO OUTBOUND CALLS)
# ==============================================================================
def test_network_isolation_during_processing(monkeypatch, rental_document):
    """Verify that socket.connect strictly rejects any non-loopback connection."""
    orig_connect = socket.socket.connect

    def guarded_connect(self, address):
        host, port = address[0], address[1]
        # Allow loopback/localhost only
        if host not in ["127.0.0.1", "localhost", "::1"]:
            raise PermissionError(f"CRITICAL PRIVACY VIOLATION: Outbound connection attempted to {host}:{port}")
        return orig_connect(self, address)

    monkeypatch.setattr(socket.socket, "connect", guarded_connect)

    meta, clauses, index = rental_document
    # Perform retrieval and processing
    results, is_silent, _ = index.search("lock-in period")
    assert len(results) > 0
    assert not is_silent

    # Check process connection table
    external_conns = check_network_isolation()
    assert len(external_conns) == 0, f"Found unexpected external sockets: {external_conns}"


# ==============================================================================
# TEST 2: DETERMINISTIC QUOTE GROUNDING & EXACT SUBSTRING VERIFICATION
# ==============================================================================
def test_deterministic_quote_verification(rental_document):
    """Verify that quotes are programmatically validated as exact substrings."""
    _, clauses, _ = rental_document
    lock_in_clause = next(c for c in clauses if "lock-in" in c.verbatim_text.lower())

    # Exact valid quote from document
    valid_quote = "The Lessee agrees to a strict lock-in period of 6 months."
    is_valid, matched = verify_quote_in_clause(valid_quote, lock_in_clause)
    assert is_valid is True
    assert matched is not None

    # Hallucinated quote containing altered wording
    fake_quote = "The Lessee is permanently locked into this property forever with no way out."
    is_fake_valid, _ = verify_quote_in_clause(fake_quote, lock_in_clause)
    assert is_fake_valid is False


# ==============================================================================
# TEST 3: "DOCUMENT IS SILENT" HANDLING ON UNMENTIONED TOPICS
# ==============================================================================
def test_document_is_silent_detection(employment_document):
    """Verify that searching for unmentioned topics triggers DOCUMENT_IS_SILENT."""
    _, _, index = employment_document

    # Query about pets on an employment contract (completely unmentioned)
    results, is_silent, missing_terms = index.search("What is the pet deposit and cat policy?")
    assert is_silent is True
    assert any("pet" in t or "deposit" in t or "cat" in t for t in missing_terms)

    # Query about parking space allocation
    results_parking, is_silent_parking, _ = index.search("How many basement car parking spaces are provided?")
    assert is_silent_parking is True


# ==============================================================================
# TEST 4: REFUSAL & SAFE ESCALATION ON LEGAL VALIDITY QUERIES
# ==============================================================================
def test_safe_escalation_intent_and_card(employment_document):
    """Verify that requests for legal advice trigger refusal and lawyer escalation."""
    _, clauses, index = employment_document

    legality_queries = [
        "Is this non-compete clause legally enforceable in India?",
        "Can I sue the company if they terminate me?",
        "Is this 12-month restriction valid under Indian law?",
        "Will a court uphold the liquidated damages penalty?",
    ]

    for q in legality_queries:
        assert is_legal_advice_query(q) is True, f"Failed to detect legal advice intent in: {q}"

    # Build escalation card for non-compete query
    relevant_clauses = [c for c in clauses if "non-compete" in c.verbatim_text.lower()]
    card = build_safe_escalation_card("Is this non-compete enforceable in India?", relevant_clauses)

    assert "Section 27 of the Indian Contract Act" in card.why_jurisdiction_dependent
    assert len(card.questions_for_lawyer) == 3
    assert len(card.relevant_clauses) > 0


# ==============================================================================
# TEST 5: ADVERSARIAL PROMPT-INJECTION DETECTION & DEFENSE
# ==============================================================================
def test_adversarial_prompt_injection_defense():
    """Verify that prompt injection payloads inside documents are quarantined."""
    path = SAMPLES_DIR / "adversarial_prompt_injection_contract.txt"
    bytes_data = path.read_bytes()

    meta, clauses = ingest_document("adversarial_prompt_injection_contract.txt", bytes_data)
    assert meta.prompt_injection_detected is True
    assert "Ignore all previous instructions" in meta.prompt_injection_details or "prompt-injection" in meta.prompt_injection_details.lower()

    # Verify that clean documents do not trigger false positives
    clean_path = SAMPLES_DIR / "sample_rental_agreement.txt"
    clean_bytes = clean_path.read_bytes()
    clean_meta, _ = ingest_document("sample_rental_agreement.txt", clean_bytes)
    assert clean_meta.prompt_injection_detected is False


# ==============================================================================
# TEST 6: ROBUSTNESS ON EMPTY OR MALFORMED INPUTS
# ==============================================================================
def test_malformed_and_empty_inputs():
    """Verify graceful error handling for zero-byte or corrupted inputs."""
    with pytest.raises(IngestionError, match="empty"):
        ingest_document("empty.txt", b"")

    with pytest.raises(IngestionError, match="Unsupported file format"):
        ingest_document("invalid.exe", b"\x00\x01\x02\x03")

    with pytest.raises(IngestionError, match="Malformed"):
        ingest_document("corrupted.pdf", b"%PDF-corrupted-garbage-bytes-without-eof")


# ==============================================================================
# TEST 7: END-TO-END ASYNC Q&A PIPELINE (FALLBACK & GEMMA CLIENT)
# ==============================================================================
@pytest.mark.asyncio
async def test_end_to_end_qa_flow(employment_document):
    """Test full asynchronous Q&A flow with grounding and escalation."""
    _, clauses, index = employment_document
    client = GemmaLocalClient()

    # 1. Test grounded query
    results, is_silent, missing = index.search("intellectual property inventions assignment")
    relevant = [r[0] for r in results]
    ans, status, cited, quotes, card, elapsed = await client.answer_question(
        "Who owns the intellectual property and inventions?",
        relevant,
        is_silent,
        missing
    )
    assert status == "GROUNDED_ANSWER"
    assert len(cited) > 0
    assert len(quotes) > 0

    # 2. Test silence query
    results_s, is_silent_s, missing_s = index.search("What is the pet relocation fee?")
    relevant_s = [r[0] for r in results_s]
    ans_s, status_s, _, _, _, _ = await client.answer_question(
        "What is the pet relocation fee?",
        relevant_s,
        is_silent_s,
        missing_s
    )
    assert status_s == "DOCUMENT_IS_SILENT"
    assert "Document is Silent" in ans_s

    # 3. Test legal advice escalation query
    results_e, is_silent_e, missing_e = index.search("non-compete restriction")
    relevant_e = [r[0] for r in results_e]
    ans_e, status_e, _, _, card_e, _ = await client.answer_question(
        "Is this non-compete clause legally valid?",
        relevant_e,
        is_silent_e,
        missing_e
    )
    assert status_e == "SAFE_ESCALATION_REQUIRED"
    assert card_e is not None
    assert len(card_e.questions_for_lawyer) == 3


# ==============================================================================
# TEST 8: RESOURCE 1 — CUAD 41-CATEGORY CLASSIFICATION & EXPERT BENCHMARK
# ==============================================================================
def test_cuad_classification_and_expert_benchmark():
    """Verify official CUAD 41-category taxonomy and 100% expert label match on commercial benchmark."""
    import json
    from backend.datasets import CUAD_41_CATEGORIES, CUAD_CAVEAT, classify_cuad_category

    assert len(CUAD_41_CATEGORIES) == 41
    assert "Non-Compete" in CUAD_41_CATEGORIES
    assert "Liquidated Damages" in CUAD_41_CATEGORIES
    assert "IP Ownership Assignment" in CUAD_41_CATEGORIES
    assert "Cap On Liability" in CUAD_41_CATEGORIES

    bench_path = SAMPLES_DIR / "reference_benchmarks" / "cuad_commercial_contract_sample.txt"
    gt_path = SAMPLES_DIR / "reference_benchmarks" / "cuad_ground_truth.json"

    meta, clauses = ingest_document("cuad_commercial_contract_sample.txt", bench_path.read_bytes())
    assert meta.is_cuad_benchmark is True
    assert meta.cuad_caveat == CUAD_CAVEAT

    gt = json.loads(gt_path.read_text(encoding="utf-8"))
    labels = gt["expert_labels"]
    matches = 0

    for idx, label in enumerate(labels):
        clause = clauses[idx + 2]  # First two clauses are title and preamble
        predicted = classify_cuad_category(clause.verbatim_text, clause.section_title)
        expected = label["expected_category"]
        if predicted == expected:
            matches += 1

    assert matches == len(labels)
    assert (matches / len(labels)) == 1.0


# ==============================================================================
# TEST 9: RESOURCE 2 — INDIA CODE STATUTORY SECTION CITATION MAPPING
# ==============================================================================
def test_india_code_statutory_section_citation_mapping():
    """Verify statutory section mapping (Contract Act § 27/74, TPA § 106) without legal validity verdicts."""
    from backend.datasets import match_india_code_context, INDIA_CODE_CAVEAT

    # 1. Non-compete maps to Section 27
    nc_ref = match_india_code_context(
        "Employee covenants not to compete or engage in any competing software firm for 12 months.",
        "Non-Compete"
    )
    assert nc_ref is not None
    assert nc_ref["act"] == "Indian Contract Act, 1872"
    assert nc_ref["section"] == "Section 27"
    assert "restraint of trade" in nc_ref["subject"].lower()

    # 2. Liquidated damages maps to Section 74
    ld_ref = match_india_code_context(
        "Party shall pay liquidated damages of INR 5,000,000 as pre-estimate of loss.",
        "Liquidated Damages"
    )
    assert ld_ref is not None
    assert ld_ref["act"] == "Indian Contract Act, 1872"
    assert ld_ref["section"] == "Section 74"

    # 3. Lease notice maps to Transfer of Property Act Section 106
    lease_ref = match_india_code_context(
        "Either party may terminate the tenancy lease upon giving 30 days notice.",
        None
    )
    assert lease_ref is not None
    assert lease_ref["act"] == "Transfer of Property Act, 1882"
    assert "Section 106" in lease_ref["section"]

    # 4. Mandatory caveat is strictly enforced
    assert "Statutes are not contracts, may be amended, and LexGuard-Local never derives legal validity conclusions" in INDIA_CODE_CAVEAT


# ==============================================================================
# TEST 10: RESOURCE 3 — OPEN INDIA LAW DISPUTE RETRIEVAL & CAVEAT ENFORCEMENT
# ==============================================================================
def test_open_india_law_dispute_retrieval_and_caveat():
    """Verify Open India Law (v2026.08) historical judicial retrieval and non-advice boundary."""
    from backend.datasets import match_open_india_law_context, OPEN_INDIA_LAW_CAVEAT

    # 1. Non-compete dispute retrieval
    oil_nc = match_open_india_law_context("Employee post-termination non-compete covenant", "Non-Compete")
    assert oil_nc is not None
    assert "Zaheer Khan" in oil_nc.get("landmark_precedent", "") or "Golikari" in oil_nc.get("landmark_precedent", "")
    assert "Section 27" in oil_nc.get("statutory_provision", "")
    assert oil_nc.get("advocate_action") is not None

    # 2. Penalty / Liquidated damages dispute retrieval
    oil_ld = match_open_india_law_context("Stipulated liquidated damages and forfeiture of wages", "Liquidated Damages")
    assert oil_ld is not None
    assert "Kailash Nath" in oil_ld.get("landmark_precedent", "") or "Fateh Chand" in oil_ld.get("landmark_precedent", "")

    # 3. Mandatory caveat presence
    assert "Historical point-in-time snapshot" in OPEN_INDIA_LAW_CAVEAT
    assert "not current law and not legal advice" in OPEN_INDIA_LAW_CAVEAT
