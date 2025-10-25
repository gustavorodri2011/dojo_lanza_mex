const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');
const Class = require('./Class');
const Attendance = require('./Attendance');
const Graduation = require('./Graduation');
const BeltLevel = require('./BeltLevel');

// Definir asociaciones
Member.hasMany(Payment, { foreignKey: 'memberId', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Asociaciones de clases y asistencia
Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendances' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Member.hasMany(Attendance, { foreignKey: 'memberId', as: 'attendances' });
Attendance.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Asociaciones de graduaciones
Member.hasMany(Graduation, { foreignKey: 'memberId', as: 'graduations' });
Graduation.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Asociaciones de cinturones
BeltLevel.hasMany(Member, { foreignKey: 'beltId', as: 'members' });
Member.belongsTo(BeltLevel, { foreignKey: 'beltId', as: 'belt' });
BeltLevel.hasMany(Graduation, { foreignKey: 'fromBeltId', as: 'graduationsFrom' });
BeltLevel.hasMany(Graduation, { foreignKey: 'toBeltId', as: 'graduationsTo' });
Graduation.belongsTo(BeltLevel, { foreignKey: 'fromBeltId', as: 'fromBelt' });
Graduation.belongsTo(BeltLevel, { foreignKey: 'toBeltId', as: 'toBelt' });

// Sincronizar modelos
const syncModels = async (force = false) => {
  try {
    await BeltLevel.sync({ force });
    await User.sync({ force });
    await Member.sync({ force });
    await Payment.sync({ force });
    await Class.sync({ force });
    await Attendance.sync({ force });
    await Graduation.sync({ force });
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
  Graduation,
  BeltLevel,
  syncModels
};