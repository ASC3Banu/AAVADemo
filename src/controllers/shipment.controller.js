const shipmentService = require('../services/shipment.service');
const ErrorHandler = require('../middleware/errorHandler');

class ShipmentController {
  createShipment = ErrorHandler.asyncHandler(async (req, res) => {
    const shipment = await shipmentService.createShipment(
      req.validatedData,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      data: shipment,
      message: 'Shipment created successfully'
    });
  });

  getShipmentById = ErrorHandler.asyncHandler(async (req, res) => {
    const shipment = await shipmentService.getShipmentById(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: shipment
    });
  });

  getShipmentByTrackingNumber = ErrorHandler.asyncHandler(async (req, res) => {
    const shipment = await shipmentService.getShipmentByTrackingNumber(
      req.params.trackingNumber,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: shipment
    });
  });

  getAllShipments = ErrorHandler.asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      carrier: req.query.carrier,
      priority: req.query.priority,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await shipmentService.getAllShipments(
      filters,
      pagination,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result.shipments,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount
      }
    });
  });

  updateShipment = ErrorHandler.asyncHandler(async (req, res) => {
    const shipment = await shipmentService.updateShipment(
      req.params.id,
      req.validatedData,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: shipment,
      message: 'Shipment updated successfully'
    });
  });

  deleteShipment = ErrorHandler.asyncHandler(async (req, res) => {
    await shipmentService.deleteShipment(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  });

  getShipmentStatistics = ErrorHandler.asyncHandler(async (req, res) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const stats = await shipmentService.getShipmentStatistics(
      filters,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

module.exports = new ShipmentController();