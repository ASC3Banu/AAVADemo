const { Shipment, Alert } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ShipmentRepository {
  async create(shipmentData) {
    try {
      const shipment = await Shipment.create(shipmentData);
      logger.info('Shipment created', { shipmentId: shipment.id });
      return shipment;
    } catch (error) {
      logger.error('Error creating shipment:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const shipment = await Shipment.findByPk(id, {
        include: [{
          model: Alert,
          as: 'alerts',
          where: { status: { [Op.ne]: 'dismissed' } },
          required: false
        }]
      });
      return shipment;
    } catch (error) {
      logger.error('Error finding shipment by ID:', error);
      throw error;
    }
  }

  async findByTrackingNumber(trackingNumber) {
    try {
      const shipment = await Shipment.findOne({
        where: { trackingNumber },
        include: [{
          model: Alert,
          as: 'alerts',
          where: { status: { [Op.ne]: 'dismissed' } },
          required: false
        }]
      });
      return shipment;
    } catch (error) {
      logger.error('Error finding shipment by tracking number:', error);
      throw error;
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.carrier) where.carrier = filters.carrier;
      if (filters.priority) where.priority = filters.priority;
      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }

      const { count, rows } = await Shipment.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Alert,
          as: 'alerts',
          where: { status: 'active' },
          required: false
        }]
      });

      return {
        shipments: rows,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error finding all shipments:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const shipment = await Shipment.findByPk(id);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      await shipment.update(updateData);
      logger.info('Shipment updated', { shipmentId: id });
      return shipment;
    } catch (error) {
      logger.error('Error updating shipment:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const shipment = await Shipment.findByPk(id);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      await shipment.destroy();
      logger.info('Shipment deleted', { shipmentId: id });
      return true;
    } catch (error) {
      logger.error('Error deleting shipment:', error);
      throw error;
    }
  }

  async getStatistics(filters = {}) {
    try {
      const where = {};
      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }

      const stats = await Shipment.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      return stats;
    } catch (error) {
      logger.error('Error getting shipment statistics:', error);
      throw error;
    }
  }
}

module.exports = new ShipmentRepository();