const jwt = require('jsonwebtoken');
const { Employee } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware для проверки токена
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const employee = await Employee.findByPk(decoded.id);
    
    if (!employee || employee.status !== 'active') {
      return res.status(401).json({ error: 'Недействительный токен или неактивный пользователь' });
    }

    req.user = employee;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};

// Middleware для проверки роли
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    next();
  };
};

// Генерация токена
const generateToken = (employee) => {
  return jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  authorize,
  generateToken,
  JWT_SECRET,
};

