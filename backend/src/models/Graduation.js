const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Graduation = sequelize.define('Graduation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Members',
      key: 'id'
    }
  },
  fromBeltId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'belt_levels',
      key: 'id'
    }
  },
  toBeltId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'belt_levels',
      key: 'id'
    }
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  examiner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  result: {
    type: DataTypes.ENUM('aprobado', 'reprobado', 'pendiente'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  score: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  certificateNumber: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  tableName: 'graduations',
  timestamps: true
});

module.exports = Graduation;