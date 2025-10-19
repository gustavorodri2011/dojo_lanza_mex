const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getDashboardStats,
  getMonthlyRevenue,
  getBeltDistribution,
  getPaymentMethodStats
} = require('../controllers/statsController');

router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/monthly-revenue', authenticateToken, getMonthlyRevenue);
router.get('/belt-distribution', authenticateToken, getBeltDistribution);
router.get('/payment-methods', authenticateToken, getPaymentMethodStats);

module.exports = router;