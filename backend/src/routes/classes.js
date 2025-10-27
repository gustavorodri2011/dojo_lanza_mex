const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  recordAttendance,
  getAttendance
} = require('../controllers/classController');

router.use(auth);

router.get('/', getClasses);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.post('/attendance', recordAttendance);
router.get('/attendance', getAttendance);

module.exports = router;