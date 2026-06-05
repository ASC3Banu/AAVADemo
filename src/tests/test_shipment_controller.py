"""Unit tests for Shipment Controller"""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

class TestShipmentController:
    def test_create_shipment_unauthorized(self):
        response = client.post("/api/v1/shipments", json={"origin": {"address": "123 Main St", "city": "NYC", "country": "USA", "postal_code": "10001"}, "destination": {"address": "456 Elm St", "city": "LA", "country": "USA", "postal_code": "90001"}, "carrier_id": "carrier1", "service_type": "express", "package_details": {"weight": 5.0}})
        assert response.status_code == 403  # No auth token
    
    def test_list_shipments_unauthorized(self):
        response = client.get("/api/v1/shipments")
        assert response.status_code == 403
    
    def test_get_shipment_invalid_id(self):
        response = client.get("/api/v1/shipments/invalid-uuid")
        assert response.status_code in [403, 422]