const { User } = require('../models');

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

module.exports = { createDefaultAdmin };