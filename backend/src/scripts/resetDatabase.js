require('dotenv').config();
const { connectDB } = require('../config/database');
const { syncModels } = require('../models');
const { runSeeders } = require('../config/seeder');

const resetDatabase = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('🗑️ Dropping and recreating tables...');
    await syncModels(true);
    
    console.log('🌱 Running seeders...');
    await runSeeders();
    
    console.log('✅ Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();