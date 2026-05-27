const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const AuthMiddleware = require('../middleware/authentication');
const CacheMiddleware = require('../middleware/cache');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(AuthMiddleware.authenticate);
router.use(apiLimiter);

router.get(
  '/metrics',
  AuthMiddleware.authorize('supply_chain_analyst', 'business_owner', 'admin'),
  CacheMiddleware.cache(300),
  dashboardController.getDashboardMetrics
);

module.exports = router;