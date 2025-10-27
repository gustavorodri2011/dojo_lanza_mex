const BeltLevel = require('../models/BeltLevel');

const beltLevels = [
  { name: 'blanco', order: 1, color: '#F3F4F6' },
  { name: 'naranja', order: 2, color: '#FB923C' },
  { name: 'azul', order: 3, color: '#3B82F6' },
  { name: 'azul barra amarillo', order: 4, color: '#3B82F6' },
  { name: 'amarillo', order: 5, color: '#EAB308' },
  { name: 'amarillo barra verde', order: 6, color: '#EAB308' },
  { name: 'verde', order: 7, color: '#22C55E' },
  { name: 'verde barra marron', order: 8, color: '#22C55E' },
  { name: 'marron', order: 9, color: '#A16207' },
  { name: 'marron barra negro', order: 10, color: '#A16207' },
  { name: '1er DAN', order: 11, color: '#1F2937' },
  { name: '2do DAN', order: 12, color: '#1F2937' },
  { name: '3er DAN', order: 13, color: '#1F2937' }
];

const seedBeltLevels = async () => {
  try {
    const existingBelts = await BeltLevel.count();
    
    if (existingBelts === 0) {
      await BeltLevel.bulkCreate(beltLevels);
      console.log('✅ Belt levels seeded successfully');
    } else {
      console.log('ℹ️ Belt levels already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding belt levels:', error);
  }
};

module.exports = { seedBeltLevels };