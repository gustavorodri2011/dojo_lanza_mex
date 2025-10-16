const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Genera un token JWT para el usuario
 * @param {number} id - ID del usuario
 * @returns {string} Token JWT firmado
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Autentica un usuario y devuelve token JWT
 * @param {Object} req - Request object
 * @param {string} req.body.username - Nombre de usuario
 * @param {string} req.body.password - Contraseña
 * @param {Object} res - Response object
 * @returns {Object} Token JWT y datos del usuario
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Obtiene el perfil del usuario autenticado
 * @param {Object} req - Request object (con req.user del middleware auth)
 * @param {Object} res - Response object
 * @returns {Object} Datos del usuario autenticado
 */
const getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
};

module.exports = { login, getProfile };