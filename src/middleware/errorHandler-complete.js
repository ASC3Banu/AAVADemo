const logger = require('../utils/logger');

class ErrorHandler {
  static handle(err, req, res, next) {
    logger.error('Error occurred', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user?.userId,
      traceId: req.headers['x-trace-id']
    });

    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message,
        details: err.details || [],
        traceId: req.headers['x-trace-id']
      });
    }

    // Database errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Database Validation Error',
        message: 'Invalid data provided',
        traceId: req.headers['x-trace-id']
      });
    }

    // Not found errors
    if (err.status === 404) {
      return res.status(404).json({
        error: 'Not Found',
        message: err.message || 'Resource not found',
        traceId: req.headers['x-trace-id']
      });
    }

    // Unauthorized errors
    if (err.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: err.message || 'Authentication required',
        traceId: req.headers['x-trace-id']
      });
    }

    // Forbidden errors
    if (err.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: err.message || 'Access denied',
        traceId: req.headers['x-trace-id']
      });
    }

    // Default to 500 server error
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      traceId: req.headers['x-trace-id']
    });
  }

  static notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
  }

  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;