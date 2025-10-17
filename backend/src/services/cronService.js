const cron = require('node-cron');
const { Op } = require('sequelize');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const { sendBulkOverdueEmails } = require('./emailService');

/**
 * Encuentra miembros con pagos atrasados
 */
const findOverdueMembers = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Buscar miembros activos
  const activeMembers = await Member.findAll({
    where: {
      status: 'active'
    }
  });

  const overdueMembers = [];

  for (const member of activeMembers) {
    // Verificar si tiene pago del mes actual
    const hasCurrentPayment = await Payment.findOne({
      where: {
        memberId: member.id,
        month: currentMonth,
        year: currentYear
      }
    });

    if (!hasCurrentPayment) {
      overdueMembers.push({
        ...member.toJSON(),
        overdueMonth: `${currentMonth.toString().padStart(2, '0')}/${currentYear}`
      });
    }
  }

  return overdueMembers;
};

/**
 * Tarea programada para enviar alertas de pagos atrasados
 */
const scheduleOverdueAlerts = () => {
  // Ejecutar cada día a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔄 Running scheduled overdue payment check...');
    
    try {
      const overdueMembers = await findOverdueMembers();
      
      if (overdueMembers.length === 0) {
        console.log('✅ No overdue payments found');
        return;
      }

      console.log(`📧 Found ${overdueMembers.length} members with overdue payments`);
      
      const currentDate = new Date();
      const monthYear = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      
      const results = await sendBulkOverdueEmails(overdueMembers, monthYear);
      
      console.log('📊 Email sending results:', {
        sent: results.sent,
        failed: results.failed,
        noEmail: results.noEmail,
        total: overdueMembers.length
      });
      
    } catch (error) {
      console.error('❌ Error in scheduled overdue alerts:', error);
    }
  });

  console.log('⏰ Overdue payment alerts scheduled for 9:00 AM daily');
};

/**
 * Tarea programada para recordatorios semanales (viernes)
 */
const scheduleWeeklyReminders = () => {
  // Ejecutar cada viernes a las 10:00 AM
  cron.schedule('0 10 * * 5', async () => {
    console.log('🔄 Running weekly payment reminder check...');
    
    try {
      const overdueMembers = await findOverdueMembers();
      
      if (overdueMembers.length === 0) {
        console.log('✅ No overdue payments for weekly reminder');
        return;
      }

      console.log(`📧 Sending weekly reminders to ${overdueMembers.length} members`);
      
      const currentDate = new Date();
      const monthYear = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      
      const results = await sendBulkOverdueEmails(overdueMembers, monthYear);
      
      console.log('📊 Weekly reminder results:', results);
      
    } catch (error) {
      console.error('❌ Error in weekly reminders:', error);
    }
  });

  console.log('⏰ Weekly payment reminders scheduled for Fridays at 10:00 AM');
};

/**
 * Inicializa todos los trabajos programados
 */
const initializeCronJobs = () => {
  scheduleOverdueAlerts();
  scheduleWeeklyReminders();
  console.log('🚀 All cron jobs initialized successfully');
};

/**
 * Detiene todos los trabajos programados
 */
const stopAllCronJobs = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log('⏹️ All cron jobs stopped');
};

module.exports = {
  findOverdueMembers,
  scheduleOverdueAlerts,
  scheduleWeeklyReminders,
  initializeCronJobs,
  stopAllCronJobs
};