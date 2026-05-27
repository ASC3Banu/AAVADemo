const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const config = require('../config/env');
const logger = require('../utils/logger');
const AuditLogger = require('../middleware/auditLogger');
const { redisClient } = require('../config/database');

class AuthService {
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        const error = new Error('User already exists with this email');
        error.status = 400;
        throw error;
      }

      // Create user
      const user = await userRepository.create(userData);
      user.setPassword(userData.password);
      await user.save();

      // Audit log
      AuditLogger.logSecurityEvent('user_registered', user.id, {
        email: userData.email,
        role: userData.role
      });

      logger.info('User registered successfully', { userId: user.id });
      return user.toSafeObject();
    } catch (error) {
      logger.error('Error in register service:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Find user
      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
      }

      // Check if user is active
      if (!user.isActive) {
        const error = new Error('User account is deactivated');
        error.status = 403;
        throw error;
      }

      // Validate password
      const isValidPassword = user.validatePassword(password);
      if (!isValidPassword) {
        AuditLogger.logSecurityEvent('failed_login_attempt', user.id, { email });
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
      }

      // Update last login
      await userRepository.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRY }
      );

      // Audit log
      AuditLogger.logSecurityEvent('user_login', user.id, { email });

      logger.info('User logged in successfully', { userId: user.id });
      
      return {
        token,
        user: user.toSafeObject()
      };
    } catch (error) {
      logger.error('Error in login service:', error);
      throw error;
    }
  }

  async logout(token, userId) {
    try {
      // Blacklist token
      const decoded = jwt.decode(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      if (expiresIn > 0) {
        redisClient.setex(`blacklist:${token}`, expiresIn, 'true', (err) => {
          if (err) {
            logger.error('Error blacklisting token:', err);
          }
        });
      }

      // Audit log
      AuditLogger.logSecurityEvent('user_logout', userId, {});

      logger.info('User logged out successfully', { userId });
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error in logout service:', error);
      throw error;
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Validate old password
      const isValidPassword = user.validatePassword(oldPassword);
      if (!isValidPassword) {
        const error = new Error('Invalid current password');
        error.status = 401;
        throw error;
      }

      // Set new password
      user.setPassword(newPassword);
      await user.save();

      // Audit log
      AuditLogger.logSecurityEvent('password_changed', userId, {});

      logger.info('Password changed successfully', { userId });
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Error in changePassword service:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();