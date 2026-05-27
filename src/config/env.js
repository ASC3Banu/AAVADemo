require('dotenv').config();

module.exports = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8001,
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key-32-characters',
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  
  // Database
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
  POSTGRES_DB: process.env.POSTGRES_DB || 'logistics_db',
  POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/logistics_events',
  
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // Kafka
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'localhost:9092',
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'logistics-monitoring-system',
  KAFKA_CONSUMER_GROUP: process.env.KAFKA_CONSUMER_GROUP || 'logistics-events-group',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Performance
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300'),
  
  // Compliance
  AUDIT_LOG_ENABLED: process.env.AUDIT_LOG_ENABLED !== 'false',
  DATA_RETENTION_DAYS: parseInt(process.env.DATA_RETENTION_DAYS || '2555'),
  
  // External Services
  AI_PREDICTION_SERVICE_URL: process.env.AI_PREDICTION_SERVICE_URL || 'http://localhost:8003',
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006'
};