const { Member, Payment } = require('../models');
const { sendBulkOverdueEmails, testEmailConnection } = require('../services/emailService');
const { decrypt } = require('../utils/encryption');
const { findOverdueMembers, initializeCronJobs, stopAllCronJobs } = require('../services/cronService');

/**
 * Envía alertas por email a miembros con pagos atrasados
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const sendOverdueAlerts = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Obtener miembros con pagos atrasados
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

    if (overdueMembers.length === 0) {
      return res.json({
        message: 'No hay miembros con pagos atrasados',
        sent: 0,
        failed: 0,
        noEmail: 0
      });
    }

    // Desencriptar datos de miembros
    overdueMembers.forEach(member => {
      member.firstName = decrypt(member.firstName);
      member.lastName = decrypt(member.lastName);
      member.phone = decrypt(member.phone);
      member.notes = decrypt(member.notes);
    });

    // Enviar emails
    const results = await sendBulkOverdueEmails(overdueMembers, currentMonth);

    res.json({
      message: `Alertas enviadas para el período ${currentMonth}`,
      totalOverdue: overdueMembers.length,
      ...results
    });
  } catch (error) {
    console.error('Error sending overdue alerts:', error);
    res.status(500).json({ message: 'Error sending alerts' });
  }
};

/**
 * Programa el envío automático de alertas (cron job)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const scheduleAlerts = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (enabled) {
      initializeCronJobs();
      res.json({
        message: 'Alertas automáticas activadas - Diario 9:00 AM y Viernes 10:00 AM',
        enabled: true
      });
    } else {
      stopAllCronJobs();
      res.json({
        message: 'Alertas automáticas desactivadas',
        enabled: false
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error configuring alerts' });
  }
};

/**
 * Prueba la conexión del servidor de email
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const testEmailConfig = async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    res.json({
      success: isConnected,
      message: isConnected ? 'Conexión SMTP exitosa' : 'Error en conexión SMTP'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error probando conexión SMTP',
      error: error.message 
    });
  }
};

module.exports = {
  sendOverdueAlerts,
  scheduleAlerts,
  testEmailConfig
};