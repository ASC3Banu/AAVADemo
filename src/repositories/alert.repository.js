const { Alert, Shipment, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AlertRepository {
  async create(alertData) {
    try {
      const alert = await Alert.create(alertData);
      logger.info('Alert created', { alertId: alert.id });
      return alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const alert = await Alert.findByPk(id, {
        include: [
          { model: Shipment, as: 'shipment' },
          { model: User, as: 'acknowledgedByUser' }
        ]
      });
      return alert;
    } catch (error) {
      logger.error('Error finding alert by ID:', error);
      throw error;
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const where = {};
      if (filters.severity) where.severity = filters.severity;
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.shipmentId) where.shipmentId = filters.shipmentId;

      const { count, rows } = await Alert.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Shipment, as: 'shipment' },
          { model: User, as: 'acknowledgedByUser' }
        ]
      });

      return {
        alerts: rows,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error finding all alerts:', error);
      throw error;
    }
  }

  async acknowledge(id, userId, notes = '') {
    try {
      const alert = await Alert.findByPk(id);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        notes
      });

      logger.info('Alert acknowledged', { alertId: id, userId });
      return alert;
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  async resolve(id) {
    try {
      const alert = await Alert.findByPk(id);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({
        status: 'resolved',
        resolvedAt: new Date()
      });

      logger.info('Alert resolved', { alertId: id });
      return alert;
    } catch (error) {
      logger.error('Error resolving alert:', error);
      throw error;
    }
  }

  async dismiss(id) {
    try {
      const alert = await Alert.findByPk(id);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({ status: 'dismissed' });
      logger.info('Alert dismissed', { alertId: id });
      return alert;
    } catch (error) {
      logger.error('Error dismissing alert:', error);
      throw error;
    }
  }

  async getActiveAlertsCount(shipmentId = null) {
    try {
      const where = { status: 'active' };
      if (shipmentId) where.shipmentId = shipmentId;

      const count = await Alert.count({ where });
      return count;
    } catch (error) {
      logger.error('Error getting active alerts count:', error);
      throw error;
    }
  }
}

module.exports = new AlertRepository();