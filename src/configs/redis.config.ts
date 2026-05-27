/**
 * Redis Configuration
 * Redis client for caching and session management
 * 
 * Features:
 * - Connection pooling
 * - TLS encryption
 * - Automatic reconnection
 * - Command monitoring
 * 
 * @version 1.0.0
 */

import Redis, { RedisOptions } from 'ioredis';
import { config } from './app.config';
import { logger, auditLogger } from './logger.config';

let redisClient: Redis | null = null;

export const initializeRedis = async (): Promise<Redis> => {
  if (redisClient) {
    return redisClient;
  }

  try {
    const options: RedisOptions = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      lazyConnect: false
    };

    if (config.redis.tls) {
      options.tls = {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.3'
      };
    }

    redisClient = new Redis(options);

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
      auditLogger.info('Redis connection established');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', err);
      auditLogger.error('Redis error', { error: err.message });
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
      auditLogger.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    await redisClient.ping();
    logger.info('Redis connection verified');

    return redisClient;
  } catch (error) {
    logger.error('Redis initialization failed', error);
    auditLogger.error('Redis initialization failed', { error });
    throw error;
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
    auditLogger.info('Redis connection closed');
  }
};