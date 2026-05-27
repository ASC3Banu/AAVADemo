const express = require('express');
const compression = require('compression');
const corsMiddleware = require('./middleware/cors');
const SecurityMiddleware = require('./middleware/security');
const AuditLogger = require('./middleware/auditLogger');
const ErrorHandler = require('./middleware/errorHandler');
const ValidationMiddleware = require('./middleware/validation');
const routes = require('./routes');
const config = require('./config/env');
const logger = require('./utils/logger');

const app = express();

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(corsMiddleware);
app.use(SecurityMiddleware.helmet());
app.use(SecurityMiddleware.addSecurityHeaders);
app.use(SecurityMiddleware.preventParameterPollution());
app.use(SecurityMiddleware.sanitizeNoSQL());

app.use(ValidationMiddleware.sanitizeInputs);
app.use(AuditLogger.logRequest);

app.use(`/api/${config.API_VERSION}`, routes);

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;