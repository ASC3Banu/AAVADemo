const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const AuthMiddleware = require('../middleware/authentication');
const ValidationMiddleware = require('../middleware/validation');
const CacheMiddleware = require('../middleware/cache');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(AuthMiddleware.authenticate);
router.use(apiLimiter);

router.get(
  '/',
  AuthMiddleware.authorize('logistics_manager', 'supply_chain_analyst', 'business_owner', 'admin'),
  CacheMiddleware.cache(60),
  eventController.getAllEvents
);

router.post(
  '/',
  AuthMiddleware.authorize('logistics_manager', 'admin'),
  ValidationMiddleware.validateEventCreate,
  eventController.createEvent
);

router.get(
  '/shipment/:shipmentId',
  CacheMiddleware.cache(60),
  eventController.getEventsByShipmentId
);

router.get(
  '/shipment/:shipmentId/latest',
  CacheMiddleware.cache(30),
  eventController.getLatestEvent
);

module.exports = router;