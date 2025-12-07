const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Olympiad = sequelize.define('Olympiad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.ENUM(
      'mathematics',
      'physics',
      'chemistry',
      'computer_science',
      'english',
      'russian',
      'history',
      'biology',
      'other'
    ),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  format: {
    type: DataTypes.ENUM('online', 'offline'),
    defaultValue: 'online',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
    defaultValue: 'planned',
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
  tableName: 'olympiads',
  timestamps: false,
});

module.exports = Olympiad;
