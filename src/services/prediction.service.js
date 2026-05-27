const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');
const { redisClient } = require('../config/database');
const { publishEvent, TOPICS } = require('../config/kafka');

class PredictionService {
  async requestDelayPrediction(shipmentId, userId) {
    try {
      // Check cache first
      const cacheKey = `prediction:${shipmentId}`;
      const cachedPrediction = await new Promise((resolve) => {
        redisClient.get(cacheKey, (err, data) => {
          if (err) {
            logger.error('Redis error:', err);
            resolve(null);
          } else {
            resolve(data ? JSON.parse(data) : null);
          }
        });
      });

      if (cachedPrediction) {
        logger.info('Returning cached prediction', { shipmentId });
        return cachedPrediction;
      }

      // Publish prediction request to Kafka
      await publishEvent(TOPICS.PREDICTION_REQUESTED, shipmentId, {
        shipmentId,
        requestedBy: userId,
        timestamp: new Date().toISOString()
      });

      // Call AI Prediction Service
      const response = await axios.post(
        `${config.AI_PREDICTION_SERVICE_URL}/api/v1/predictions/delay`,
        { shipmentId },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const prediction = response.data;

      // Cache prediction for 1 hour
      redisClient.setex(cacheKey, 3600, JSON.stringify(prediction), (err) => {
        if (err) {
          logger.error('Error caching prediction:', err);
        }
      });

      // Publish prediction completed event
      await publishEvent(TOPICS.PREDICTION_COMPLETED, shipmentId, {
        shipmentId,
        prediction: prediction.delayProbability,
        timestamp: new Date().toISOString()
      });

      // Audit log
      AuditLogger.logDataAccess('prediction', 'request', userId, {
        shipmentId,
        delayProbability: prediction.delayProbability
      });

      logger.info('Delay prediction generated', { shipmentId, prediction: prediction.delayProbability });
      return prediction;
    } catch (error) {
      logger.error('Error in requestDelayPrediction service:', error);
      
      // Return fallback prediction if AI service fails
      return {
        shipmentId,
        delayProbability: 0.5,
        confidence: 0.3,
        factors: ['AI service unavailable'],
        explanation: 'Prediction service temporarily unavailable',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getRouteOptimization(shipmentId, userId) {
    try {
      const response = await axios.post(
        `${config.AI_PREDICTION_SERVICE_URL}/api/v1/predictions/route-optimization`,
        { shipmentId },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const optimization = response.data;

      // Audit log
      AuditLogger.logDataAccess('prediction', 'route_optimization', userId, {
        shipmentId
      });

      logger.info('Route optimization generated', { shipmentId });
      return optimization;
    } catch (error) {
      logger.error('Error in getRouteOptimization service:', error);
      throw error;
    }
  }
}

module.exports = new PredictionService();