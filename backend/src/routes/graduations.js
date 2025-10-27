const express = require('express');
const router = express.Router();
const graduationController = require('../controllers/graduationController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', graduationController.getGraduations);
router.post('/', graduationController.createGraduation);
router.put('/:id', graduationController.updateGraduation);
router.delete('/:id', graduationController.deleteGraduation);

module.exports = router;