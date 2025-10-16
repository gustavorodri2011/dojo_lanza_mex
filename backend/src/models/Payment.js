const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  monthYear: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Format: YYYY-MM'
  },
  paymentMethod: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta'),
    defaultValue: 'efectivo'
  },
  notes: {
    type: DataTypes.TEXT
  },
  receiptNumber: {
    type: DataTypes.STRING,
    unique: true
  }
});

module.exports = Payment;