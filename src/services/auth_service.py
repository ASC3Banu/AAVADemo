"""Authentication Service - Business logic for authentication and authorization"""
import logging
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from src.configs.app_config import settings
from src.models.auth_models import LoginResponse, User, UserInDB
from src.repositories.user_repository import UserRepository
from src.resources.encryption_service import EncryptionService

logger = logging.getLogger(__name__)
security = HTTPBearer()
user_repository = UserRepository()
encryption_service = EncryptionService()

class AuthService:
    async def authenticate(self, email: str, password: str, mfa_code: Optional[str], client_ip: str) -> LoginResponse:
        user_db = await user_repository.get_by_email(email)
        if not user_db or not self._verify_password(password, user_db.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}})
        if user_db.mfa_enabled and not mfa_code:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"error": {"code": "MFA_REQUIRED", "message": "MFA code required"}})
        if user_db.mfa_enabled and not self._verify_mfa(mfa_code, user_db.mfa_secret):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"error": {"code": "INVALID_MFA", "message": "Invalid MFA code"}})
        access_token = self._create_access_token(user_db.id, user_db.roles)
        refresh_token = self._create_refresh_token(user_db.id)
        await user_repository.update_last_login(user_db.id, client_ip)
        return LoginResponse(access_token=access_token, refresh_token=refresh_token, token_type="Bearer", expires_in=900, user=User(id=user_db.id, email=user_db.email, name=user_db.name, roles=user_db.roles))
    
    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def _verify_mfa(self, code: str, secret: str) -> bool:
        import pyotp
        totp = pyotp.TOTP(secret)
        return totp.verify(code)
    
    def _create_access_token(self, user_id: str, roles: list) -> str:
        expire = datetime.utcnow() + timedelta(minutes=15)
        payload = {"sub": user_id, "roles": roles, "exp": expire, "type": "access"}
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")
    
    def _create_refresh_token(self, user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(days=7)
        payload = {"sub": user_id, "exp": expire, "type": "refresh"}
        return jwt.encode(payload, settings.JWT_REFRESH_SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = await user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return User(id=user.id, email=user.email, name=user.name, roles=user.roles)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")