"""FastAPI application for LexGuard-Local: 100% Offline Legal Document Triage Agent."""
import gc
import os
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.config import HOST, PORT, STATIC_DIR, MAX_UPLOAD_SIZE_MB
from backend.models import (
    DocumentUploadResponse,
    DocumentMetadata,
    QARequest,
    QAResponse,
    DiffResult,
    PrivacyAuditReport,
    WipeResponse,
)
from backend.ingestion import ingest_document, IngestionError
from backend.retriever import LocalClauseIndex
from backend.gemma_client import GemmaLocalClient
from backend.diff_engine import compare_contracts
from backend.audit import get_privacy_audit_report

# Initialize FastAPI with zero external documentation CDNs (offline docs)
app = FastAPI(
    title="LexGuard-Local",
    description="Privacy-First On-Device Legal Document Triage Agent",
    version="1.0.0",
    docs_url=None,  # Disabled remote Swagger CDN to guarantee zero network calls
    redoc_url=None,
)

# Strict loopback CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory session store (wiped on demand or restart)
class SessionStore:
    def __init__(self):
        self.metadata: Optional[DocumentMetadata] = None
        self.clauses = []
        self.index: Optional[LocalClauseIndex] = None
        self.triage_cards = []
        self.doc_a_clauses = []
        self.doc_b_clauses = []

    def wipe(self):
        self.metadata = None
        self.clauses.clear()
        self.index = None
        self.triage_cards.clear()
        self.doc_a_clauses.clear()
        self.doc_b_clauses.clear()
        gc.collect()

session = SessionStore()
gemma_client = GemmaLocalClient()


@app.middleware("http")
async def add_strict_offline_security_headers(request: Request, call_next):
    """Enforce strict Content-Security-Policy blocking all external network and CDN calls."""
    response = await call_next(request)
    # Disallow all external CDNs, fonts, and scripts
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self' http://127.0.0.1:* http://localhost:*; "
        "font-src 'self';"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.post("/api/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Ingest, parse clauses, detect injections, and build local BM25 index."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name.")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum size of {MAX_UPLOAD_SIZE_MB}MB.")

    try:
        metadata, clauses = ingest_document(file.filename, contents)
    except IngestionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected parsing error: {str(e)}")

    # Update in-memory session index
    session.wipe()
    session.metadata = metadata
    session.clauses = clauses
    session.index = LocalClauseIndex(clauses)

    # Perform triage cards generation
    triage_cards = await gemma_client.triage_document_clauses(clauses)
    session.triage_cards = triage_cards

    return DocumentUploadResponse(
        metadata=metadata,
        clauses=clauses,
        triage_cards=triage_cards,
        message="Document successfully processed and indexed locally.",
    )


@app.post("/api/ask", response_model=QAResponse)
async def ask_question(req: QARequest):
    """Grounded question answering with exact quote verification and safe escalation."""
    if not session.index or not session.clauses:
        raise HTTPException(status_code=400, detail="No document loaded. Please upload a contract first.")

    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Search indexed clauses
    scored_results, is_silent, missing_terms = session.index.search(question, top_k=4)
    relevant_clauses = [item[0] for item in scored_results]

    # 2. Gemma / Fallback Answer Engine
    answer, status, cited_c_ids, verified_quotes, escalation_card, elapsed_ms = (
        await gemma_client.answer_question(question, relevant_clauses, is_silent, missing_terms)
    )

    is_conn, active_model, _ = await gemma_client.check_health()
    model_display = f"Local Gemma ({active_model})" if is_conn else "Local Offline Engine (Deterministic Grounding)"

    return QAResponse(
        question=question,
        answer_markdown=answer,
        status=status,
        cited_clauses=cited_c_ids,
        verified_quotes=verified_quotes,
        escalation_card=escalation_card,
        execution_time_ms=round(elapsed_ms, 2),
        model_used=model_display,
    )


@app.post("/api/diff", response_model=DiffResult)
async def diff_contracts(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...)
):
    """Compare two versions of a contract and identify added/removed/modified clauses."""
    contents_a = await file_a.read()
    contents_b = await file_b.read()

    try:
        meta_a, clauses_a = ingest_document(file_a.filename or "Doc_A", contents_a)
        meta_b, clauses_b = ingest_document(file_b.filename or "Doc_B", contents_b)
    except IngestionError as e:
        raise HTTPException(status_code=400, detail=str(e))

    diff_result = compare_contracts(
        doc_a_name=meta_a.document_name,
        clauses_a=clauses_a,
        doc_b_name=meta_b.document_name,
        clauses_b=clauses_b
    )
    return diff_result


@app.get("/api/privacy-audit", response_model=PrivacyAuditReport)
async def privacy_audit():
    """Real-time process socket inspection and memory usage verification."""
    is_conn, active_model, _ = await gemma_client.check_health()
    return get_privacy_audit_report(is_conn, active_model)


@app.post("/api/wipe", response_model=WipeResponse)
async def wipe_session():
    """Secure one-click purge of all indexed clauses and text from RAM."""
    session.wipe()
    return WipeResponse(
        status="SUCCESS",
        message="All in-memory indexes, clauses, and document texts have been securely purged from RAM."
    )


# Mount static assets if folder exists
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
async def serve_index():
    """Serve the single-page application."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return HTMLResponse(content=index_file.read_text(encoding="utf-8"))
    return HTMLResponse(content="<h1>LexGuard-Local Backend Ready</h1><p>Static UI loading...</p>")


def run():
    """Direct entrypoint for python -m backend.main."""
    import uvicorn
    print(f"Starting LexGuard-Local on http://{HOST}:{PORT}")
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=False, access_log=False)


if __name__ == "__main__":
    run()
