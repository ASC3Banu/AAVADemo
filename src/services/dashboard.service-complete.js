const shipmentRepository = require('../repositories/shipment.repository-complete');
const alertRepository = require('../repositories/alert.repository');
const eventRepository = require('../repositories/event.repository-complete');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');
const { redisClient } = require('../config/database');

class DashboardService {
  async getDashboardMetrics(filters, userId) {
    try {
      const cacheKey = `dashboard:metrics:${JSON.stringify(filters)}`;
      
      const cachedMetrics = await new Promise((resolve) => {
        redisClient.get(cacheKey, (err, data) => {
          if (err) {
            logger.error('Redis error:', err);
            resolve(null);
          } else {
            resolve(data ? JSON.parse(data) : null);
          }
        });
      });

      if (cachedMetrics) {
        logger.info('Returning cached dashboard metrics');
        return cachedMetrics;
      }

      const shipmentStats = await shipmentRepository.getStatistics(filters);
      const activeAlertsCount = await alertRepository.getActiveAlertsCount();
      const allShipments = await shipmentRepository.findAll(filters, { page: 1, limit: 1000 });

      const metrics = {
        totalShipments: allShipments.totalCount,
        shipmentsByStatus: shipmentStats,
        activeAlerts: activeAlertsCount,
        onTimeDeliveryRate: this.calculateOnTimeRate(allShipments.shipments),
        averageDeliveryTime: this.calculateAverageDeliveryTime(allShipments.shipments),
        timestamp: new Date().toISOString()
      };

      redisClient.setex(cacheKey, 300, JSON.stringify(metrics), (err) => {
        if (err) logger.error('Error caching dashboard metrics:', err);
      });

      AuditLogger.logDataAccess('dashboard', 'metrics', userId, { filters });

      logger.info('Dashboard metrics generated successfully');
      return metrics;
    } catch (error) {
      logger.error('Error in getDashboardMetrics service:', error);
      throw error;
    }
  }

  calculateOnTimeRate(shipments) {
    const delivered = shipments.filter(s => s.status === 'delivered');
    if (delivered.length === 0) return 0;

    const onTime = delivered.filter(s => {
      return s.actualDelivery && s.estimatedDelivery && 
             new Date(s.actualDelivery) <= new Date(s.estimatedDelivery);
    });

    return ((onTime.length / delivered.length) * 100).toFixed(2);
  }

  calculateAverageDeliveryTime(shipments) {
    const delivered = shipments.filter(s => 
      s.status === 'delivered' && s.actualDelivery && s.createdAt
    );

    if (delivered.length === 0) return 0;

    const totalTime = delivered.reduce((sum, s) => {
      const deliveryTime = new Date(s.actualDelivery) - new Date(s.createdAt);
      return sum + deliveryTime;
    }, 0);

    const avgTimeMs = totalTime / delivered.length;
    const avgDays = (avgTimeMs / (1000 * 60 * 60 * 24)).toFixed(2);
    return avgDays;
  }
}

module.exports = new DashboardService();