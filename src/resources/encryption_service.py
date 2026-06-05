"""Encryption Service - AES-256 encryption for sensitive data"""
import logging
import base64
from typing import Any, Dict
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from src.configs.app_config import settings
import json

logger = logging.getLogger(__name__)

class EncryptionService:
    def __init__(self):
        self.fernet = None
    
    def initialize(self) -> None:
        if settings.ENCRYPTION_KEY:
            key = base64.urlsafe_b64encode(settings.ENCRYPTION_KEY.encode()[:32].ljust(32, b'0'))
            self.fernet = Fernet(key)
        else:
            logger.warning("Encryption key not set, using default (NOT FOR PRODUCTION)")
            self.fernet = Fernet(Fernet.generate_key())
    
    def encrypt(self, data: str) -> str:
        if not self.fernet:
            self.initialize()
        encrypted = self.fernet.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        if not self.fernet:
            self.initialize()
        decoded = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = self.fernet.decrypt(decoded)
        return decrypted.decode()
    
    def encrypt_dict(self, data: Dict) -> str:
        json_str = json.dumps(data)
        return self.encrypt(json_str)
    
    def decrypt_dict(self, encrypted_data: str) -> Dict:
        json_str = self.decrypt(encrypted_data)
        return json.loads(json_str)