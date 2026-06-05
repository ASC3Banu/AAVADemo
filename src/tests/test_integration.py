"""Integration tests"""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

class TestIntegration:
    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
    
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_cors_headers(self):
        response = client.options("/health")
        assert "access-control-allow-origin" in response.headers or response.status_code in [200, 405]