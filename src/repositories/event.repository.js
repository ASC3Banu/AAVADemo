const Event = require('../models/event.model');
const logger = require('../utils/logger');

class EventRepository {
  async create(eventData) {
    try {
      const event = await Event.create(eventData);
      logger.info('Event created'