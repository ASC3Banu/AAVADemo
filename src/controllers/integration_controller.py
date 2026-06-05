"""Integration Controller - Handles webhook and external system integrations"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from src.models.integration_models import ExternalSystemRequest, ExternalSystemResponse, WebhookRequest, WebhookResponse
from src.resources.audit_logger import AuditLogger
from src.resources.rbac import require_permissions
from src.services.auth_service import get_current_user
from src.services.integration_service import IntegrationService

logger = logging.getLogger(__name__)
router = APIRouter()
audit_logger = AuditLogger()
integration_service = IntegrationService()

@router.post("/webhooks", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
@require_permissions(["integration:create"])
async def register_webhook(request: Request, webhook_data: WebhookRequest, current_user=Depends(get_current_user)):
    try:
        request_id = getattr(request.state, "request_id", "unknown")
        await audit_logger.log_data_operation(request_id=request_id, operation="REGISTER_WEBHOOK", user_id=current_user.id, resource_type="webhook")
        result = await integration_service.register_webhook(webhook_data=webhook_data, user_id=current_user.id)
        return result
    except Exception as e:
        logger.error(f"Register webhook error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": {"code": "INTERNAL_ERROR", "message": "Failed to register webhook"}})

@router.post("/external-systems", response_model=ExternalSystemResponse, status_code=status.HTTP_201_CREATED)
@require_permissions(["integration:create"])
async def configure_external_system(request: Request, system_data: ExternalSystemRequest, current_user=Depends(get_current_user)):
    try:
        request_id = getattr(request.state, "request_id", "unknown")
        await audit_logger.log_data_operation(request_id=request_id, operation="CONFIGURE_EXTERNAL_SYSTEM", user_id=current_user.id, resource_type="external_system")
        result = await integration_service.configure_external_system(system_data=system_data, user_id=current_user.id)
        return result
    except Exception as e:
        logger.error(f"Configure external system error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": {"code": "INTERNAL_ERROR", "message": "Failed to configure external system"}})