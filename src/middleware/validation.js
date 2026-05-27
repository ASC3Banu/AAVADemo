const Validator = require('../utils/validator');

class ValidationMiddleware {
  static validateShipmentCreate(req, res, next) {
    const { error, value } = Validator.validateShipmentCreate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.validatedData = value;
    next();
  }

  static validateShipmentUpdate(req, res, next) {
    const { error, value } = Validator.validateShipmentUpdate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.validatedData = value;
    next();
  }

  static validateEventCreate(req, res, next) {
    const { error, value } = Validator.validateEventCreate(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.validatedData = value;
    next();
  }

  static validateAlertAcknowledge(req, res, next) {
    const { error, value } = Validator.validateAlertAcknowledge(req.body);

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.validatedData = value;
    next();
  }

  static sanitizeInputs(req, res, next) {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        req.body[key] = Validator.sanitizeInput(req.body[key]);
      });
    }

    if (req.query) {
      Object.keys(req.query).forEach(key => {
        req.query[key] = Validator.sanitizeInput(req.query[key]);
      });
    }

    if (req.params) {
      Object.keys(req.params).forEach(key => {
        req.params[key] = Validator.sanitizeInput(req.params[key]);
      });
    }

    next();
  }
}

module.exports = ValidationMiddleware;