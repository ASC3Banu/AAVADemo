const { User } = require('../models');
const logger = require('../utils/logger');

class UserRepository {
  async create(userData) {
    try {
      const user = await User.create(userData);
      logger.info('User created', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const user = await User.findByPk(id);
      return user;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const where = {};
      if (filters.role) where.role = filters.role;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;

      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        users: rows.map(user => user.toSafeObject()),
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      await user.update(updateData);
      logger.info('User updated', { userId: id });
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      await user.destroy();
      logger.info('User deleted', { userId: id });
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      await User.update(
        { lastLogin: new Date() },
        { where: { id } }
      );
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();