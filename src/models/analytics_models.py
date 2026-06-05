"""Analytics Models"""
from typing import Dict, List
from pydantic import BaseModel, Field
from uuid import UUID

class PerformanceMetricsResponse(BaseModel):
    metrics: Dict[str, float] = Field(..., description="Performance metrics")
    period: Dict[str, str] = Field(..., description="Time period")

class PredictionRequest(BaseModel):
    shipment_id: UUID = Field(..., description="Shipment ID")
    prediction_type: str = Field(..., description="Type of prediction")

class PredictionResponse(BaseModel):
    shipment_id: str
    predictions: Dict = Field(..., description="AI predictions")