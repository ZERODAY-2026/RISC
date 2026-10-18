"""Configuration and offline environment enforcement for LexGuard-Local.

Enforces zero telemetry, offline operations, and local model settings.
"""
import os
from pathlib import Path

# ==============================================================================
# HARDCODED PRIVACY & ZERO TELEMETRY GUARDRAILS (NEVER SEND EXTERNAL PACKETS)
# ==============================================================================
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["DO_NOT_TRACK"] = "1"
os.environ["SCIKIT_LEARN_DATA"] = "/tmp/scikit_learn_data"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["NO_PROXY"] = "127.0.0.1,localhost"

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
SAMPLES_DIR = BASE_DIR / "samples"

# Server Host & Port (Strict loopback only)
HOST = os.getenv("LEXGUARD_HOST", "127.0.0.1")
PORT = int(os.getenv("LEXGUARD_PORT", "8000"))

# Ollama Local Gemma Configuration
# Gemma 3n/4 edge models (e.g., gemma3n:e4b, gemma4:e4b, gemma2:2b, gemma:2b)
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
DEFAULT_GEMMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4:e4b")
FALLBACK_GEMMA_MODELS = [
    "gemma4:e4b",
    "gemma3n:e4b",
    "gemma2:2b",
    "gemma:2b",
    "gemma2:latest",
]

# Ingestion constraints
MAX_UPLOAD_SIZE_MB = 25
ALLOWED_EXTENSIONS = {".pdf", ".txt"}

# Triage & Retrieval Thresholds
# If max BM25 score < SILENCE_BM25_THRESHOLD or query term overlap is zero,
# system deterministically flags "DOCUMENT_IS_SILENT".
SILENCE_BM25_THRESHOLD = 0.85
MAX_SEARCH_RESULTS = 5
TOP_TRIAGE_CLAUSES = 12

# Document Category Scope
SUPPORTED_CATEGORIES = [
    "Rental & Lease Agreement",
    "Employment & Consulting Contract",
    "Legal Notice & Demand",
    "Non-Disclosure Agreement (NDA)",
    "Master Services Agreement (MSA)",
]
