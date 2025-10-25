const { Member, Payment, BeltLevel } = require('../models');
const { Op } = require('sequelize');
const { decrypt } = require('../utils/encryption');

/**
 * Obtiene estadísticas generales del dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Estadísticas básicas
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { isActive: true } });
    
    const monthYearStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const currentMonthPayments = await Payment.findAll({
      where: { monthYear: monthYearStr }
    });
    
    const paidMemberIds = currentMonthPayments.map(p => p.memberId);
    const overdueCount = await Member.count({
      where: {
        isActive: true,
        id: { [Op.notIn]: paidMemberIds.length > 0 ? paidMemberIds : [0] }
      },
      include: [{
        model: BeltLevel,
        as: 'belt'
      }]
    });

    const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      totalMembers,
      activeMembers,
      overdueMembers: overdueCount,
      monthlyRevenue,
      currentMonth: `${currentMonth}/${currentYear}`
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting statistics' });
  }
};

/**
 * Obtiene datos para gráfico de ingresos mensuales
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = `${currentYear}-${month.toString().padStart(2, '0')}`;
      const payments = await Payment.findAll({
        where: { monthYear: monthStr }
      });
      
      const revenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      monthlyData.push({
        month,
        revenue,
        count: payments.length
      });
    }

    res.json(monthlyData);
  } catch (error) {
    console.error('Error getting monthly revenue:', error);
    res.status(500).json({ message: 'Error getting monthly revenue' });
  }
};

/**
 * Obtiene distribución de miembros por cinturón
 */
const getBeltDistribution = async (req, res) => {
  try {
    const members = await Member.findAll({
      where: { isActive: true },
      include: [{
        model: BeltLevel,
        as: 'belt',
        attributes: ['name', 'color']
      }]
    });

    const distribution = members.reduce((acc, member) => {
      const beltName = member.belt.name;
      if (!acc[beltName]) {
        acc[beltName] = {
          count: 0,
          color: member.belt.color
        };
      }
      acc[beltName].count++;
      return acc;
    }, {});

    res.json(distribution);
  } catch (error) {
    console.error('Error getting belt distribution:', error);
    res.status(500).json({ message: 'Error getting belt distribution' });
  }
};

/**
 * Obtiene estadísticas de métodos de pago
 */
const getPaymentMethodStats = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthYearStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const payments = await Payment.findAll({
      where: { monthYear: monthYearStr },
      attributes: ['paymentMethod', 'amount']
    });

    const methodStats = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].total += parseFloat(payment.amount);
      return acc;
    }, {});

    res.json(methodStats);
  } catch (error) {
    console.error('Error getting payment method stats:', error);
    res.status(500).json({ message: 'Error getting payment method stats' });
  }
};

module.exports = {
  getDashboardStats,
  getMonthlyRevenue,
  getBeltDistribution,
  getPaymentMethodStats
};