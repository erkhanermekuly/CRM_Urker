const bcrypt = require('bcrypt');
const { Employee } = require('../models');
const { generateToken } = require('../middlewares/auth');

// Регистрация (только для директора)
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    // Проверка существующего пользователя
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание сотрудника
    const employee = await Employee.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'manager',
    });

    const token = generateToken(employee);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: employee.id,
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

// Вход
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (employee.status !== 'active') {
      return res.status(401).json({ error: 'Аккаунт неактивен' });
    }

    const isValidPassword = await bcrypt.compare(password, employee.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = generateToken(employee);

    res.json({
      message: 'Успешный вход',
      token,
      user: {
        id: employee.id,
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

// Получение текущего пользователя
const getMe = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    res.json(employee);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
};

// Обновление профиля
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;
    const employee = await Employee.findByPk(req.user.id);

    if (!employee) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (full_name !== undefined) employee.full_name = full_name;
    if (phone !== undefined) employee.phone = phone;
    if (email !== undefined) {
      // Проверка на уникальность email
      const existing = await Employee.findOne({ where: { email } });
      if (existing && existing.id !== employee.id) {
        return res.status(400).json({ error: 'Email уже используется' });
      }
      employee.email = email;
    }

    await employee.save();

    const employeeWithoutPassword = await Employee.findByPk(employee.id, {
      attributes: { exclude: ['password'] },
    });

    res.json(employeeWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
};

// Изменение пароля
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Требуется текущий и новый пароль' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть не менее 6 символов' });
    }

    const employee = await Employee.findByPk(req.user.id);

    if (!employee) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка текущего пароля
    const isValidPassword = await bcrypt.compare(current_password, employee.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(new_password, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Ошибка при изменении пароля' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};

