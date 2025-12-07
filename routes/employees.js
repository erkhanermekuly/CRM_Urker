const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeActivity,
} = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middlewares/auth');

// Все роуты требуют аутентификации
router.use(authenticate);

// Просмотр списка сотрудников доступен директору и зам. директора
router.get('/', authorize('director', 'vice_director'), getEmployees);
router.get('/:id', authorize('director', 'vice_director'), getEmployeeById);
router.post('/', authorize('director', 'vice_director'), createEmployee);
router.put('/:id', authorize('director', 'vice_director'), updateEmployee);
router.delete('/:id', authorize('director'), deleteEmployee);
router.get('/:id/activity', getEmployeeActivity);

module.exports = router;

