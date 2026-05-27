const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const shipmentRoutes = require('./shipment.routes');
const eventRoutes = require('./event.routes');
const alertRoutes = require('./alert.routes');
const predictionRoutes = require('./prediction.routes');
const dashboardRoutes = require('./dashboard.routes');

router.use('/auth', authRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/events', eventRoutes);
router.use('/alerts', alertRoutes);
router.use('/predictions', predictionRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'logistics-monitoring-api',
    version: '1.0.0'
  });
});

module.exports = router;