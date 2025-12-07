const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkSession = sequelize.define('WorkSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_at: {
    type: DataTypes.DATE,
  },
  break_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'work_sessions',
  timestamps: false,
});

module.exports = WorkSession;
