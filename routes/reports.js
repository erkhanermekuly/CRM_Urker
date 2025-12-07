const express = require('express');
const router = express.Router();
const {
  getClientsReport,
  getOlympiadsReport,
  getManagersReport,
  exportToExcel,
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/auth');

// Все роуты требуют аутентификации
router.use(authenticate);

// Отчеты доступны директору и зам. директора
router.get('/clients', authorize('director', 'vice_director'), getClientsReport);
router.get('/olympiads', authorize('director', 'vice_director'), getOlympiadsReport);
router.get('/managers', authorize('director', 'vice_director'), getManagersReport);
router.get('/export', authorize('director', 'vice_director'), exportToExcel);

module.exports = router;

