"""Integration Repository - Database operations for integrations"""
import logging
from typing import Dict, List
from src.configs.database import database_manager

logger = logging.getLogger(__name__)

class IntegrationRepository:
    async def register_webhook(self, webhook_id: str, url: str, events: List[str], secret: str, user_id: str) -> None:
        from datetime import datetime
        query = "INSERT INTO webhooks (id, url, events, secret, user_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)"
        await database_manager.execute(query, webhook_id, url, events, secret, user_id, "active", datetime.utcnow())
    
    async def configure_system(self, integration_id: str, system_type: str, credentials: Dict, configuration: Dict, user_id: str) -> None:
        from datetime import datetime
        query = "INSERT INTO external_integrations (id, system_type, credentials, configuration, user_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)"
        await database_manager.execute(query, integration_id, system_type, credentials, configuration, user_id, "active", datetime.utcnow())