import { Router } from 'express';
import { ShipmentController } from '../controllers/shipment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, createShipmentSchema } from '../middlewares/validation.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const shipmentController = new ShipmentController();

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

router.get('/:shipment_id', authenticate, readLimiter, shipmentController.getShipment);
router.get('/', authenticate, readLimiter, shipmentController.listShipments);
router.post('/', authenticate, authorize('admin', 'manager', 'operator'), writeLimiter, validate(createShipmentSchema), shipmentController.createShipment);
router.patch('/:shipment_id/status', authenticate, authorize('admin', 'manager', 'operator'), writeLimiter, shipmentController.updateStatus);

export { router as shipmentRouter };