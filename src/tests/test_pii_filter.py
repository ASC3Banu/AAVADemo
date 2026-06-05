"""Unit tests for PII Filter"""
import pytest
from src.resources.pii_filter import PIIFilter

class TestPIIFilter:
    def test_filter_email(self):
        filter_service = PIIFilter()
        data = {"email": "test@example.com", "name": "John Doe"}
        filtered = filter_service.filter_pii(data)
        assert filtered["email"] == "[REDACTED]"
        assert filtered["name"] == "John Doe"
    
    def test_filter_nested_dict(self):
        filter_service = PIIFilter()
        data = {"user": {"email": "test@example.com", "phone": "123-456-7890"}, "id": "123"}
        filtered = filter_service.filter_pii(data)
        assert filtered["user"]["email"] == "[REDACTED]"
        assert filtered["id"] == "123"