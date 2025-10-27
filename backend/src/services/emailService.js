const nodemailer = require('nodemailer');

/**
 * Configuración del transportador de email
 */
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Configuraciones adicionales para servidores locales
    tls: {
      rejectUnauthorized: false // Acepta certificados auto-firmados
    },
    debug: true, // Habilita logs de debug
    logger: true // Habilita logging
  };

  console.log('Email config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user
  });

  return nodemailer.createTransport(config);
};

/**
 * Envía email de recordatorio de pago atrasado
 * @param {Object} member - Datos del miembro
 * @param {string} monthYear - Mes/año del pago atrasado
 */
const sendOverduePaymentEmail = async (member, monthYear) => {
  if (!member.email) {
    console.log(`Member ${member.firstName} ${member.lastName} has no email`);
    return;
  }

  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"🥋 Dojo Lanza Mexicana" <${process.env.EMAIL_USER}>`,
    to: member.email,
    subject: 'Recordatorio de Pago - Dojo Lanza Mexicana',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #7c3aed); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🥋 Dojo Lanza Mexicana</h1>
          <p style="margin: 10px 0 0 0;">Sistema de Gestión de Cuotas</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hola ${member.firstName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Esperamos que te encuentres bien. Te escribimos para recordarte que tu cuota mensual 
            correspondiente al período <strong>${monthYear}</strong> aún está pendiente de pago.
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚠️ Pago Pendiente:</strong> ${monthYear}
            </p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Para mantener tu membresía activa y continuar disfrutando de nuestras clases, 
            te pedimos que realices tu pago lo antes posible.
          </p>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Información de tu membresía:</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li><strong>Nombre:</strong> ${member.firstName} ${member.lastName}</li>
              <li><strong>Cinturón:</strong> ${member.belt}</li>
              <li><strong>Fecha de ingreso:</strong> ${new Date(member.joinDate).toLocaleDateString('es-ES')}</li>
            </ul>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Si ya realizaste el pago, por favor ignora este mensaje. Si tienes alguna pregunta 
            o necesitas asistencia, no dudes en contactarnos.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Gracias por ser parte de nuestra comunidad de karate
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Dojo Lanza Mexicana - Sistema de Gestión de Cuotas</p>
          <p style="margin: 5px 0 0 0;">Este es un mensaje automático, por favor no responder a este email.</p>
        </div>
      </div>
    `
  };

  try {
    console.log(`Attempting to send email to: ${member.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${member.email}. Message ID: ${info.messageId}`);
    console.log('Email info:', info);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${member.email}:`, error.message);
    console.error('Full error:', error);
    return false;
  }
};

/**
 * Envía emails masivos a miembros con pagos atrasados
 * @param {Array} overdueMembers - Lista de miembros con pagos atrasados
 * @param {string} monthYear - Mes/año del pago atrasado
 */
const sendBulkOverdueEmails = async (overdueMembers, monthYear) => {
  const results = {
    sent: 0,
    failed: 0,
    noEmail: 0
  };

  for (const member of overdueMembers) {
    if (!member.email) {
      results.noEmail++;
      continue;
    }

    const success = await sendOverduePaymentEmail(member, monthYear);
    if (success) {
      results.sent++;
    } else {
      results.failed++;
    }

    // Pausa entre emails para evitar spam
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
};

/**
 * Prueba la conexión SMTP
 */
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sendOverduePaymentEmail,
  sendBulkOverdueEmails,
  testEmailConnection
};