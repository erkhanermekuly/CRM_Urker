const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
  },
  class_grade: {
    type: DataTypes.STRING,
  },
  manager_id: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM(
      'new',
      'processing',
      'interested',
      'paid',
      'participating',
      'completed',
      'not_worked'
    ),
    defaultValue: 'new',
  },
  comment: {
    type: DataTypes.TEXT,
  },
  source: {
    type: DataTypes.ENUM(
      'instagram',
      'tiktok',
      'advertisement',
      'whatsapp',
      'direct',
      'other'
    ),
    defaultValue: 'other',
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
  tableName: 'clients',
  timestamps: false,
});

module.exports = Client;
