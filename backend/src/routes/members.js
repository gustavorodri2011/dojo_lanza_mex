const express = require('express');
const { body } = require('express-validator');
const {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const auth = require('../middleware/auth');

const router = express.Router();

const memberValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('joinDate').optional().isDate().withMessage('Invalid date format')
];

router.use(auth);

router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', memberValidation, createMember);
router.put('/:id', memberValidation, updateMember);
router.delete('/:id', deleteMember);

module.exports = router;