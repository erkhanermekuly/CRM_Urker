const express = require('express');
const router = express.Router();
const {
  startTimer,
  stopTimer,
  takeBreak,
  getCurrentSession,
  getReport,
} = require('../controllers/timerController');
const { authenticate } = require('../middlewares/auth');

// Все роуты требуют аутентификации
router.use(authenticate);

router.post('/start', startTimer);
router.post('/stop', stopTimer);
router.post('/break', takeBreak);
router.get('/current', getCurrentSession);
router.get('/report', getReport);

module.exports = router;

