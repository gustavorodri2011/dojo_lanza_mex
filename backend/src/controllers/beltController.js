const { BeltLevel } = require('../models');

const getBeltLevels = async (req, res) => {
  try {
    const belts = await BeltLevel.findAll({
      order: [['order', 'ASC']]
    });
    res.json(belts);
  } catch (error) {
    console.error('Error fetching belt levels:', error);
    res.status(500).json({ message: 'Error fetching belt levels' });
  }
};

module.exports = {
  getBeltLevels
};