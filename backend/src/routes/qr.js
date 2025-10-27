const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/member/:id', qrController.generateMemberQR);
router.post('/checkin', qrController.processQRCheckin);

module.exports = router;