import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from fastapi import Depends, HTTPException, status

AES_KEY = os.environ.get("AES_KEY", "0123456789abcdef0123456789abcdef")

class RBACRoles:
    roles = {"admin": ["generate-api", "validate-specification", "get-audit-logs"], "developer": ["generate-api", "validate-specification"], "auditor": ["get-audit-logs"]}
    @staticmethod
    def has_access(user, action):
        return user.role in RBACRoles.roles and action in RBACRoles.roles[user.role]

def get_current_user(request):
    # OAuth2/JWT validation (placeholder)
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    # Simulate user extraction
    class User: pass
    user = User()
    user.username = "demo"
    user.role = "developer"  # Should parse from JWT
    return user

def encrypt_data(data):
    # AES-256 encryption
    cipher = Cipher(algorithms.AES(AES_KEY.encode()), modes.CFB(b"0123456789abcdef"))
    encryptor = cipher.encryptor()
    return base64.b64encode(encryptor.update(data) + encryptor.finalize())

def filter_sensitive_data(data):
    # Remove/filter PII/PHI/PCI fields (placeholder)
    if isinstance(data, dict):
        return {k: ("***" if k.lower() in ["ssn", "credit_card", "email"] else v) for k, v in data.items()}
    return data
