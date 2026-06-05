"""Analytics Service - Business logic for analytics and predictions"""
import logging
from datetime import datetime
from typing import Optional
from uuid import UUID
from src.models.analytics_models import PerformanceMetricsResponse, PredictionResponse
from src.repositories.analytics_repository import AnalyticsRepository
from src.resources.ml_service import MLPredictionService

logger = logging.getLogger(__name__)
analytics_repository = AnalyticsRepository()
ml_service = MLPredictionService()

class AnalyticsService:
    async def get_performance_metrics(self, user_id: str, start_date: datetime, end_date: datetime, metric_type: Optional[str]) -> PerformanceMetricsResponse:
        metrics = await analytics_repository.calculate_metrics(user_id=user_id, start_date=start_date, end_date=end_date, metric_type=metric_type)
        return PerformanceMetricsResponse(metrics=metrics, period={"start": start_date.isoformat(), "end": end_date.isoformat()})
    
    async def get_predictions(self, shipment_id: UUID, prediction_type: str, user_id: str) -> Optional[PredictionResponse]:
        shipment_data = await analytics_repository.get_shipment_data(shipment_id)
        if not shipment_data:
            return None
        predictions = await ml_service.predict(shipment_data=shipment_data, prediction_type=prediction_type)
        return PredictionResponse(shipment_id=str(shipment_id), predictions=predictions)