"""Audit Logger - Comprehensive audit logging for compliance"""
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, Optional
import json

logger = logging.getLogger(__name__)

class AuditLogger:
    def __init__(self):
        self.audit_log = logging.getLogger("audit")
        handler = logging.FileHandler("logs/audit.log")
        handler.setFormatter(logging.Formatter('%(message)s'))
        self.audit_log.addHandler(handler)
        self.audit_log.setLevel(logging.INFO)
    
    def generate_request_id(self) -> str:
        return str(uuid.uuid4())
    
    async def log_api_request(self, request_id: str, method: str, path: str, client_ip: str, user_agent: str) -> None:
        self._log_event({
            "event_type": "API_REQUEST",
            "request_id": request_id,
            "method": method,
            "path": path,
            "client_ip": client_ip,
            "user_agent": user_agent,
        })
    
    async def log_api_response(self, request_id: str, status_code: int) -> None:
        self._log_event({
            "event_type": "API_RESPONSE",
            "request_id": request_id,
            "status_code": status_code,
        })
    
    async def log_api_error(self, request_id: str, error: str) -> None:
        self._log_event({
            "event_type": "API_ERROR",
            "request_id": request_id,
            "error": error,
        })
    
    async def log_authentication_attempt(self, request_id: str, email: str, client_ip: str) -> None:
        self._log_event({
            "event_type": "AUTH_ATTEMPT",
            "request_id": request_id,
            "email": email,
            "client_ip": client_ip,
        })
    
    async def log_authentication_success(self, request_id: str, user_id: str, email: str) -> None:
        self._log_event({
            "event_type": "AUTH_SUCCESS",
            "request_id": request_id,
            "user_id": user_id,
            "email": email,
        })
    
    async def log_authentication_failure(self, request_id: str, email: str, reason: str) -> None:
        self._log_event({
            "event_type": "AUTH_FAILURE",
            "request_id": request_id,
            "email": email,
            "reason": reason,
        })
    
    async def log_data_access(self, request_id: str, resource_type: str, resource_id: str = None, user_id: str = None, details: Dict = None) -> None:
        self._log_event({
            "event_type": "DATA_ACCESS",
            "request_id": request_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "user_id": user_id,
            "details": details,
        })
    
    async def log_data_operation(self, request_id: str, operation: str, user_id: str, resource_type: str, resource_id: str = None) -> None:
        self._log_event({
            "event_type": "DATA_OPERATION",
            "request_id": request_id,
            "operation": operation,
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
        })
    
    async def log_data_created(self, request_id: str, resource_type: str, resource_id: str, user_id: str) -> None:
        self._log_event({
            "event_type": "DATA_CREATED",
            "request_id": request_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "user_id": user_id,
        })
    
    async def log_system_event(self, event_type: str, details: Dict) -> None:
        self._log_event({
            "event_type": event_type,
            "details": details,
        })
    
    def _log_event(self, event: Dict[str, Any]) -> None:
        event["timestamp"] = datetime.utcnow().isoformat()
        self.audit_log.info(json.dumps(event))