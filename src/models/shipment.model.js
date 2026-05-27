const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const encryptionUtil = require('../utils/encryption');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  trackingNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [8, 50]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'delayed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  originAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  originCity: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  originCountry: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  originPostalCode: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  originLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  originLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  destinationAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  destinationCity: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  destinationCountry: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  destinationPostalCode: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  destinationLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  destinationLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  currentLocationAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentLocationCity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  currentLocationCountry: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  currentLocationLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  currentLocationLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  carrier: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'shipments',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['trackingNumber'], unique: true },
    { fields: ['status'] },
    { fields: ['carrier'] },
    { fields: ['createdAt'] },
    { fields: ['estimatedDelivery'] }
  ]
});

Shipment.prototype.toSafeObject = function() {
  const shipment = this.toJSON();
  delete shipment.deletedAt;
  return shipment;
};

module.exports = Shipment;