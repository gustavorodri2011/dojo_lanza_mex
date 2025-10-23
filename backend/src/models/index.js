const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');
const Class = require('./Class');
const Attendance = require('./Attendance');

// Definir asociaciones
Member.hasMany(Payment, { foreignKey: 'memberId', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Asociaciones de clases y asistencia
Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendances' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Member.hasMany(Attendance, { foreignKey: 'memberId', as: 'attendances' });
Attendance.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Sincronizar modelos
const syncModels = async () => {
  try {
    await User.sync();
    await Member.sync();
    await Payment.sync();
    await Class.sync();
    await Attendance.sync();
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
  }
};

module.exports = {
  User,
  Member,
  Payment,
  Class,
  Attendance,
  syncModels
};