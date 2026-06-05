"""Authentication Models"""
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    mfa_code: Optional[str] = Field(None, description="Multi-factor authentication code")

class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    roles: List[str]

class UserInDB(BaseModel):
    id: str
    email: EmailStr
    name: str
    hashed_password: str
    roles: List[str]
    mfa_enabled: bool = False
    mfa_secret: Optional[str] = None
    last_login: Optional[str] = None
    last_login_ip: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: User

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token to invalidate")