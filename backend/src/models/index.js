const User = require('./User');
const Member = require('./Member');
const Payment = require('./Payment');

// Definir asociaciones
Member.hasMany(Payment, { foreignKey: 'memberId', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Sincronizar modelos
const syncModels = async () => {
  try {
    await User.sync();
    await Member.sync();
    await Payment.sync();
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
  }
};

module.exports = {
  User,
  Member,
  Payment,
  syncModels
};