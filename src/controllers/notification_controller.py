"""Notification Controller - Handles notification subscriptions and retrieval"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from src.models.notification_models import NotificationListResponse, SubscriptionRequest, SubscriptionResponse
from src.resources.audit_logger import AuditLogger
from src.resources.rbac import require_permissions
from src.services.auth_service import get_current_user
from src.services.notification_service import NotificationService

logger = logging.getLogger(__name__)
router = APIRouter()
audit_logger = AuditLogger()
notification_service = NotificationService()

@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
@require_permissions(["notification:create"])
async def create_subscription(request: Request, subscription_data: SubscriptionRequest, current_user=Depends(get_current_user)):
    try:
        request_id = getattr(request.state, "request_id", "unknown")
        await audit_logger.log_data_operation(request_id=request_id, operation="CREATE_SUBSCRIPTION", user_id=current_user.id, resource_type="subscription")
        result = await notification_service.create_subscription(subscription_data=subscription_data, user_id=current_user.id)
        return result
    except Exception as e:
        logger.error(f"Create subscription error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": {"code": "INTERNAL_ERROR", "message": "Failed to create subscription"}})

@router.get("", response_model=NotificationListResponse, status_code=status.HTTP_200_OK)
@require_permissions(["notification:read"])
async def get_notifications(request: Request, unread_only: bool = Query(False), page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), current_user=Depends(get_current_user)):
    try:
        result = await notification_service.get_notifications(user_id=current_user.id, unread_only=unread_only, page=page, page_size=page_size)
        return result
    except Exception as e:
        logger.error(f"Get notifications error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": {"code": "INTERNAL_ERROR", "message": "Failed to retrieve notifications"}})