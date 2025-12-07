const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OlympiadRegistration = sequelize.define('OlympiadRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  olympiad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'registered',
      'paid',
      'completed',
      'certificate_received',
      'cancelled'
    ),
    defaultValue: 'registered',
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paid_at: {
    type: DataTypes.DATE,
  },
  score: {
    type: DataTypes.INTEGER,
  },
  certificate_url: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'olympiad_registrations',
  timestamps: false,
});

module.exports = OlympiadRegistration;
