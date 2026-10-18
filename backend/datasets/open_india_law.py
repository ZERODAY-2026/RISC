"""Open India Law (v2026.08 Snapshot) Retrieval & Legal Context Engine.

Reference: Vaquill Open India Law (https://huggingface.co/datasets/vaquill/open-india-law).
License: Creative Commons Attribution 4.0 International (CC BY 4.0).
Participant Guide Page 8 Resource 3.
Provides historical judicial dispute context and statutory retrieval snapshots (v2026.08),
NOT current law and NOT legal advice.
"""
import json
from pathlib import Path
from typing import Optional, Dict, Any, List

OPEN_INDIA_LAW_CAVEAT = (
    "Open India Law (vaquill/open-india-law v2026.08 — CC BY 4.0): "
    "Historical point-in-time snapshot of Indian enactments & court judgments used for statutory retrieval context; "
    "not current law and not legal advice."
)

_INDEX_FILE = Path(__file__).resolve().parent / "open_india_law_index.json"


def load_open_india_law_index() -> Dict[str, Any]:
    """Load the pre-packaged CC BY 4.0 Open India Law dispute index."""
    if not _INDEX_FILE.exists():
        return {}
    with open(_INDEX_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


_CACHED_INDEX = load_open_india_law_index()


def match_open_india_law_context(clause_text: str, cuad_category: str = None) -> Optional[Dict[str, Any]]:
    """Match clause text against Open India Law judicial dispute benchmarks."""
    text = clause_text.lower()
    cat = (cuad_category or "").lower()
    benchmarks = _CACHED_INDEX.get("dispute_benchmarks", {})

    target_key = None
    if "liquidated damages" in cat:
        target_key = "LIQUIDATED_DAMAGES"
    elif "non-compete" in cat:
        target_key = "NON_COMPETE"
    elif "non-compete" in text or "competing" in text or "restraint of trade" in text:
        target_key = "NON_COMPETE"
    elif "bond" in text or "training cost" in text:
        target_key = "EMPLOYMENT_BOND"
    elif "liquidated damages" in text or ("penalty" in text and "inr" in text):
        target_key = "LIQUIDATED_DAMAGES"
    elif "lock-in" in text or ("lease" in text and "deposit" in text):
        target_key = "TENANCY_DEPOSIT_LOCKIN"
    elif "unilateral" in text or "without assigning any reason" in text:
        target_key = "UNILATERAL_TERMINATION"

    if target_key and target_key in benchmarks:
        data = benchmarks[target_key].copy()
        data["source_snapshot"] = "vaquill/open-india-law (v2026.08)"
        data["license"] = "CC BY 4.0"
        data["caveat"] = OPEN_INDIA_LAW_CAVEAT
        citations = data.get("landmark_citations", [])
        data["landmark_precedent"] = citations[0] if citations else ""
        data["dispute_summary"] = data.get("judicial_consensus_summary", "")
        data["advocate_action"] = data.get("why_advocate_required", "")
        data["statutory_provision"] = data.get("statutory_anchor", "")
        return data

    return None
