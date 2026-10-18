"""Tests for backend in-memory AES-256-GCM cryptographic vault and security."""
import pytest
from backend.crypto_vault import EncryptedMemoryVault, compute_sha256, constant_time_compare


def test_vault_encryption_and_decryption():
    vault = EncryptedMemoryVault()
    text = "The Lessee shall not sublet the premises without written consent."
    digest = vault.store_clause("CL-001", text)
    assert len(digest) == 64
    
    decrypted = vault.get_clause("CL-001")
    assert decrypted == text


def test_vault_document_encryption():
    vault = EncryptedMemoryVault()
    doc_bytes = b"BINARY_OR_RAW_CONTRACT_DATA_WITH_SECRETS"
    digest = vault.store_document("doc_1", doc_bytes)
    assert len(digest) == 64

    decrypted = vault.get_document("doc_1")
    assert decrypted == doc_bytes


def test_vault_tamper_detection():
    vault = EncryptedMemoryVault()
    vault.store_clause("CL-TAMPER", "Sensitive employment data")

    # Manually tamper with the in-memory ciphertext
    raw_encrypted = bytearray(vault._encrypted_clauses["CL-TAMPER"])
    raw_encrypted[-1] ^= 0xFF  # Flip a bit in the ciphertext / tag
    vault._encrypted_clauses["CL-TAMPER"] = bytes(raw_encrypted)

    with pytest.raises(Exception):
        vault.get_clause("CL-TAMPER")


def test_vault_secure_wipe_and_rekey():
    vault = EncryptedMemoryVault()
    old_key = vault.key_fingerprint
    vault.store_clause("CL-PURGE", "Data to be purged")
    assert vault.get_clause("CL-PURGE") is not None

    result = vault.secure_wipe()
    assert result["zeroization_complete"] is True
    assert vault.key_fingerprint != old_key
    assert vault.get_clause("CL-PURGE") is None


def test_constant_time_comparison():
    assert constant_time_compare("secret_token_123", "secret_token_123") is True
    assert constant_time_compare("secret_token_123", "wrong_token_456") is False
