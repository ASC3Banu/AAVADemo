"""Shipment Models"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from uuid import UUID

class Address(BaseModel):
    address: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    country: str = Field(..., description="Country")
    postal_code: str = Field(..., description="Postal code")

class PackageDimensions(BaseModel):
    length: Optional[float] = Field(None, description="Length in cm")
    width: Optional[float] = Field(None, description="Width in cm")
    height: Optional[float] = Field(None, description="Height in cm")

class PackageDetails(BaseModel):
    weight: float = Field(..., description="Weight in kg")
    dimensions: Optional[PackageDimensions] = None

class CreateShipmentRequest(BaseModel):
    tracking_number: Optional[str] = Field(None, description="Custom tracking number")
    origin: Address
    destination: Address
    carrier_id: str = Field(..., description="Carrier identifier")
    service_type: str = Field(..., description="Service type")
    package_details: PackageDetails

class ShipmentResponse(BaseModel):
    id: str
    tracking_number: str
    status: str
    created_at: str
    _links: Dict[str, str]

class ShipmentSummary(BaseModel):
    id: str
    tracking_number: str
    status: str
    origin_city: str
    destination_city: str
    created_at: str

class ShipmentDetail(BaseModel):
    id: str
    tracking_number: str
    status: str
    current_location: Optional[Dict] = None
    origin: Address
    destination: Address
    carrier: Dict
    events: List[Dict]

class ShipmentListResponse(BaseModel):
    data: List[ShipmentSummary]
    pagination: Dict[str, int]