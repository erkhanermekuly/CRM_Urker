const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'groups',
  timestamps: true,
});

module.exports = Group;
