const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BeltLevel = sequelize.define('BeltLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#6B7280'
  }
}, {
  tableName: 'belt_levels',
  timestamps: false
});

module.exports = BeltLevel;