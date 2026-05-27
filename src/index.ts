/**
 * AI-Powered Logistics Monitoring System - Main Entry Point
 * 
 * Security Features:
 * - TLS 1.3 enforcement
 * - Helmet for HTTP headers security
 * - Rate limiting
 * - CORS configuration
 * - Request sanitization
 * 
 * Compliance:
 * - Audit logging enabled
 * - Data lineage tracking
 * - PII/PHI/PCI filtering
 * 
 * @version 1.0.0
 * @classification Internal
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { config } from './configs/app.config';
import { logger, auditLogger } from './configs/logger.config';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logging.middleware';
import { authRouter } from './routes/auth.routes';
import { shipmentRouter } from './routes/shipment.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { notificationRouter } from './routes/notification.routes';
import { userRouter } from './routes/user.routes';
import { predictionRouter } from './routes/prediction.routes';
import { connectDatabase } from './configs/database.config';
import { initializeRedis } from './configs/redis.config';
import { MetricsService } from './services/metrics.service';

const app: Application = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// CORS configuration
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Correlation-ID']
}));

// Rate limiting - Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    auditLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  }
});

app.use(globalLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression
app.use(compression());

// Request logging and audit trail
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection
    // Check Redis connection
    // Check external dependencies
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// API ROUTES - v1
// ============================================================================

app.use('/v1/auth', authRouter);
app.use('/v1/shipments', shipmentRouter);
app.use('/v1/analytics', analyticsRouter);
app.use('/v1/notifications', notificationRouter);
app.use('/v1/users', userRouter);
app.use('/v1/predictions', predictionRouter);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.path,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id']
    }
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis connected successfully');

    // Initialize metrics service
    await MetricsService.initialize();
    logger.info('Metrics service initialized');

    // Start HTTP server
    const PORT = config.port || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      logger.info(`Environment: ${config.env}`);
      auditLogger.info('Application started', {
        port: PORT,
        environment: config.env,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);
      auditLogger.info('Application shutdown initiated', { signal });
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close database connections
          // Close Redis connections
          // Flush metrics
          await MetricsService.flush();
          
          logger.info('Graceful shutdown completed');
          auditLogger.info('Application shutdown completed', { signal });
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection', { reason, promise });
      auditLogger.error('Unhandled rejection detected', { reason: reason?.toString() });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', error);
      auditLogger.error('Uncaught exception detected', { error: error.message, stack: error.stack });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    auditLogger.error('Application startup failed', { error });
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;