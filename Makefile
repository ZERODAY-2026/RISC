.PHONY: setup run-offline test verify-privacy clean

PYTHON ?= ./venv/bin/python
UVICORN ?= ./venv/bin/uvicorn
PYTEST ?= ./venv/bin/pytest

# Setup target: runs when online to install dependencies
setup:
	@echo "=== Setting up LexGuard-Local ==="
	python3.11 -m venv venv || python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	@echo "Setup complete. Virtual environment ready in ./venv"

# Setup datasets: downloads/verifies reference datasets during online setup (Participant Guide Page 7)
setup-datasets:
	@echo "=== Verifying / Fetching PS2 Reference Datasets (Page 8) ==="
	$(PYTHON) scripts/fetch_reference_datasets.py --verify

# Run target: enforces strict offline environment variables
run-offline:
	@echo "=== Launching LexGuard-Local in Strict Offline Mode ==="
	@ANONYMIZED_TELEMETRY=False \
	HF_HUB_OFFLINE=1 \
	TRANSFORMERS_OFFLINE=1 \
	DO_NOT_TRACK=1 \
	LEXGUARD_OFFLINE=1 \
	$(PYTHON) -m backend.main

# Run automated compliance tests
test:
	@echo "=== Running PS2 Compliance & Verification Test Suite ==="
	$(PYTEST) tests/ -v

# Run the reproducible privacy & network isolation audit script
verify-privacy:
	@echo "=== Executing Privacy & Network Isolation Verification ==="
	bash scripts/verify_privacy.sh

# Clean temporary residues and pycache
clean:
	@echo "=== Cleaning temporary files ==="
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf uploads temp_contracts
