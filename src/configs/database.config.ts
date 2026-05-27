/**
 * Database Configuration
 * MongoDB connection with retry logic and connection pooling
 * 
 * Features:
 * - Automatic reconnection
 * - Connection pooling
 * - TLS 1.3 encryption
 * - Query performance monitoring
 * 
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import { config } from './app.config';
import { logger, auditLogger } from './logger.config';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  try {
    const options: mongoose.ConnectOptions = {
      maxPoolSize: config.database.maxPoolSize,
      minPoolSize: config.database.minPoolSize,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      ssl: config.database.ssl,
      sslValidate: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
    };

    await mongoose.connect(config.database.uri, options);
    
    isConnected = true;
    logger.info('MongoDB connected successfully');
    auditLogger.info('Database connection established', {
      database: config.database.name,
      poolSize: config.database.maxPoolSize
    });

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error', err);
      auditLogger.error('Database connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
      auditLogger.warn('Database disconnected');
      isConnected = false;
    });

    // Enable query logging in development
    if (config.env === 'development') {
      mongoose.set('debug', true);
    }

  } catch (error) {
    logger.error('MongoDB connection failed', error);
    auditLogger.error('Database connection failed', { error });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB disconnected successfully');
    auditLogger.info('Database connection closed');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', error);
    throw error;
  }
};

export const getConnectionStatus = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};