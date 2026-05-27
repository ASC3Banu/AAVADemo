import { Request, Response, NextFunction } from 'express';
import { ShipmentService } from '../services/shipment.service';
import { auditLogger } from '../configs/logger.config';

export class ShipmentController {
  private shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  getShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipment_id } = req.params;
      const shipment = await this.shipmentService.getShipmentById(shipment_id);
      
      res.status(200).json(shipment);
    } catch (error) {
      next(error);
    }
  };

  listShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const shipments = await this.shipmentService.listShipments({
        page: Number(page),
        limit: Number(limit),
        status: status as string
      });
      
      res.status(200).json(shipments);
    } catch (error) {
      next(error);
    }
  };

  createShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shipmentData = req.body;
      const shipment = await this.shipmentService.createShipment(shipmentData);
      
      auditLogger.info('Shipment created', { shipmentId: shipment._id, userId: req.user?.id });
      
      res.status(201).json(shipment);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipment_id } = req.params;
      const { status } = req.body;
      const shipment = await this.shipmentService.updateShipmentStatus(shipment_id, status);
      
      auditLogger.info('Shipment status updated', { shipmentId: shipment_id, status, userId: req.user?.id });
      
      res.status(200).json(shipment);
    } catch (error) {
      next(error);
    }
  };
}