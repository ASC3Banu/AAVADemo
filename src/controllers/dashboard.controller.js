const dashboardService = require('../services/dashboard.service-complete');
const ErrorHandler = require('../middleware/errorHandler');

class DashboardController {
  getDashboardMetrics = ErrorHandler.asyncHandler(async (req, res) => {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const metrics = await dashboardService.getDashboardMetrics(
      filters,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: metrics
    });
  });
}

module.exports = new DashboardController();