const shipmentRepository = require('../repositories/shipment.repository-complete');
const alertRepository = require('../repositories/alert.repository');
const eventRepository = require('../repositories/event.repository-complete');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');
const { redisClient