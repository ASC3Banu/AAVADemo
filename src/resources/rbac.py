"""RBAC - Role-Based Access Control"""
import logging
from typing import List
from functools import wraps
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

ROLE_PERMISSIONS = {
    "admin": ["*"],
    "manager": ["shipment:create", "shipment:read", "shipment:list", "analytics:read", "notification:create", "notification:read"],
    "user": ["shipment:read", "shipment:list", "notification:read"],
    "viewer": ["shipment:read", "shipment:list"],
}

def has_permission(user_roles: List[str], required_permissions: List[str]) -> bool:
    for role in user_roles:
        permissions = ROLE_PERMISSIONS.get(role, [])
        if "*" in permissions:
            return True
        if any(perm in permissions for perm in required_permissions):
            return True
    return False

def require_permissions(required_permissions: List[str]):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if not has_permission(current_user.roles, required_permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator