"""Security Configuration"""
import os
from typing import List

class SecurityConfig:
    # TLS Configuration
    TLS_VERSION = "1.3"
    CIPHER_SUITES = [
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_128_GCM_SHA256",
    ]
    
    # Encryption
    ENCRYPTION_ALGORITHM = "AES-256-GCM"
    
    # Password Policy
    MIN_PASSWORD_LENGTH = 12
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGITS = True
    REQUIRE_SPECIAL_CHARS = True
    
    # Session Management
    SESSION_TIMEOUT = 900  # 15 minutes
    MAX_SESSIONS_PER_USER = 5
    
    # Security Headers
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
    }
    
    # Compliance
    GDPR_ENABLED = True
    PCI_DSS_ENABLED = True
    SOC2_ENABLED = True
    ISO27001_ENABLED = True
    
    # Audit Logging
    AUDIT_LOG_RETENTION_DAYS = 2555  # 7 years
    AUDIT_LOG_ENCRYPTION = True