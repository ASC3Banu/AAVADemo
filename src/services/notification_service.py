"""Notification Service - Business logic for notifications"""
import logging
from uuid import uuid4
from src.models.notification_models import NotificationListResponse, SubscriptionRequest, SubscriptionResponse
from src.repositories.notification_repository import NotificationRepository

logger = logging.getLogger(__name__)
notification_repository = NotificationRepository()

class NotificationService:
    async def create_subscription(self, subscription_data: SubscriptionRequest, user_id: str) -> SubscriptionResponse:
        subscription_id = str(uuid4())
        await notification_repository.create_subscription(subscription_id=subscription_id, data=subscription_data, user_id=user_id)
        return SubscriptionResponse(subscription_id=subscription_id, shipment_id=subscription_data.shipment_id, status="active")
    
    async def get_notifications(self, user_id: str, unread_only: bool, page: int, page_size: int) -> NotificationListResponse:
        offset = (page - 1) * page_size
        notifications, total = await notification_repository.get_notifications(user_id=user_id, unread_only=unread_only, offset=offset, limit=page_size)
        total_pages = (total + page_size - 1) // page_size
        return NotificationListResponse(data=notifications, pagination={"page": page, "page_size": page_size, "total_pages": total_pages, "total_items": total})