import { Shipment, IShipment } from '../models/shipment.model';
import mongoose from 'mongoose';

export class ShipmentRepository {
  async findById(id: string): Promise<IShipment | null> {
    return await Shipment.findById(id);
  }
  
  async findWithPagination(query: any, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [shipments, total] = await Promise.all([
      Shipment.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Shipment.countDocuments(query)
    ]);
    
    return {
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async create(data: any): Promise<IShipment> {
    return await Shipment.create(data);
  }
  
  async updateStatus(id: string, status: string): Promise<IShipment | null> {
    return await Shipment.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
  }
}