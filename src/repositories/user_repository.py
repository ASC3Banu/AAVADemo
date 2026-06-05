"""User Repository - Database operations for users"""
import logging
from typing import Optional
from src.models.auth_models import UserInDB
from src.configs.database import database_manager

logger = logging.getLogger(__name__)

class UserRepository:
    async def get_by_email(self, email: str) -> Optional[UserInDB]:
        query = "SELECT id, email, name, hashed_password, roles, mfa_enabled, mfa_secret, last_login, last_login_ip FROM users WHERE email = $1"
        row = await database_manager.fetch_one(query, email)
        if row:
            return UserInDB(**dict(row))
        return None
    
    async def get_by_id(self, user_id: str) -> Optional[UserInDB]:
        query = "SELECT id, email, name, hashed_password, roles, mfa_enabled, mfa_secret FROM users WHERE id = $1"
        row = await database_manager.fetch_one(query, user_id)
        if row:
            return UserInDB(**dict(row))
        return None
    
    async def update_last_login(self, user_id: str, ip_address: str) -> None:
        from datetime import datetime
        query = "UPDATE users SET last_login = $1, last_login_ip = $2 WHERE id = $3"
        await database_manager.execute(query, datetime.utcnow().isoformat(), ip_address, user_id)