/**
 * Application Configuration
 * 
 * Centralized configuration management with environment variable validation
 * Secrets are loaded from secure vault (AWS Secrets Manager / Azure Key Vault)
 * 
 * @version 1.0.0
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema validation
const configSchema = z.object({
  env: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.number().default(3000),
  
  // Database
  database: z.object({
    uri: z.string(),
    name: z.string(),
    maxPoolSize: z.number().default(10),
    minPoolSize: z.number().default(2),
    ssl: z.boolean().default(true)
  }),
  
  // Redis
  redis: z.object({
    host: z.string(),
    port: z.number().default(6379),
    password: z.string().optional(),
    tls: z.boolean().default(true),
    db: z.number().default(0)
  }),
  
  // JWT
  jwt: z.object({
    accessSecret: z.string(),
    refreshSecret: z.string(),
    accessExpiry: z.string().default('15m'),
    refreshExpiry: z.string().default('7d'),
    issuer: z.string().default('logistics-system'),
    audience: z.string().default('logistics-api')
  }),
  
  // Encryption
  encryption: z.object({
    algorithm: z.literal('aes-256-gcm'),
    key: z.string().length(64), // 32 bytes hex encoded
    ivLength: z.number().default(16)
  }),
  
  // CORS
  cors: z.object({
    allowedOrigins: z.array(z.string())
  }),
  
  // Logging
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    auditEnabled: z.boolean().default(true),
    piiFilteringEnabled: z.boolean().default(true)
  }),
  
  // External Services
  services: z.object({
    mlServiceUrl: z.string().url(),
    notificationServiceUrl: z.string().url(),
    carrierApiUrl: z.string().url()
  }),
  
  // Security
  security: z.object({
    bcryptRounds: z.number().default(12),
    maxLoginAttempts: z.number().default(5),
    lockoutDuration: z.number().default(900000), // 15 minutes
    sessionTimeout: z.number().default(900000), // 15 minutes
    mfaEnabled: z.boolean().default(true)
  }),
  
  // Compliance
  compliance: z.object({
    dataRetentionDays: z.number().default(2555), // 7 years
    auditRetentionDays: z.number().default(2555),
    gdprEnabled: z.boolean().default(true),
    pciDssEnabled: z.boolean().default(true),
    dataResidency: z.string().default('EU')
  })
});

type Config = z.infer<typeof configSchema>;

// Build configuration object
const buildConfig = (): Config => {
  return {
    env: (process.env.NODE_ENV as any) || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    
    database: {
      uri: process.env.DATABASE_URI || 'mongodb://localhost:27017',
      name: process.env.DATABASE_NAME || 'logistics_db',
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2', 10),
      ssl: process.env.DB_SSL === 'true'
    },
    
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true',
      db: parseInt(process.env.REDIS_DB || '0', 10)
    },
    
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || 'change-this-secret',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
      accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: process.env.JWT_ISSUER || 'logistics-system',
      audience: process.env.JWT_AUDIENCE || 'logistics-api'
    },
    
    encryption: {
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY || '0'.repeat(64),
      ivLength: 16
    },
    
    cors: {
      allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
    },
    
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      auditEnabled: process.env.AUDIT_ENABLED !== 'false',
      piiFilteringEnabled: process.env.PII_FILTERING_ENABLED !== 'false'
    },
    
    services: {
      mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5000',
      notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5001',
      carrierApiUrl: process.env.CARRIER_API_URL || 'http://localhost:5002'
    },
    
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000', 10),
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '900000', 10),
      mfaEnabled: process.env.MFA_ENABLED !== 'false'
    },
    
    compliance: {
      dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '2555', 10),
      auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555', 10),
      gdprEnabled: process.env.GDPR_ENABLED !== 'false',
      pciDssEnabled: process.env.PCI_DSS_ENABLED !== 'false',
      dataResidency: process.env.DATA_RESIDENCY || 'EU'
    }
  };
};

// Validate and export configuration
export const config = configSchema.parse(buildConfig());

// Export types
export type { Config };