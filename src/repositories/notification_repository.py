"""Notification Repository - Database operations for notifications"""
import logging
from typing import List, Tuple
from src.models.notification_models import Notification, SubscriptionRequest
from src.configs.database import database_manager

logger = logging.getLogger(__name__)

class NotificationRepository:
    async def create_subscription(self, subscription_id: str, data: SubscriptionRequest, user_id: str) -> None:
        from datetime import datetime
        query = "INSERT INTO notification_subscriptions (id, shipment_id, notification_types, channels, webhook_url, user_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
        await database_manager.execute(query, subscription_id, data.shipment_id, data.notification_types, data.channels, str(data.webhook_url) if data.webhook_url else None, user_id, "active", datetime.utcnow())
    
    async def get_notifications(self, user_id: str, unread_only: bool, offset: int, limit: int) -> Tuple[List[Notification], int]:
        where_clause = "user_id = $1" + (" AND read = false" if unread_only else "")
        count_query = f"SELECT COUNT(*) FROM notifications WHERE {where_clause}"
        total = await database_manager.fetch_one(count_query, user_id)
        query = f"SELECT id, type, message, read, created_at FROM notifications WHERE {where_clause} ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        rows = await database_manager.fetch_all(query, user_id, limit, offset)
        notifications = [Notification(id=r['id'], type=r['type'], message=r['message'], read=r['read'], created_at=r['created_at'].isoformat()) for r in rows]
        return notifications, total[0] if total else 0