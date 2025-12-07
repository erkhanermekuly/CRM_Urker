const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
  },
  hire_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  qualifications: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'teachers',
  timestamps: false,
});

module.exports = Teacher;
