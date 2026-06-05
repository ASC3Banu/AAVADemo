"""PII Filter - Filter sensitive data from logs and responses"""
import logging
import re
from typing import Any, Dict

logger = logging.getLogger(__name__)

class PIIFilter:
    def __init__(self):
        self.pii_patterns = {
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "phone": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
            "credit_card": r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
        }
        self.pii_fields = ["email", "phone", "ssn", "credit_card", "password", "secret", "token"]
    
    def filter_pii(self, data: Dict[str, Any]) -> Dict[str, Any]:
        filtered = {}
        for key, value in data.items():
            if any(pii_field in key.lower() for pii_field in self.pii_fields):
                filtered[key] = "[REDACTED]"
            elif isinstance(value, dict):
                filtered[key] = self.filter_pii(value)
            elif isinstance(value, str):
                filtered[key] = self._mask_patterns(value)
            else:
                filtered[key] = value
        return filtered
    
    def _mask_patterns(self, text: str) -> str:
        for pattern_name, pattern in self.pii_patterns.items():
            text = re.sub(pattern, f"[{pattern_name.upper()}_REDACTED]", text)
        return text