const Shipment = require('./shipment.model');
const User = require('./user.model');
const Alert = require('./alert.model');
const Event = require('./event.model');

// Define associations
Shipment.hasMany(Alert, {
  foreignKey: 'shipmentId',
  as: 'alerts'
});

Alert.belongsTo(Shipment, {
  foreignKey: 'shipmentId',
  as: 'shipment'
});

Alert.belongsTo(User, {
  foreignKey: 'acknowledgedBy',
  as: 'acknowledgedByUser'
});

User.hasMany(Alert, {
  foreignKey: 'acknowledgedBy',
  as: 'acknowledgedAlerts'
});

module.exports = {
  Shipment,
  User,
  Alert,
  Event
};