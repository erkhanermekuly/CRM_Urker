const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClientHistory = sequelize.define('ClientHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM(
      'created',
      'status_changed',
      'comment_added',
      'assigned_to_manager',
      'phone_updated',
      'email_updated',
      'other'
    ),
    allowNull: false,
  },
  old_value: {
    type: DataTypes.TEXT,
  },
  new_value: {
    type: DataTypes.TEXT,
  },
  description: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'client_history',
  timestamps: false,
});

module.exports = ClientHistory;
