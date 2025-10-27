const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getIncomeReport,
  getMembersReport,
  getOverdueReport
} = require('../controllers/reportsController');

router.use(auth);

router.get('/income', getIncomeReport);
router.get('/members', getMembersReport);
router.get('/overdue', getOverdueReport);

module.exports = router;