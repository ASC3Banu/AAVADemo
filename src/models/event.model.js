const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['pickup', 'in_transit', 'customs_clearance', 'out_for_delivery', 'delivered', 'delayed', 'exception'],
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  location: {
    address: { type: String, maxlength: 500 },
    city: { type: String, maxlength: 100 },
    country: { type: String, length: 2 },
    postalCode: { type: String, maxlength: 20 },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    }
  },
  carrier: {
    type: String,
    maxlength: 100
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'logistics_events'
});

eventSchema.index({ shipmentId: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;