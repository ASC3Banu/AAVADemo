const { Kafka, logLevel } = require('kafkajs');
const logger = require('../utils/logger');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'logistics-monitoring-system',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  connectionTimeout: 10000,
  requestTimeout: 30000
});

// Kafka Producer
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});

// Kafka Consumer
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP || 'logistics-events-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

// Kafka Topics
const TOPICS = {
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_UPDATED: 'shipment.updated',
  EVENT_CREATED: 'event.created',
  ALERT_GENERATED: 'alert.generated',
  PREDICTION_REQUESTED: 'prediction.requested',
  PREDICTION_COMPLETED: 'prediction.completed'
};

// Connect Producer
const connectProducer = async () => {
  try {
    await producer.connect();
    logger.info('Kafka producer connected successfully');
  } catch (error) {
    logger.error('Kafka producer connection error:', error);
    throw error;
  }
};

// Connect Consumer
const connectConsumer = async () => {
  try {
    await consumer.connect();
    logger.info('Kafka consumer connected successfully');
  } catch (error) {
    logger.error('Kafka consumer connection error:', error);
    throw error;
  }
};

// Publish Event
const publishEvent = async (topic, key, value) => {
  try {
    await producer.send({
      topic,
      messages: [{
        key: key,
        value: JSON.stringify(value),
        timestamp: Date.now().toString()
      }]
    });
    logger.info(`Event published to topic ${topic}`);
  } catch (error) {
    logger.error('Error publishing event:', error);
    throw error;
  }
};

// Graceful Shutdown
const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    logger.info('Kafka disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting Kafka:', error);
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  TOPICS,
  connectProducer,
  connectConsumer,
  publishEvent,
  disconnectKafka
};