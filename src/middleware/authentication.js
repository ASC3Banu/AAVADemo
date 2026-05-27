const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');
const { redisClient } = require('../config/database');

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header'
        });
      }

      const token = authHeader.substring(7);

      // Check if token is blacklisted
      const isBlacklisted = await new Promise((resolve) => {
        redisClient.get(`blacklist:${token}`, (err, result) => {
          if (err) {
            logger.error('Redis error checking blacklist:', err);
            resolve(false);
          } else {
            resolve(result !== null);
          }
        });
      });

      if (isBlacklisted) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has been revoked'
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Attach user information to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      };

      // Audit log
      logger.info('User authenticated', {
        userId: req.user.userId,
        role: req.user.role,
        path: req.path,
        method: req.method
      });

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token'
        });
      }

      logger.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed'
      });
    }
  }

  static authorize(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Authorization failed', {
          userId: req.user.userId,
          role: req.user.role,
          requiredRoles: allowedRoles
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        });
      }

      next();
    };
  }

  static checkPermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      if (!req.user.permissions.includes(permission)) {
        logger.warn('Permission check failed', {
          userId: req.user.userId,
          requiredPermission: permission,
          userPermissions: req.user.permissions
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: `Missing required permission: ${permission}`
        });
      }

      next();
    };
  }
}

module.exports = AuthMiddleware;