const alertRepository = require('../repositories/alert.repository');
const { publishEvent, TOPICS } = require('../config/kafka');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');
const CacheMiddleware = require('../middleware/cache');

class AlertService {
  async createAlert(alertData, userId) {
    try {
      const alert = await alertRepository.create(alertData);

      // Publish event to Kafka
      await publishEvent(TOPICS.ALERT_GENERATED, alert.shipmentId, {
        alertId: alert.id,
        shipmentId: alert.shipmentId,
        type: alert.type,
        severity: alert.severity,
        timestamp: new Date().toISOString()
      });

      // Audit log
      AuditLogger.logDataAccess('alert', 'create', userId, {
        alertId: alert.id,
        shipmentId: alert.shipmentId,
        type: alert.type,
        severity: alert.severity
      });

      logger.info('Alert created successfully', { alertId: alert.id });
      return alert;
    } catch (error) {
      logger.error('Error in createAlert service:', error);
      throw error;
    }
  }

  async getAlertById(id, userId) {
    try {
      const alert = await alertRepository.findById(id);
      
      if (!alert) {
        const error = new Error('Alert not found');
        error.status = 404;
        throw error;
      }

      // Audit log
      AuditLogger.logDataAccess('alert', 'read', userId, { alertId: id });

      return alert;
    } catch (error) {
      logger.error('Error in getAlertById service:', error);
      throw error;
    }
  }

  async getAllAlerts(filters, pagination, userId) {
    try {
      const result = await alertRepository.findAll(filters, pagination);

      // Audit log
      AuditLogger.logDataAccess('alert', 'list', userId, {
        filters,
        count: result.totalCount
      });

      return result;
    } catch (error) {
      logger.error('Error in getAllAlerts service:', error);
      throw error;
    }
  }

  async acknowledgeAlert(id, userId, notes) {
    try {
      const alert = await alertRepository.acknowledge(id, userId, notes);

      // Invalidate cache
      await CacheMiddleware.invalidateCache(`cache:/api/v1/alerts/${id}*`);

      // Audit log
      AuditLogger.logDataAccess('alert', 'acknowledge', userId, {
        alertId: id,
        notes
      });

      logger.info('Alert acknowledged successfully', { alertId: id, userId });
      return alert;
    } catch (error) {
      logger.error('Error in acknowledgeAlert service:', error);
      throw error;
    }
  }

  async resolveAlert(id, userId) {
    try {
      const alert = await alertRepository.resolve(id);

      // Invalidate cache
      await CacheMiddleware.invalidateCache(`cache:/api/v1/alerts/${id}*`);

      // Audit log
      AuditLogger.logDataAccess('alert', 'resolve', userId, { alertId: id });

      logger.info('Alert resolved successfully', { alertId: id });
      return alert;
    } catch (error) {
      logger.error('Error in resolveAlert service:', error);
      throw error;
    }
  }

  async dismissAlert(id, userId) {
    try {
      const alert = await alertRepository.dismiss(id);

      // Invalidate cache
      await CacheMiddleware.invalidateCache(`cache:/api/v1/alerts/${id}*`);

      // Audit log
      AuditLogger.logDataAccess('alert', 'dismiss', userId, { alertId: id });

      logger.info('Alert dismissed successfully', { alertId: id });
      return alert;
    } catch (error) {
      logger.error('Error in dismissAlert service:', error);
      throw error;
    }
  }

  async getActiveAlertsCount(shipmentId, userId) {
    try {
      const count = await alertRepository.getActiveAlertsCount(shipmentId);

      // Audit log
      AuditLogger.logDataAccess('alert', 'count', userId, { shipmentId, count });

      return { count };
    } catch (error) {
      logger.error('Error in getActiveAlertsCount service:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();