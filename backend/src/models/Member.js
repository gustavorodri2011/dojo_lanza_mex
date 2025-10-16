const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  belt: {
    type: DataTypes.ENUM('blanco', 'amarillo', 'naranja', 'verde', 'azul', 'marron', 'negro'),
    defaultValue: 'blanco'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  hooks: {
    beforeCreate: async (member) => {
      console.log('🔐 Encrypting member data before create');
      if (member.firstName) member.firstName = encrypt(member.firstName);
      if (member.lastName) member.lastName = encrypt(member.lastName);
      if (member.phone) member.phone = encrypt(member.phone);
      if (member.notes) member.notes = encrypt(member.notes);
    },
    beforeUpdate: async (member) => {
      console.log('🔐 Encrypting member data before update');
      if (member.changed('firstName')) member.firstName = encrypt(member.firstName);
      if (member.changed('lastName')) member.lastName = encrypt(member.lastName);
      if (member.changed('phone')) member.phone = encrypt(member.phone);
      if (member.changed('notes')) member.notes = encrypt(member.notes);
    },
    afterFind: async (result) => {
      if (!result) return;
      console.log('🔓 Decrypting member data after find');
      
      const decryptMember = (member) => {
        if (member.firstName) member.firstName = decrypt(member.firstName);
        if (member.lastName) member.lastName = decrypt(member.lastName);
        if (member.phone) member.phone = decrypt(member.phone);
        if (member.notes) member.notes = decrypt(member.notes);
      };
      
      if (Array.isArray(result)) {
        result.forEach(decryptMember);
      } else {
        decryptMember(result);
      }
    }
  }
});



module.exports = Member;