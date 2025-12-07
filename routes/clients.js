const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
} = require('../controllers/clientController');
const { authenticate, authorize } = require('../middlewares/auth');

// Все роуты требуют аутентификации
router.use(authenticate);

// Клиенты доступны: директор, зам. директора, менеджер, маркетолог
router.get('/', authorize('director', 'vice_director', 'manager', 'marketer'), getClients);
router.get('/:id', authorize('director', 'vice_director', 'manager', 'marketer'), getClientById);
router.post('/', authorize('director', 'vice_director', 'manager', 'marketer'), createClient);
router.put('/:id', authorize('director', 'vice_director', 'manager', 'marketer'), updateClient);
router.delete('/:id', authorize('director', 'vice_director'), deleteClient);
router.get('/:id/history', authorize('director', 'vice_director', 'manager', 'marketer'), getClientHistory);

module.exports = router;

