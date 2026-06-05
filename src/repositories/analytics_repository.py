"""Analytics Repository - Database operations for analytics"""
import logging
from datetime import datetime
from typing import Dict, Optional
from uuid import UUID
from src.configs.database import database_manager

logger = logging.getLogger(__name__)

class AnalyticsRepository:
    async def calculate_metrics(self, user_id: str, start_date: datetime, end_date: datetime, metric_type: Optional[str]) -> Dict[str, float]:
        query = """SELECT 
                   COUNT(*) as total_shipments,
                   AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))/86400) as avg_delivery_time,
                   SUM(CASE WHEN delivered_at <= estimated_delivery THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0) as on_time_rate
                   FROM shipments 
                   WHERE user_id = $1 AND created_at BETWEEN $2 AND $3"""
        row = await database_manager.fetch_one(query, user_id, start_date, end_date)
        if row:
            return {"total_shipments": row[0] or 0, "average_delivery_time": row[1] or 0.0, "on_time_delivery_rate": row[2] or 0.0}
        return {"total_shipments": 0, "average_delivery_time": 0.0, "on_time_delivery_rate": 0.0}
    
    async def get_shipment_data(self, shipment_id: UUID) -> Optional[Dict]:
        query = "SELECT * FROM shipments WHERE id = $1"
        row = await database_manager.fetch_one(query, str(shipment_id))
        return dict(row) if row else None