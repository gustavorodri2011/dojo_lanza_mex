const { jsPDF } = require('jspdf');

/**
 * Genera un recibo PDF para un pago
 * @param {Object} payment - Datos del pago
 * @param {Object} member - Datos del miembro
 * @returns {Buffer} Buffer del PDF generado
 */
const generateReceiptPDF = (payment, member) => {
  const doc = new jsPDF();
  
  // Configuración del documento
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Encabezado del dojo
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('DOJO LANZA MEXICO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Sistema de Gestión de Cuotas', pageWidth / 2, yPosition, { align: 'center' });
  
  // Línea separadora
  yPosition += 15;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  // Título del recibo
  yPosition += 20;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('RECIBO DE PAGO', pageWidth / 2, yPosition, { align: 'center' });
  
  // Información del recibo
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  // Número de recibo
  doc.text(`Recibo No: ${payment.receiptNumber}`, margin, yPosition);
  yPosition += 10;
  
  // Fecha
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString('es-ES');
  doc.text(`Fecha: ${paymentDate}`, margin, yPosition);
  yPosition += 20;
  
  // Información del miembro
  doc.setFont(undefined, 'bold');
  doc.text('DATOS DEL MIEMBRO:', margin, yPosition);
  yPosition += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text(`Nombre: ${member.firstName} ${member.lastName}`, margin + 10, yPosition);
  yPosition += 8;
  
  if (member.email) {
    doc.text(`Email: ${member.email}`, margin + 10, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Cinturón: ${member.belt}`, margin + 10, yPosition);
  yPosition += 20;
  
  // Información del pago
  doc.setFont(undefined, 'bold');
  doc.text('DETALLE DEL PAGO:', margin, yPosition);
  yPosition += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text(`Período: ${payment.monthYear}`, margin + 10, yPosition);
  yPosition += 8;
  
  doc.text(`Método de pago: ${payment.paymentMethod}`, margin + 10, yPosition);
  yPosition += 8;
  
  if (payment.notes) {
    doc.text(`Notas: ${payment.notes}`, margin + 10, yPosition);
    yPosition += 8;
  }
  
  // Monto (destacado)
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`MONTO PAGADO: $${payment.amount}`, margin + 10, yPosition);
  
  // Pie de página
  yPosition = doc.internal.pageSize.height - 40;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Gracias por su pago puntual', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.text('Este recibo es válido como comprobante de pago', pageWidth / 2, yPosition, { align: 'center' });
  
  return Buffer.from(doc.output('arraybuffer'));
};

module.exports = {
  generateReceiptPDF
};