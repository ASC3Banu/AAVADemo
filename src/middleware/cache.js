const { redisClient } = require('../config/database');
const logger = require('../utils/logger');
const config = require('../config/env');

class CacheMiddleware {
  static cache(duration = config.CACHE_TTL) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl || req.url}`;

      try {
        const cachedData = await new Promise((resolve, reject) => {
          redisClient.get(key, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });

        if (cachedData) {
          logger.debug(`Cache hit for key: ${key}`);
          return res.status(200).json(JSON.parse(cachedData));
        }

        // Store original send function
        const originalSend = res.send;

        // Override send function to cache response
        res.send = function (data) {
          res.send = originalSend;

          if (res.statusCode === 200) {
            redisClient.setex(key, duration, data, (err) => {
              if (err) {
                logger.error('Cache set error:', err);
              } else {
                logger.debug(`Cache set for key: ${key}`);
              }
            });
          }

          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  static async invalidateCache(pattern) {
    try {
      const keys = await new Promise((resolve, reject) => {
        redisClient.keys(pattern, (err, keys) => {
          if (err) reject(err);
          else resolve(keys);
        });
      });

      if (keys && keys.length > 0) {
        await new Promise((resolve, reject) => {
          redisClient.del(...keys, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        logger.info(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }
}

module.exports = CacheMiddleware;