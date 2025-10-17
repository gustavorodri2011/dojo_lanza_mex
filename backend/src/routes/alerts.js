const express = require('express');
const { body } = require('express-validator');
const {
  sendOverdueAlerts,
  scheduleAlerts,
  testEmailConfig
} = require('../controllers/alertController');
const auth = require('../middleware/auth');

const router = express.Router();

const scheduleValidation = [
  body('enabled').isBoolean().withMessage('Enabled must be boolean'),
  body('dayOfMonth').optional().isInt({ min: 1, max: 28 }).withMessage('Day of month must be between 1-28')
];

router.use(auth);

router.post('/send-overdue', sendOverdueAlerts);
router.post('/schedule', scheduleValidation, scheduleAlerts);
router.get('/test-email', testEmailConfig);

module.exports = router;