const Event = require('../models/event.model');
const logger = require('../utils/logger');

class EventRepository {
  async create(eventData) {
    try {
      const event = await Event.create(eventData);
      logger.info('Event created', { eventId: event._id, shipmentId: event.shipmentId });
      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const event = await Event.findById(id);
      return event;
    } catch (error) {
      logger.error('Error finding event by ID:', error);
      throw error;
    }
  }

  async findByShipmentId(shipmentId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const events = await Event.find({ shipmentId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const totalCount = await Event.countDocuments({ shipmentId });

      return {
        events,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      logger.error('Error finding events by shipment ID:', error);
      throw error;
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 50 } = pagination;
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.eventType) query.eventType = filters.eventType;
      if (filters.shipmentId) query.shipmentId = filters.shipmentId;
      if (filters.startDate && filters.endDate) {
        query.timestamp = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const events = await Event.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const totalCount = await Event.countDocuments(query);

      return {
        events,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      logger.error('Error finding all events:', error);
      throw error;
    }
  }

  async getLatestEventByShipmentId(shipmentId) {
    try {
      const event = await Event.findOne({ shipmentId })
        .sort({ timestamp: -1 });
      return event;
    } catch (error) {
      logger.error('Error getting latest event:', error);
      throw error;
    }
  }

  async deleteOldEvents(retentionDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await Event.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      logger.info(`Deleted ${result.deletedCount} old events`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting old events:', error);
      throw error;
    }
  }
}

module.exports = new EventRepository();