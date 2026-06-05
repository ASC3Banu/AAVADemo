"""Shipment Service - Business logic for shipment management"""
import logging
from typing import Optional
from uuid import UUID, uuid4
from src.models.shipment_models import CreateShipmentRequest, ShipmentDetail, ShipmentListResponse, ShipmentResponse
from src.repositories.shipment_repository import ShipmentRepository
from src.resources.data_lineage import DataLineageTracker

logger = logging.getLogger(__name__)
shipment_repository = ShipmentRepository()
lineage_tracker = DataLineageTracker()

class ShipmentService:
    async def create_shipment(self, shipment_data: CreateShipmentRequest, user_id: str) -> ShipmentResponse:
        shipment_id = str(uuid4())
        tracking_number = shipment_data.tracking_number or self._generate_tracking_number()
        await lineage_tracker.track_data_creation(resource_type="shipment", resource_id=shipment_id, user_id=user_id, data=shipment_data.dict())
        result = await shipment_repository.create(shipment_id=shipment_id, tracking_number=tracking_number, data=shipment_data, user_id=user_id)
        return ShipmentResponse(id=shipment_id, tracking_number=tracking_number, status="created", created_at=result.created_at, _links={"self": f"/api/v1/shipments/{shipment_id}", "tracking": f"/api/v1/shipments/{shipment_id}/track"})
    
    async def get_shipment(self, shipment_id: UUID, user_id: str) -> Optional[ShipmentDetail]:
        await lineage_tracker.track_data_access(resource_type="shipment", resource_id=str(shipment_id), user_id=user_id)
        result = await shipment_repository.get_by_id(shipment_id, user_id)
        return result
    
    async def list_shipments(self, user_id: str, page: int, page_size: int, status_filter: Optional[str], carrier_id: Optional[str]) -> ShipmentListResponse:
        offset = (page - 1) * page_size
        shipments, total = await shipment_repository.list_shipments(user_id=user_id, offset=offset, limit=page_size, status_filter=status_filter, carrier_id=carrier_id)
        total_pages = (total + page_size - 1) // page_size
        return ShipmentListResponse(data=shipments, pagination={"page": page, "page_size": page_size, "total_pages": total_pages, "total_items": total})
    
    def _generate_tracking_number(self) -> str:
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))