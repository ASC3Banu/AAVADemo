const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller-complete');
const AuthMiddleware = require('../middleware/authentication');
const CacheMiddleware = require('../middleware/cache');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(AuthMiddleware.authenticate);
router.use(apiLimiter);

router.get(
  '/delay/:shipmentId',
  AuthMiddleware.authorize('logistics_manager', 'supply_chain_analyst', 'business_owner', 'admin'),
  CacheMiddleware.cache(3600),
  predictionController.getDelayPrediction
);

router.get(
  '/route-optimization/:shipmentId',
  AuthMiddleware.authorize('logistics_manager', 'supply_chain_analyst', 'admin'),
  CacheMiddleware.cache(3600),
  predictionController.getRouteOptimization
);

module.exports = router;