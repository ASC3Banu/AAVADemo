"""Unit tests for Analytics Service"""
import pytest
from datetime import datetime, timedelta
from src.services.analytics_service import AnalyticsService

class TestAnalyticsService:
    @pytest.mark.asyncio
    async def test_get_performance_metrics(self):
        service = AnalyticsService()
        start_date = datetime.utcnow() - timedelta(days=30)
        end_date = datetime.utcnow()
        result = await service.get_performance_metrics(user_id="test-user", start_date=start_date, end_date=end_date, metric_type=None)
        assert result is not None
        assert "metrics" in result.dict()
        assert "period" in result.dict()