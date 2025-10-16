const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/database');
const { Member } = require('../models');

const testMemberCreation = async () => {
  try {
    await connectDB();
    console.log('🧪 Testing member creation with encryption...');
    
    const testMember = await Member.create({
      firstName: 'Test',
      lastName: 'Encryption',
      email: 'test@example.com',
      phone: '123456789',
      notes: 'This is a test note'
    });
    
    console.log('✅ Member created with ID:', testMember.id);
    
    // Verificar en base de datos directamente
    const rawMember = await Member.findByPk(testMember.id, { raw: true });
    console.log('📊 Raw data from database:', rawMember);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testMemberCreation();