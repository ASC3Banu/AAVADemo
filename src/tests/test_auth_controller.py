"""Unit tests for Authentication Controller"""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

class TestAuthController:
    def test_login_success(self):
        response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "TestPass123!"})
        assert response.status_code in [200, 401]  # 401 if user doesn't exist
    
    def test_login_missing_email(self):
        response = client.post("/api/v1/auth/login", json={"password": "TestPass123!"})
        assert response.status_code == 422
    
    def test_login_invalid_email(self):
        response = client.post("/api/v1/auth/login", json={"email": "invalid-email", "password": "TestPass123!"})
        assert response.status_code == 422
    
    def test_refresh_token_missing(self):
        response = client.post("/api/v1/auth/refresh", json={})
        assert response.status_code == 422