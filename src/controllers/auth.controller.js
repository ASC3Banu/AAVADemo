const authService = require('../services/auth.service');
const ErrorHandler = require('../middleware/errorHandler');

class AuthController {
  register = ErrorHandler.asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully'
    });
  });

  login = ErrorHandler.asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  });

  logout = ErrorHandler.asyncHandler(async (req, res) => {
    const token = req.headers.authorization.substring(7);
    await authService.logout(token, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  changePassword = ErrorHandler.asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  });
}

module.exports = new AuthController();