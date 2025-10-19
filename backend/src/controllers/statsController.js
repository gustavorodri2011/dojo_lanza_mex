const { Member, Payment } = require('../models');
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
    // Estadísticas básicas
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { isActive: true } });
    
    const currentMonthPayments = await Payment.findAll({
      where: { month: currentMonth, year: currentYear }
    });
    
    const paidMemberIds = currentMonthPayments.map(p => p.memberId);
    const overdueCount = await Member.count({
      where: {
        isActive: true,
        id: { [Op.notIn]: paidMemberIds.length > 0 ? paidMemberIds : [0] }
      }
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
      const payments = await Payment.findAll({
        where: { month, year: currentYear }
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
      attributes: ['belt']
    });

    const distribution = members.reduce((acc, member) => {
      acc[member.belt] = (acc[member.belt] || 0) + 1;
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

    const payments = await Payment.findAll({
      where: { month: currentMonth, year: currentYear },
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