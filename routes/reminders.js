const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { authenticate, authorize } = require('../middlewares/auth');

// Все роуты требуют аутентификации
router.use(authenticate);

// Напоминания доступны: директор, зам. директора, менеджер
router.get('/', authorize('director', 'vice_director', 'manager'), getReminders);
router.post('/', authorize('director', 'vice_director', 'manager'), createReminder);
router.put('/:id', authorize('director', 'vice_director', 'manager'), updateReminder);
router.delete('/:id', authorize('director', 'vice_director', 'manager'), deleteReminder);

module.exports = router;

