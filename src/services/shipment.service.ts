import { Shipment, IShipment } from '../models/shipment.model';
import { ShipmentRepository } from '../repositories/shipment.repository';
import { logger, dataLineageLogger } from '../configs/logger.config';

export class ShipmentService {
  private shipmentRepository: ShipmentRepository;
  
  constructor() {
    this.shipmentRepository = new ShipmentRepository();
  }
  
  async getShipmentById(shipmentId: string): Promise<IShipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    dataLineageLogger.info('Shipment accessed', { shipmentId, action: 'read' });
    
    return shipment;
  }
  
  async listShipments(filters: any): Promise<any> {
    const { page, limit, status } = filters;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    const shipments = await this.shipmentRepository.findWithPagination(query, page, limit);
    
    return shipments;
  }
  
  async createShipment(shipmentData: any): Promise<IShipment> {
    const trackingNumber = this.generateTrackingNumber();
    
    const shipment = await this.shipmentRepository.create({
      ...shipmentData,
      trackingNumber,
      status: 'pending'
    });
    
    dataLineageLogger.info('Shipment created', { shipmentId: shipment._id, action: 'create' });
    
    return shipment;
  }
  
  async updateShipmentStatus(shipmentId: string, status: string): Promise<IShipment> {
    const shipment = await this.shipmentRepository.updateStatus(shipmentId, status);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    dataLineageLogger.info('Shipment status updated', { shipmentId, status, action: 'update' });
    
    return shipment;
  }
  
  private generateTrackingNumber(): string {
    return `TRK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}