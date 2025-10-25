const express = require('express');
const router = express.Router();
const beltController = require('../controllers/beltController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', beltController.getBeltLevels);

module.exports = router;