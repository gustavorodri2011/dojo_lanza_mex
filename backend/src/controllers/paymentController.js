const { Payment, Member } = require('../models');
const { Op } = require('sequelize');
const { decrypt } = require('../utils/encryption');
const { generateReceiptPDF: createReceiptPDF } = require('../services/pdfService');

/**
 * Obtiene lista de pagos con filtros opcionales
 * @param {Object} req - Request object
 * @param {string} req.query.memberId - Filtro por ID de miembro
 * @param {string} req.query.month - Filtro por mes (01-12)
 * @param {string} req.query.year - Filtro por año (YYYY)
 * @param {Object} res - Response object
 * @returns {Array} Lista de pagos con datos de miembros desencriptados
 */
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

/**
 * Registra un nuevo pago
 * @param {Object} req - Request object
 * @param {number} req.body.memberId - ID del miembro
 * @param {number} req.body.amount - Monto del pago
 * @param {string} req.body.monthYear - Mes/año en formato YYYY-MM
 * @param {string} req.body.paymentMethod - Método de pago (efectivo/transferencia/tarjeta)
 * @param {string} req.body.notes - Notas opcionales
 * @param {Object} res - Response object
 * @returns {Object} Pago creado con datos del miembro
 */
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

/**
 * Obtiene miembros con pagos atrasados del mes actual
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Array} Lista de miembros sin pago del mes actual
 */
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

/**
 * Genera y descarga el PDF del recibo de pago
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID del pago
 * @param {Object} res - Response object
 * @returns {Buffer} PDF del recibo
 */
const downloadReceiptPDF = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: Member,
        as: 'member'
      }]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Desencriptar manualmente los datos del miembro
    if (payment.member) {
      payment.member.firstName = decrypt(payment.member.firstName);
      payment.member.lastName = decrypt(payment.member.lastName);
      payment.member.phone = decrypt(payment.member.phone);
      payment.member.notes = decrypt(payment.member.notes);
    }

    const pdfBuffer = createReceiptPDF(payment, payment.member);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="recibo-${payment.receiptNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

module.exports = {
  getPayments,
  createPayment,
  getOverdueMembers,
  downloadReceiptPDF
};