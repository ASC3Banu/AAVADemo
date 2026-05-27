const predictionService = require('../services/prediction.service');
const ErrorHandler = require('../middleware/errorHandler');

class PredictionController {
  getDelayPrediction = ErrorHandler.asyncHandler(async (req, res) => {
    const prediction = await predictionService.requestDelayPrediction(
      req.params.shipmentId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: prediction
    });
  });

  getRouteOptimization = ErrorHandler.asyncHandler(async (req, res) => {
    const optimization = await predictionService.getRouteOptimization(
      req.params.shipmentId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: optimization
    });
  });
}

module.exports = new PredictionController();