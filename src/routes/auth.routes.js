const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middleware/authentication');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', AuthMiddleware.authenticate, authController.logout);
router.post('/change-password', AuthMiddleware.authenticate, authController.changePassword);

module.exports = router;