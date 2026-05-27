const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const AuthMiddleware = require('../middleware/authentication');
const ValidationMiddleware = require('../middleware/validation');
const CacheMiddleware = require('../middleware/cache');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(AuthMiddleware.authenticate);
router.use(apiLimiter);

router.get(
  '/',
  AuthMiddleware.authorize('logistics_manager', 'supply_chain_analyst', 'business_owner', 'admin'),
  CacheMiddleware.cache(30),
  alertController.getAllAlerts
);

router.get(
  '/count',
  CacheMiddleware.cache(30),
  alertController.getActiveAlertsCount
);

router.get(
  '/:id',
  CacheMiddleware.cache(30),
  alertController.getAlertById
);

router.post(
  '/:id/acknowledge',
  AuthMiddleware.authorize('logistics_manager', 'supply_chain_analyst', 'admin'),
  ValidationMiddleware.validateAlertAcknowledge,
  alertController.acknowledgeAlert
);

router.post(
  '/:id/resolve',
  AuthMiddleware.authorize('logistics_manager', 'admin'),
  alertController.resolveAlert
);

router.post(
  '/:id/dismiss',
  AuthMiddleware.authorize('logistics_manager', 'admin'),
  alertController.dismissAlert
);

module.exports = router;