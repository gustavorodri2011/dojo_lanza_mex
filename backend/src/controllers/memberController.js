const { Member, Payment } = require('../models');
const { Op } = require('sequelize');
const { encrypt } = require('../utils/encryption');

/**
 * Obtiene lista de miembros con filtros opcionales
 * @param {Object} req - Request object
 * @param {string} req.query.search - Búsqueda por nombre o apellido
 * @param {string} req.query.belt - Filtro por cinturón
 * @param {string} req.query.active - Filtro por estado activo (true/false)
 * @param {Object} res - Response object
 * @returns {Array} Lista de miembros con sus pagos más recientes
 */
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

/**
 * Obtiene un miembro específico por ID
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID del miembro
 * @param {Object} res - Response object
 * @returns {Object} Miembro con historial completo de pagos
 */
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

/**
 * Crea un nuevo miembro
 * @param {Object} req - Request object
 * @param {Object} req.body - Datos del miembro (firstName, lastName, email, etc.)
 * @param {Object} res - Response object
 * @returns {Object} Miembro creado con datos encriptados automáticamente
 */
const createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Actualiza un miembro existente
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID del miembro
 * @param {Object} req.body - Datos a actualizar
 * @param {Object} res - Response object
 * @returns {Object} Miembro actualizado con datos encriptados automáticamente
 */
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

/**
 * Elimina un miembro
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID del miembro
 * @param {Object} res - Response object
 * @returns {Object} Mensaje de confirmación
 */
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