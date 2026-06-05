"""Shipment Repository - Database operations for shipments"""
import logging
from typing import List, Optional, Tuple
from uuid import UUID
from src.models.shipment_models import CreateShipmentRequest, ShipmentDetail, ShipmentSummary
from src.configs.database import database_manager
from src.resources.pii_filter import PIIFilter

logger = logging.getLogger(__name__)
pii_filter = PIIFilter()

class ShipmentRepository:
    async def create(self, shipment_id: str, tracking_number: str, data: CreateShipmentRequest, user_id: str):
        from datetime import datetime
        query = """INSERT INTO shipments (id, tracking_number, origin, destination, carrier_id, service_type, package_details, status, user_id, created_at) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING created_at"""
        created_at = await database_manager.fetch_one(query, shipment_id, tracking_number, data.origin.dict(), data.destination.dict(), data.carrier_id, data.service_type, data.package_details.dict(), "created", user_id, datetime.utcnow())
        return type('obj', (object,), {'created_at': created_at[0].isoformat() if created_at else datetime.utcnow().isoformat()})()
    
    async def get_by_id(self, shipment_id: UUID, user_id: str) -> Optional[ShipmentDetail]:
        query = "SELECT * FROM shipments WHERE id = $1 AND user_id = $2"
        row = await database_manager.fetch_one(query, str(shipment_id), user_id)
        if row:
            data = dict(row)
            data = pii_filter.filter_pii(data)
            return ShipmentDetail(**data)
        return None
    
    async def list_shipments(self, user_id: str, offset: int, limit: int, status_filter: Optional[str], carrier_id: Optional[str]) -> Tuple[List[ShipmentSummary], int]:
        conditions = ["user_id = $1"]
        params = [user_id]
        param_count = 1
        if status_filter:
            param_count += 1
            conditions.append(f"status = ${param_count}")
            params.append(status_filter)
        if carrier_id:
            param_count += 1
            conditions.append(f"carrier_id = ${param_count}")
            params.append(carrier_id)
        where_clause = " AND ".join(conditions)
        count_query = f"SELECT COUNT(*) FROM shipments WHERE {where_clause}"
        total = await database_manager.fetch_one(count_query, *params)
        params.extend([limit, offset])
        query = f"SELECT id, tracking_number, status, origin, destination, created_at FROM shipments WHERE {where_clause} ORDER BY created_at DESC LIMIT ${param_count + 1} OFFSET ${param_count + 2}"
        rows = await database_manager.fetch_all(query, *params)
        shipments = [ShipmentSummary(id=r['id'], tracking_number=r['tracking_number'], status=r['status'], origin_city=r['origin'].get('city', ''), destination_city=r['destination'].get('city', ''), created_at=r['created_at'].isoformat()) for r in rows]
        return shipments, total[0] if total else 0