const { Member, Payment } = require('../models');
const { Op } = require('sequelize');
const { encrypt } = require('../utils/encryption');

const getMembers = async (req, res) => {
  try {
    const { search, belt, active } = req.query;
    const where = {};

    if (belt) where.belt = belt;
    if (active !== undefined) where.isActive = active === 'true';

    let members = await Member.findAll({
      where,
      include: [{
        model: Payment,
        as: 'payments',
        limit: 1,
        order: [['paymentDate', 'DESC']]
      }],
      order: [['id', 'ASC']]
    });

    // Filtrar por búsqueda después de desencriptar
    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter(member => 
        member.firstName.toLowerCase().includes(searchLower) ||
        member.lastName.toLowerCase().includes(searchLower)
      );
    }

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{
        model: Payment,
        as: 'payments',
        order: [['paymentDate', 'DESC']]
      }]
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.update(req.body);
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const deleted = await Member.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
};