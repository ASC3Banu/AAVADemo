"""Unit tests for Encryption Service"""
import pytest
from src.resources.encryption_service import EncryptionService

class TestEncryptionService:
    def test_encrypt_decrypt(self):
        service = EncryptionService()
        service.initialize()
        original = "sensitive data"
        encrypted = service.encrypt(original)
        decrypted = service.decrypt(encrypted)
        assert decrypted == original
    
    def test_encrypt_dict(self):
        service = EncryptionService()
        service.initialize()
        original = {"key": "value", "number": 123}
        encrypted = service.encrypt_dict(original)
        decrypted = service.decrypt_dict(encrypted)
        assert decrypted == original