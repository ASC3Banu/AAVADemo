const shipmentRepository = require('../repositories/shipment.repository-complete');
const eventRepository = require('../repositories/event.repository-complete');
const { publishEvent, TOPICS } = require('../config/kafka');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');
const CacheMiddleware = require('../middleware/cache');

class ShipmentService {
  async createShipment(shipmentData, userId) {
    try {
      const shipment = await shipmentRepository.create({
        ...shipmentData,
        createdBy: userId
      });

      // Create initial event
      await eventRepository.create({
        shipmentId: shipment.id,
        eventType: 'pickup',
        description: `Shipment created with tracking number ${shipment.trackingNumber}`,
        location: {
          address: shipment.originAddress,
          city: shipment.originCity,
          country: shipment.originCountry,
          postalCode: shipment.originPostalCode,
          coordinates: {
            latitude: shipment.originLatitude,
            longitude: shipment.originLongitude
          }
        },
        carrier: shipment.carrier,
        createdBy: userId
      });

      // Publish event to Kafka
      await publishEvent(TOPICS.SHIPMENT_CREATED, shipment.id, {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        timestamp: new Date().toISOString()
      });

      // Audit log
      AuditLogger.logDataAccess('shipment', 'create', userId, {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber
      });

      logger.info('Shipment created successfully', { shipmentId: shipment.id });
      return shipment.toSafeObject();
    } catch (error) {
      logger.error('Error in createShipment service:', error);
      throw error;
    }
  }

  async getShipmentById(id, userId) {
    try {
      const shipment = await shipmentRepository.findById(id);
      
      if (!shipment) {
        const error = new Error('Shipment not found');
        error.status = 404;
        throw error;
      }

      // Audit log
      AuditLogger.logDataAccess('shipment', 'read', userId, { shipmentId: id });

      return shipment.toSafeObject();
    } catch (error) {
      logger.error('Error in getShipmentById service:', error);
      throw error;
    }
  }

  async getShipmentByTrackingNumber(trackingNumber, userId) {
    try {
      const shipment = await shipmentRepository.findByTrackingNumber(trackingNumber);
      
      if (!shipment) {
        const error = new Error('Shipment not found');
        error.status = 404;
        throw error;
      }

      // Audit log
      AuditLogger.logDataAccess('shipment', 'read', userId, { trackingNumber });

      return shipment.toSafeObject();
    } catch (error) {
      logger.error('Error in getShipmentByTrackingNumber service:', error);
      throw error;
    }
  }

  async getAllShipments(filters, pagination, userId) {
    try {
      const result = await shipmentRepository.findAll(filters, pagination);

      // Audit log
      AuditLogger.logDataAccess('shipment', 'list', userId, {
        filters,
        count: result.totalCount
      });

      return {
        ...result,
        shipments: result.shipments.map(s => s.toSafeObject())
      };
    } catch (error) {
      logger.error('Error in getAllShipments service:', error);
      throw error;
    }
  }

  async updateShipment(id, updateData, userId) {
    try {
      const shipment = await shipmentRepository.update(id, {
        ...updateData,
        updatedBy: userId
      });

      // Create event for status change
      if (updateData.status) {
        await eventRepository.create({
          shipmentId: id,
          eventType: updateData.status === 'delivered' ? 'delivered' : 'in_transit',
          description: `Shipment status updated to ${updateData.status}`,
          location: updateData.currentLocation || {},
          carrier: shipment.carrier,
          createdBy: userId
        });
      }

      // Publish event to Kafka
      await publishEvent(TOPICS.SHIPMENT_UPDATED, id, {
        shipmentId: id,
        updates: updateData,
        timestamp: new Date().toISOString()
      });

      // Invalidate cache
      await CacheMiddleware.invalidateCache(`cache:/api/v1/shipments/${id}*`);

      // Audit log
      AuditLogger.logDataAccess('shipment', 'update', userId, {
        shipmentId: id,
        updates: updateData
      });

      logger.info('Shipment updated successfully', { shipmentId: id });
      return shipment.toSafeObject();
    } catch (error) {
      logger.error('Error in updateShipment service:', error);
      throw error;
    }
  }

  async deleteShipment(id, userId) {
    try {
      await shipmentRepository.delete(id);

      // Invalidate cache
      await CacheMiddleware.invalidateCache(`cache:/api/v1/shipments/${id}*`);

      // Audit log
      AuditLogger.logDataAccess('shipment', 'delete', userId, { shipmentId: id });

      logger.info('Shipment deleted successfully', { shipmentId: id });
      return { success: true, message: 'Shipment deleted successfully' };
    } catch (error) {
      logger.error('Error in deleteShipment service:', error);
      throw error;
    }
  }

  async getShipmentStatistics(filters, userId) {
    try {
      const stats = await shipmentRepository.getStatistics(filters);

      // Audit log
      AuditLogger.logDataAccess('shipment', 'statistics', userId, { filters });

      return stats;
    } catch (error) {
      logger.error('Error in getShipmentStatistics service:', error);
      throw error;
    }
  }
}

module.exports = new ShipmentService();