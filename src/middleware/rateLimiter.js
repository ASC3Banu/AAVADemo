const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redisClient } = require('../config/database');
const config = require('../config/env');
const logger = require('../utils/logger');

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userId: req.user?.userId
      });

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: res.getHeader('Retry-After')
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/metrics';
    }
  };

  // Use Redis store in production
  if (config.NODE_ENV === 'production') {
    defaultOptions.store = new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    });
  }

  return rateLimit({ ...defaultOptions, ...options });
};

// Different rate limiters for different endpoints
const apiLimiter = createRateLimiter({
  windowMs: 60000,
  max: 100
});

const authLimiter = createRateLimiter({
  windowMs: 900000,
  max: 5,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

const strictLimiter = createRateLimiter({
  windowMs: 60000,
  max: 10
});

module.exports = {
  apiLimiter,
  authLimiter,
  strictLimiter,
  createRateLimiter
};