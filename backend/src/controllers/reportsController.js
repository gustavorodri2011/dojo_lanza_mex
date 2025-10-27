const { Member, Payment, BeltLevel } = require('../models');
const { Op } = require('sequelize');
const { decrypt } = require('../utils/encryption');
const XLSX = require('xlsx');

/**
 * Genera reporte de ingresos por período
 */
const getIncomeReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [{
        model: Member,
        as: 'member',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['paymentDate', 'DESC']]
    });

    // Desencriptar datos
    const decryptedPayments = payments.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      paymentDate: payment.paymentDate,
      monthYear: payment.monthYear,
      paymentMethod: payment.paymentMethod,
      receiptNumber: payment.receiptNumber,
      member: {
        firstName: decrypt(payment.member.firstName),
        lastName: decrypt(payment.member.lastName),
        email: payment.member.email
      }
    }));

    const totalIncome = decryptedPayments.reduce((sum, p) => sum + p.amount, 0);
    const reportData = {
      period: { startDate, endDate },
      totalIncome,
      totalPayments: decryptedPayments.length,
      payments: decryptedPayments
    };

    if (format === 'excel') {
      return generateExcelReport(res, 'Reporte_Ingresos', decryptedPayments, [
        { key: 'receiptNumber', header: 'Recibo' },
        { key: 'member.firstName', header: 'Nombre' },
        { key: 'member.lastName', header: 'Apellido' },
        { key: 'amount', header: 'Monto' },
        { key: 'paymentDate', header: 'Fecha' },
        { key: 'paymentMethod', header: 'Método' },
        { key: 'monthYear', header: 'Período' }
      ]);
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error generating income report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

/**
 * Genera reporte de miembros
 */
const getMembersReport = async (req, res) => {
  try {
    const { belt, status, format = 'json' } = req.query;
    
    const whereClause = {};
    if (belt) whereClause.beltId = belt;
    if (status) whereClause.isActive = status === 'active';

    const members = await Member.findAll({
      where: whereClause,
      include: [
        {
          model: Payment,
          as: 'payments',
          required: false
        },
        {
          model: BeltLevel,
          as: 'belt'
        }
      ],
      order: [['joinDate', 'DESC']]
    });

    // Desencriptar datos
    const decryptedMembers = members.map(member => ({
      id: member.id,
      firstName: decrypt(member.firstName),
      lastName: decrypt(member.lastName),
      email: member.email,
      phone: decrypt(member.phone),
      dateOfBirth: member.dateOfBirth,
      joinDate: member.joinDate,
      belt: member.belt?.name || 'Sin cinturón',
      isActive: member.isActive,
      totalPayments: member.payments.length,
      lastPayment: member.payments.length > 0 ? 
        member.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0].paymentDate : null
    }));

    const reportData = {
      filters: { belt, status },
      totalMembers: decryptedMembers.length,
      activeMembers: decryptedMembers.filter(m => m.isActive).length,
      members: decryptedMembers
    };

    if (format === 'excel') {
      return generateExcelReport(res, 'Reporte_Miembros', decryptedMembers, [
        { key: 'firstName', header: 'Nombre' },
        { key: 'lastName', header: 'Apellido' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Teléfono' },
        { key: 'belt', header: 'Cinturón' },
        { key: 'joinDate', header: 'Fecha Ingreso' },
        { key: 'isActive', header: 'Estado' },
        { key: 'totalPayments', header: 'Total Pagos' },
        { key: 'lastPayment', header: 'Último Pago' }
      ]);
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error generating members report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

/**
 * Genera reporte de pagos atrasados
 */
const getOverdueReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthYearStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    const paidMemberIds = await Payment.findAll({
      where: { monthYear: monthYearStr },
      attributes: ['memberId']
    }).then(payments => payments.map(p => p.memberId));

    const overdueMembers = await Member.findAll({
      where: {
        isActive: true,
        id: { [Op.notIn]: paidMemberIds.length > 0 ? paidMemberIds : [0] }
      },
      include: [{
        model: Payment,
        as: 'payments',
        required: false,
        limit: 1,
        order: [['paymentDate', 'DESC']]
      }]
    });

    // Desencriptar datos
    const decryptedOverdue = overdueMembers.map(member => ({
      id: member.id,
      firstName: decrypt(member.firstName),
      lastName: decrypt(member.lastName),
      email: member.email,
      phone: decrypt(member.phone),
      belt: member.belt?.name || 'Sin cinturón',
      joinDate: member.joinDate,
      lastPayment: member.payments.length > 0 ? member.payments[0].paymentDate : null,
      daysSinceLastPayment: member.payments.length > 0 ? 
        Math.floor((currentDate - new Date(member.payments[0].paymentDate)) / (1000 * 60 * 60 * 24)) : null
    }));

    const reportData = {
      currentPeriod: monthYearStr,
      totalOverdue: decryptedOverdue.length,
      members: decryptedOverdue
    };

    if (format === 'excel') {
      return generateExcelReport(res, 'Reporte_Pagos_Atrasados', decryptedOverdue, [
        { key: 'firstName', header: 'Nombre' },
        { key: 'lastName', header: 'Apellido' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Teléfono' },
        { key: 'belt', header: 'Cinturón' },
        { key: 'joinDate', header: 'Fecha Ingreso' },
        { key: 'lastPayment', header: 'Último Pago' },
        { key: 'daysSinceLastPayment', header: 'Días Sin Pagar' }
      ]);
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error generating overdue report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

/**
 * Genera archivo Excel
 */
const generateExcelReport = (res, filename, data, columns) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => {
      const row = {};
      columns.forEach(col => {
        const value = col.key.includes('.') ? 
          col.key.split('.').reduce((obj, key) => obj?.[key], item) : 
          item[col.key];
        row[col.header] = value;
      });
      return row;
    })
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xlsx"`);
  res.send(buffer);
};

module.exports = {
  getIncomeReport,
  getMembersReport,
  getOverdueReport
};