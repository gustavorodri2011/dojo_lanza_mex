const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  instructor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dayOfWeek: {
    type: DataTypes.ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  beltLevel: {
    type: DataTypes.ENUM('todos', 'principiante', 'intermedio', 'avanzado'),
    defaultValue: 'todos'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Class;