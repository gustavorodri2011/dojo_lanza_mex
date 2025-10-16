const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/database');
const { Member } = require('../models');
const { encrypt } = require('../utils/encryption');

const migrateExistingData = async () => {
  try {
    await connectDB();
    console.log('🔄 Starting data encryption migration...');
    
    // Obtener todos los miembros sin hooks
    const members = await Member.findAll({ 
      hooks: false,
      raw: true 
    });
    
    console.log(`📊 Found ${members.length} members to encrypt`);
    
    for (const member of members) {
      // Verificar si ya está encriptado (los datos encriptados suelen ser más largos)
      const isAlreadyEncrypted = member.firstName && member.firstName.length > 50;
      
      if (!isAlreadyEncrypted) {
        await Member.update({
          firstName: encrypt(member.firstName),
          lastName: encrypt(member.lastName),
          email: encrypt(member.email),
          phone: encrypt(member.phone),
          notes: encrypt(member.notes)
        }, {
          where: { id: member.id },
          hooks: false,
          validate: false
        });
        
        console.log(`✅ Encrypted member: ${member.firstName} ${member.lastName}`);
      } else {
        console.log(`⏭️  Skipped (already encrypted): ${member.id}`);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateExistingData();