"""Integration Service - Business logic for integrations"""
import logging
from uuid import uuid4
from src.models.integration_models import ExternalSystemRequest, ExternalSystemResponse, WebhookRequest, WebhookResponse
from src.repositories.integration_repository import IntegrationRepository
from src.resources.encryption_service import EncryptionService

logger = logging.getLogger(__name__)
integration_repository = IntegrationRepository()
encryption_service = EncryptionService()

class IntegrationService:
    async def register_webhook(self, webhook_data: WebhookRequest, user_id: str) -> WebhookResponse:
        webhook_id = str(uuid4())
        encrypted_secret = encryption_service.encrypt(webhook_data.secret) if webhook_data.secret else None
        await integration_repository.register_webhook(webhook_id=webhook_id, url=webhook_data.url, events=webhook_data.events, secret=encrypted_secret, user_id=user_id)
        return WebhookResponse(webhook_id=webhook_id, url=webhook_data.url, status="active")
    
    async def configure_external_system(self, system_data: ExternalSystemRequest, user_id: str) -> ExternalSystemResponse:
        integration_id = str(uuid4())
        encrypted_credentials = encryption_service.encrypt_dict(system_data.credentials)
        await integration_repository.configure_system(integration_id=integration_id, system_type=system_data.system_type, credentials=encrypted_credentials, configuration=system_data.configuration, user_id=user_id)
        return ExternalSystemResponse(integration_id=integration_id, system_type=system_data.system_type, status="active")