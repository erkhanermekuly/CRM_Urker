const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/auth');

// Регистрация (только для директора)
router.post('/register', authenticate, authorize('director'), register);

// Вход
router.post('/login', login);

// Получить текущего пользователя
router.get('/me', authenticate, getMe);

// Обновление профиля
router.put('/profile', authenticate, updateProfile);

// Изменение пароля
router.put('/password', authenticate, changePassword);

module.exports = router;

