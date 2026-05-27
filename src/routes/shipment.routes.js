const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment.controller');
const AuthMiddleware = require('../middleware/authentication');
const ValidationMiddleware = require('../middleware/validation');
const CacheMiddleware = require('../middleware/cache');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(AuthMiddleware.authenticate);
router.use(apiLimiter);

router.get(
  '/',
  AuthMiddleware.authorize('logistics_manager', 'supply_chain_analyst', 'business_owner', 'admin'),
  CacheMiddleware.cache(300),
  shipmentController.getAllShipments
);

router.post(
  '/',
  AuthMiddleware.authorize('logistics_manager', 'admin'),
  ValidationMiddleware.validateShipmentCreate,
  shipmentController.createShipment
);

router.get(
  '/statistics',
  AuthMiddleware.authorize('supply_chain_analyst', 'business_owner', 'admin'),
  CacheMiddleware.cache(300),
  shipmentController.getShipmentStatistics
);

router.get(
  '/tracking/:trackingNumber',
  CacheMiddleware.cache(60),
  shipmentController.getShipmentByTrackingNumber
);

router.get(
  '/:id',
  CacheMiddleware.cache(60),
  shipmentController.getShipmentById
);

router.put(
  '/:id',
  AuthMiddleware.authorize('logistics_manager', 'admin'),
  ValidationMiddleware.validateShipmentUpdate,
  shipmentController.updateShipment
);

router.delete(
  '/:id',
  AuthMiddleware.authorize('admin'),
  shipmentController.deleteShipment
);

module.exports = router;