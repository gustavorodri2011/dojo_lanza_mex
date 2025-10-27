const { User } = require('../models');
const { seedBeltLevels } = require('./beltSeeder');

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@dojo.com',
        password: 'admin123'
      });
      console.log('✅ Default admin user created (admin/admin123)');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

const runSeeders = async () => {
  await seedBeltLevels();
  await createDefaultAdmin();
};

module.exports = { createDefaultAdmin, runSeeders };