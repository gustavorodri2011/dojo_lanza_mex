const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB, sequelize } = require('../config/database');

const checkRawData = async () => {
  try {
    await connectDB();
    console.log('🔍 Checking raw data in database...');
    
    const [results] = await sequelize.query('SELECT * FROM "Members" ORDER BY id DESC LIMIT 1');
    console.log('📊 Raw database data (no hooks):', results[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
};

checkRawData();