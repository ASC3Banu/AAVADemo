const eventService = require('../services/event.service');
const ErrorHandler = require('../middleware/errorHandler');

class EventController {
  createEvent = ErrorHandler.asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(
      req.validatedData,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  });

  getEventsByShipmentId = ErrorHandler.asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await eventService.getEventsByShipmentId(
      req.params.shipmentId,
      options,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result.events,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount
      }
    });
  });

  getAllEvents = ErrorHandler.asyncHandler(async (req, res) => {
    const filters = {
      eventType: req.query.eventType,
      shipmentId: req.query.shipmentId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await eventService.getAllEvents(
      filters,
      pagination,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result.events,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount
      }
    });
  });

  getLatestEvent = ErrorHandler.asyncHandler(async (req, res) => {
    const event = await eventService.getLatestEvent(
      req.params.shipmentId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: event
    });
  });
}

module.exports = new EventController();