"""Official PS2 Reference Datasets Integration Layer.

Resource 1: CUAD (Hendrycks et al., NeurIPS 2021) — CC BY 4.0
Resource 2: India Code (indiacode.gov.in) — Statutory Context
Resource 3: Open India Law (vaquill/open-india-law v2026.08) — CC BY 4.0
"""
from backend.datasets.cuad_taxonomy import (
    CUAD_41_CATEGORIES,
    CUAD_CAVEAT,
    classify_cuad_category,
)
from backend.datasets.indiacode_statutes import (
    INDIA_CODE_CAVEAT,
    INDIA_CODE_DATABASE,
    match_india_code_context,
)
from backend.datasets.open_india_law import (
    OPEN_INDIA_LAW_CAVEAT,
    match_open_india_law_context,
)

__all__ = [
    "CUAD_41_CATEGORIES",
    "CUAD_CAVEAT",
    "classify_cuad_category",
    "INDIA_CODE_CAVEAT",
    "INDIA_CODE_DATABASE",
    "match_india_code_context",
    "OPEN_INDIA_LAW_CAVEAT",
    "match_open_india_law_context",
]
