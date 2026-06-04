import datetime
import json
import threading

_audit_log = []
_audit_lock = threading.Lock()

# PII/PHI/PCI filtering in logs
from src.configs.security import filter_sensitive_data

def log_action(user, action, details=None):
    entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "action": action,
        "user": user if isinstance(user, str) else getattr(user, "username", "system"),
        "details": filter_sensitive_data(details) if details else {}
    }
    with _audit_lock:
        _audit_log.append(entry)

def retrieve_logs(user):
    # Data lineage and consent management
    from src.configs.security import RBACRoles
    if not RBACRoles.has_access(user, "auditor"):
        return []
    with _audit_lock:
        return list(_audit_log)
