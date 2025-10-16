const express = require('express');
const { body } = require('express-validator');
const { login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], login);

router.get('/profile', auth, getProfile);

module.exports = router;