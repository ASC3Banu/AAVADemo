const eventRepository = require('../repositories/event.repository-complete');
const { publishEvent, TOPICS } = require('../config/kafka');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');

class EventService {
  async createEvent(eventData, userId) {
    try {
      const event = await eventRepository.create({
        ...eventData,
        createdBy: userId
      });

      // Publish event to Kafka
      await publishEvent(TOPICS.EVENT_CREATED, event.shipmentId, {
        eventId: event._id.toString(),
        shipmentId: event.shipmentId,
        eventType: event.eventType,
        timestamp: event.timestamp
      });

      // Audit log
      AuditLogger.logDataAccess('event', 'create', userId, {
        eventId: event._id.toString(),
        shipmentId: event.shipmentId,
        eventType: event.eventType
      });

      logger.info('Event created successfully', {
        eventId: event._id.toString(),
        shipmentId: event.shipmentId
      });

      return event;
    } catch (error) {
      logger.error('Error in createEvent service:', error);
      throw error;
    }
  }

  async getEventsByShipmentId(shipmentId, options, userId) {
    try {
      const result = await eventRepository.findByShipmentId(shipmentId, options);

      // Audit log
      AuditLogger.logDataAccess('event', 'list', userId, {
        shipmentId,
        count: result.totalCount
      });

      return result;
    } catch (error) {
      logger.error('Error in getEventsByShipmentId service:', error);
      throw error;
    }
  }

  async getAllEvents(filters, pagination, userId) {
    try {
      const result = await eventRepository.findAll(filters, pagination);

      // Audit log
      AuditLogger.logDataAccess('event', 'list', userId, {
        filters,
        count: result.totalCount
      });

      return result;
    } catch (error) {
      logger.error('Error in getAllEvents service:', error);
      throw error;
    }
  }

  async getLatestEvent(shipmentId, userId) {
    try {
      const event = await eventRepository.getLatestEventByShipmentId(shipmentId);

      if (!event) {
        const error = new Error('No events found for this shipment');
        error.status = 404;
        throw error;
      }

      // Audit log
      AuditLogger.logDataAccess('event', 'read', userId, {
        shipmentId,
        eventId: event._id.toString()
      });

      return event;
    } catch (error) {
      logger.error('Error in getLatestEvent service:', error);
      throw error;
    }
  }
}

module.exports = new EventService();