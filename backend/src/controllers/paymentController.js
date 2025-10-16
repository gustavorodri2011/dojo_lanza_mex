const { Payment, Member } = require('../models');
const { Op } = require('sequelize');
const { decrypt } = require('../utils/encryption');

const getPayments = async (req, res) => {
  try {
    const { memberId, month, year } = req.query;
    const where = {};

    if (memberId) where.memberId = memberId;
    if (month && year) where.monthYear = `${year}-${month.padStart(2, '0')}`;

    const payments = await Payment.findAll({
      where,
      include: [{
        model: Member,
        as: 'member'
      }],
      order: [['paymentDate', 'DESC']]
    });

    // Desencriptar manualmente los nombres de miembros
    payments.forEach(payment => {
      if (payment.member) {
        payment.member.firstName = decrypt(payment.member.firstName);
        payment.member.lastName = decrypt(payment.member.lastName);
        payment.member.phone = decrypt(payment.member.phone);
        payment.member.notes = decrypt(payment.member.notes);
      }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createPayment = async (req, res) => {
  try {
    const { memberId, amount, monthYear, paymentMethod, notes } = req.body;
    
    // Generar número de recibo único
    const receiptNumber = `REC-${Date.now()}`;
    
    const payment = await Payment.create({
      memberId,
      amount,
      monthYear,
      paymentMethod,
      notes,
      receiptNumber
    });

    const paymentWithMember = await Payment.findByPk(payment.id, {
      include: [{
        model: Member,
        as: 'member'
      }]
    });

    // Desencriptar manualmente los nombres del miembro
    if (paymentWithMember.member) {
      paymentWithMember.member.firstName = decrypt(paymentWithMember.member.firstName);
      paymentWithMember.member.lastName = decrypt(paymentWithMember.member.lastName);
      paymentWithMember.member.phone = decrypt(paymentWithMember.member.phone);
      paymentWithMember.member.notes = decrypt(paymentWithMember.member.notes);
    }

    res.status(201).json(paymentWithMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOverdueMembers = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const members = await Member.findAll({
      where: { isActive: true },
      include: [{
        model: Payment,
        as: 'payments',
        where: { monthYear: currentMonth },
        required: false
      }]
    });

    const overdueMembers = members.filter(member => 
      member.payments.length === 0
    );

    res.json(overdueMembers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPayments,
  createPayment,
  getOverdueMembers
};