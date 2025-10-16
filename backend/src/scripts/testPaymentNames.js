const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/database');
const { Payment, Member } = require('../models');

const testPaymentNames = async () => {
  try {
    await connectDB();
    console.log('🧪 Testing payment member names decryption...');
    
    const payments = await Payment.findAll({
      include: [{
        model: Member,
        as: 'member'
      }],
      limit: 1,
      order: [['id', 'DESC']]
    });
    
    if (payments.length > 0) {
      const payment = payments[0];
      console.log('💰 Payment found with member:');
      console.log('   Member ID:', payment.member.id);
      console.log('   First Name:', payment.member.firstName);
      console.log('   Last Name:', payment.member.lastName);
      console.log('   Amount:', payment.amount);
    } else {
      console.log('❌ No payments found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testPaymentNames();