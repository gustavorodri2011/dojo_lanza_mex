const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDashboardStats,
  getMonthlyRevenue,
  getBeltDistribution,
  getPaymentMethodStats
} = require('../controllers/statsController');

router.get('/dashboard', auth, getDashboardStats);
router.get('/monthly-revenue', auth, getMonthlyRevenue);
router.get('/belt-distribution', auth, getBeltDistribution);
router.get('/payment-methods', auth, getPaymentMethodStats);

module.exports = router;