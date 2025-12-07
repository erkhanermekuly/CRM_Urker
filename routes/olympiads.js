const express = require('express');
const router = express.Router();
const {
  getOlympiads,
  getOlympiadById,
  createOlympiad,
  updateOlympiad,
  deleteOlympiad,
  registerClient,
  updateRegistration,
} = require('../controllers/olympiadController');
const { authenticate, authorize } = require('../middlewares/auth');

// Все роуты требуют аутентификации
router.use(authenticate);

// Олимпиады доступны: директор, зам. директора, менеджер
router.get('/', authorize('director', 'vice_director', 'manager'), getOlympiads);
router.get('/:id', authorize('director', 'vice_director', 'manager'), getOlympiadById);
router.post('/', authorize('director', 'vice_director'), createOlympiad);
router.put('/:id', authorize('director', 'vice_director', 'manager'), updateOlympiad);
router.delete('/:id', authorize('director', 'vice_director'), deleteOlympiad);
router.post('/:id/register', authorize('director', 'vice_director', 'manager'), registerClient);
router.put('/:id/registrations/:registrationId', authorize('director', 'vice_director', 'manager'), updateRegistration);

module.exports = router;

