const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const encryptionUtil = require('../utils/encryption');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  passwordSalt: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('logistics_manager', 'supply_chain_analyst', 'business_owner', 'admin'),
    defaultValue: 'logistics_manager',
    allowNull: false
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  mfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mfaSecret: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['role'] },
    { fields: ['isActive'] }
  ]
});

User.prototype.setPassword = function(password) {
  const { salt, hash } = encryptionUtil.hashPassword(password);
  this.passwordSalt = salt;
  this.passwordHash = hash;
};

User.prototype.validatePassword = function(password) {
  return encryptionUtil.verifyPassword(password, this.passwordSalt, this.passwordHash);
};

User.prototype.toSafeObject = function() {
  const user = this.toJSON();
  delete user.passwordHash;
  delete user.passwordSalt;
  delete user.mfaSecret;
  delete user.deletedAt;
  return user;
};

module.exports = User;