const alertService = require('../services/alert.service-complete');
const ErrorHandler = require('../middleware/errorHandler');

class AlertController {
  getAllAlerts = ErrorHandler.asyncHandler(async (req, res) => {
    const filters = {
      severity: req.query.severity,
      status: req.query.status,
      type: req.query.type,
      shipmentId: req.query.shipmentId
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await alertService.getAllAlerts(
      filters,
      pagination,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result.alerts,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount
      }
    });
  });

  getAlertById = ErrorHandler.asyncHandler(async (req, res) => {
    const alert = await alertService.getAlertById(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: alert
    });
  });

  acknowledgeAlert = ErrorHandler.asyncHandler(async (req, res) => {
    const alert = await alertService.acknowledgeAlert(
      req.params.id,
      req.user.userId,
      req.validatedData.notes
    );

    res.status(200).json({
      success: true,
      data: alert,
      message: 'Alert acknowledged successfully'
    });
  });

  resolveAlert = ErrorHandler.asyncHandler(async (req, res) => {
    const alert = await alertService.resolveAlert(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  });

  dismissAlert = ErrorHandler.asyncHandler(async (req, res) => {
    const alert = await alertService.dismissAlert(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: alert,
      message: 'Alert dismissed successfully'
    });
  });

  getActiveAlertsCount = ErrorHandler.asyncHandler(async (req, res) => {
    const result = await alertService.getActiveAlertsCount(
      req.query.shipmentId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = new AlertController();