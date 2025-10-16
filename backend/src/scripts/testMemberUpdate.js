const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB, sequelize } = require('../config/database');
const { Member } = require('../models');

const testMemberUpdate = async () => {
  try {
    await connectDB();
    console.log('🧪 Testing member update with encryption...');
    
    // Buscar el último miembro
    const member = await Member.findOne({ order: [['id', 'DESC']] });
    console.log('📋 Found member:', member.firstName, member.lastName);
    
    // Actualizar el miembro
    await member.update({
      firstName: 'Updated',
      lastName: 'Name',
      phone: '987654321'
    });
    
    console.log('✅ Member updated');
    
    // Verificar en base de datos directamente
    const [results] = await sequelize.query(`SELECT * FROM "Members" WHERE id = ${member.id}`);
    console.log('📊 Raw data after update:', results[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testMemberUpdate();