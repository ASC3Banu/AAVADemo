"""Notification Models"""
from typing import Dict, List
from pydantic import BaseModel, Field, HttpUrl

class SubscriptionRequest(BaseModel):
    shipment_id: str = Field(..., description="Shipment ID")
    notification_types: List[str] = Field(..., description="Notification types")
    channels: List[str] = Field(..., description="Notification channels")
    webhook_url: HttpUrl = Field(None, description="Webhook URL")

class SubscriptionResponse(BaseModel):
    subscription_id: str
    shipment_id: str
    status: str

class Notification(BaseModel):
    id: str
    type: str
    message: str
    read: bool
    created_at: str

class NotificationListResponse(BaseModel):
    data: List[Notification]
    pagination: Dict[str, int]