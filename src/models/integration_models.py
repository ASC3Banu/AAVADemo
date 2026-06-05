"""Integration Models"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, HttpUrl

class WebhookRequest(BaseModel):
    url: HttpUrl = Field(..., description="Webhook URL")
    events: List[str] = Field(..., description="Event types")
    secret: Optional[str] = Field(None, description="Webhook secret")

class WebhookResponse(BaseModel):
    webhook_id: str
    url: str
    status: str

class ExternalSystemRequest(BaseModel):
    system_type: str = Field(..., description="System type")
    credentials: Dict = Field(..., description="System credentials")
    configuration: Dict = Field(..., description="System configuration")

class ExternalSystemResponse(BaseModel):
    integration_id: str
    system_type: str
    status: str