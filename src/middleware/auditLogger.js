const logger = require('../utils/logger');
const config = require('../config/env');
const Validator = require('../utils/validator');

class AuditLogger {
  static async logRequest(req, res, next) {
    if (!config.AUDIT_LOG_ENABLED) {
      return next();
    }

    const startTime = Date.now();

    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
      res.send = originalSend;
      res.locals.responseBody = data;
      return originalSend.call(this, data);
    };

    // Log after response
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      const auditLog = {
        timestamp: new Date().toISOString(),
        userId: req.user?.userId || 'anonymous',
        userRole: req.user?.role || 'unknown',
        method: req.method,
        path: req.path,
        query: Validator.filterPII(req.query),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        traceId: req.headers['x-trace-id'] || 'N/A'
      };

      // Log request body for write operations (excluding sensitive data)
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        auditLog.requestBody = Validator.filterPII(req.body);
      }

      // Log based on status code
      if (res.statusCode >= 400) {
        logger.warn('Audit Log - Error Response', auditLog);
      } else {
        logger.info('Audit Log - Success Response', auditLog);
      }
    });

    next();
  }

  static logDataAccess(entity, action, userId, details = {}) {
    if (!config.AUDIT_LOG_ENABLED) {
      return;
    }

    logger.info('Data Access Audit', {
      timestamp: new Date().toISOString(),
      entity,
      action,
      userId,
      details: Validator.filterPII(details)
    });
  }

  static logSecurityEvent(eventType, userId, details = {}) {
    logger.warn('Security Event', {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      details
    });
  }

  static logComplianceEvent(eventType, userId, details = {}) {
    logger.info('Compliance Event', {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      details: Validator.filterPII(details)
    });
  }
}

module.exports = AuditLogger;