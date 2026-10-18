#!/usr/bin/env bash
# ==============================================================================
# LexGuard-Local: Run Offline Convenience Launcher
# Enforces zero-cloud privacy environment variables and starts FastAPI server
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

export ANONYMIZED_TELEMETRY=False
export HF_HUB_OFFLINE=1
export TRANSFORMERS_OFFLINE=1
export DO_NOT_TRACK=1
export LEXGUARD_OFFLINE=1
export NO_PROXY="127.0.0.1,localhost"

echo "=== Starting LexGuard-Local in 100% Offline Mode ==="
echo "Binding to http://127.0.0.1:8000 (Loopback only)"
echo "Zero telemetry • Zero external APIs • Local Gemma / Deterministic Grounding"
echo ""

"${ROOT_DIR}/venv/bin/python" -m backend.main
