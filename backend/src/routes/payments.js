const express = require('express');
const { body } = require('express-validator');
const {
  getPayments,
  createPayment,
  getOverdueMembers,
  downloadReceiptPDF
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

const paymentValidation = [
  body('memberId').isInt().withMessage('Member ID is required'),
  body('amount').isDecimal().withMessage('Amount must be a valid number'),
  body('monthYear').matches(/^\d{4}-\d{2}$/).withMessage('Month year must be in YYYY-MM format')
];

router.use(auth);

router.get('/', getPayments);
router.post('/', paymentValidation, createPayment);
router.get('/overdue', getOverdueMembers);
router.get('/:id/receipt', downloadReceiptPDF);

module.exports = router;