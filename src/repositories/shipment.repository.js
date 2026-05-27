const { Shipment, Alert } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ShipmentRepository {
  async create(shipmentData) {
    try {
      const shipment = await Shipment.create(