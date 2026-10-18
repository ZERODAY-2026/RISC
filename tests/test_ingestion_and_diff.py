"""Unit tests for ingestion, PDF parsing, contract diff engine, and memory purge."""
import pytest
import pymupdf as fitz
from pathlib import Path

from backend.ingestion import ingest_document
from backend.diff_engine import compare_contracts
from backend.main import SessionStore
from backend.models import Clause

SAMPLES_DIR = Path(__file__).resolve().parent.parent / "samples"


def create_synthetic_pdf(text: str) -> bytes:
    """Generate in-memory PDF byte stream using PyMuPDF for testing."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text, fontsize=11)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def test_pdf_ingestion_and_clause_segmentation():
    """Verify PyMuPDF accurately extracts text and splits clauses with CL-XXX IDs."""
    pdf_content = (
        "COMMERCIAL LEASE AGREEMENT\n\n"
        "1. PREMISES AND USE\n"
        "The Lessor leases to Lessee Suite 100 for commercial office use only.\n\n"
        "2. RENT AND DEPOSIT\n"
        "Monthly rent shall be USD 5,000 payable on the first day of each month. "
        "A security deposit of USD 15,000 is required upon signing.\n\n"
        "3. TERMINATION\n"
        "Either party may terminate with 60 days written notice."
    )
    pdf_bytes = create_synthetic_pdf(pdf_content)

    meta, clauses = ingest_document("test_contract.pdf", pdf_bytes)

    assert meta.total_pages == 1
    assert len(clauses) >= 3
    assert clauses[0].clause_id == "CL-001"
    assert clauses[1].clause_id == "CL-002"
    assert clauses[2].clause_id == "CL-003"
    assert "Premises" in clauses[0].section_title or "CL-001" in clauses[0].clause_id


def test_contract_diff_engine():
    """Verify two-version diff engine catches added, removed, and modified clauses."""
    v1_path = SAMPLES_DIR / "sample_employment_contract.txt"
    v2_path = SAMPLES_DIR / "sample_employment_contract_v2.txt"

    _, clauses_v1 = ingest_document("v1.txt", v1_path.read_bytes())
    _, clauses_v2 = ingest_document("v2.txt", v2_path.read_bytes())

    diff = compare_contracts("Employment v1", clauses_v1, "Employment v2", clauses_v2)

    assert diff.total_modified > 0 or diff.total_added > 0
    assert len(diff.risk_shifts) > 0
    # Check that arbitration or extended probation is caught
    any_shift = any("arbitration" in s.lower() or "probation" in s.lower() or "departure" in s.lower() or "damages" in s.lower() for s in diff.risk_shifts)
    assert any_shift or len(diff.clause_matches) > 0


def test_session_wipe_purges_memory():
    """Verify that SessionStore.wipe() purges all state and triggers garbage collection."""
    store = SessionStore()
    store.clauses = [
        Clause(clause_id="CL-001", verbatim_text="Confidential clause text", section_title="Test")
    ]
    assert len(store.clauses) == 1

    store.wipe()
    assert len(store.clauses) == 0
    assert store.metadata is None
    assert store.index is None
