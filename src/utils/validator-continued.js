const Joi = require('joi');

class Validator {
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>"'&]/g, '');
    }
    return input;
  }

  static validateShipmentCreate(data) {
    const schema = Joi.object({
      trackingNumber: Joi.string().alphanum().min(8).max(50).required(),
      origin: Joi.object({
        address: Joi.string().max(500).required(),
        city: Joi.string().max(100).required(),
        country: Joi.string().length(2).required(),
        postalCode: Joi.string().max(20).required(),
        coordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90),
          longitude: Joi.number().min(-180).max(180)
        })
      }).required(),
      destination: Joi.object({
        address: Joi.string().max(500).required(),
        city: Joi.string().max(100).required(),
        country: Joi.string().length(2).required(),
        postalCode: Joi.string().max(20).required(),
        coordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90),
          longitude: Joi.number().min(-180).max(180)
        })
      }).required(),
      carrier: Joi.string().max(100).required(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
      estimatedDelivery: Joi.date().iso().greater('now').required()
    });

    return schema.validate(data);
  }

  static validateShipmentUpdate(data) {
    const schema = Joi.object({
      status: Joi.string().valid('pending', 'in_transit', 'delivered', 'delayed', 'cancelled'),
      currentLocation: Joi.object({
        address: Joi.string().max(500),
        city: Joi.string().max(100),
        country: Joi.string().length(2),
        postalCode: Joi.string().max(20),
        coordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90),
          longitude: Joi.number().min(-180).max(180)
        })
      }),
      estimatedDelivery: Joi.date().iso(),
      actualDelivery: Joi.date().iso()
    });

    return schema.validate(data);
  }

  static validateEventCreate(data) {
    const schema = Joi.object({
      shipmentId: Joi.string().uuid().required(),
      eventType: Joi.string().valid('pickup', 'in_transit', 'customs_clearance', 'out_for_delivery', 'delivered', 'delayed', 'exception').required(),
      description: Joi.string().max(1000).required(),
      location: Joi.object({
        address: Joi.string().max(500),
        city: Joi.string().max(100),
        country: Joi.string().length(2),
        postalCode: Joi.string().max(20),
        coordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90),
          longitude: Joi.number().min(-180).max(180)
        })
      }).required(),
      carrier: Joi.string().max(100),
      metadata: Joi.object()
    });

    return schema.validate(data);
  }

  static validateAlertAcknowledge(data) {
    const schema = Joi.object({
      acknowledgedBy: Joi.string().uuid().required(),
      notes: Joi.string().max(1000)
    });

    return schema.validate(data);
  }

  static isPII(fieldName) {
    const piiFields = ['email', 'phone', 'ssn', 'passport', 'creditCard', 'driverLicense'];
    return piiFields.some(field => fieldName.toLowerCase().includes(field));
  }

  static filterPII(data) {
    const filtered = { ...data };
    Object.keys(filtered).forEach(key => {
      if (this.isPII(key)) {
        filtered[key] = '***REDACTED***';
      }
    });
    return filtered;
  }
}

module.exports = Validator;