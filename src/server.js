const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { testConnections, connectMongoDB } = require('./config/database');
const { connectProducer, connectConsumer, disconnectKafka } = require('./config/kafka');
const { sequelize } = require('./config/database');

const PORT = config.PORT || 8001;

const startServer = async () => {
  try {
    logger.info('Starting Logistics Monitoring System API...');

    await testConnections();
    logger.info('Database connections established');

    await sequelize.sync({ alter: config.NODE_ENV === 'development' });
    logger.info('Database models synchronized');

    await connectProducer();
    await connectConsumer();
    logger.info('Kafka connections established');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
      logger.info(`API available at http://localhost:${PORT}/api/${config.API_VERSION}`);
      logger.info(`Health check: http://localhost:${PORT}/api/${config.API_VERSION}/health`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await disconnectKafka();
          await sequelize.close();
          logger.info('All connections closed. Exiting process.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();