const bcrypt = require('bcrypt');
const { Employee, Client, WorkSession } = require('../models');
const { Op } = require('sequelize');

// Получить всех сотрудников
const getEmployees = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const employees = await Employee.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
    });

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Ошибка при получении сотрудников' });
  }
};

// Получить сотрудника по ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Client,
          as: 'clients',
          attributes: ['id', 'full_name', 'status'],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении сотрудника' });
  }
};

// Создать сотрудника
const createEmployee = async (req, res) => {
  try {
    const { full_name, email, password, phone, role, status } = req.body;

    // Проверка существующего пользователя
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'manager',
      status: status || 'active',
    });

    const employeeWithoutPassword = await Employee.findByPk(employee.id, {
      attributes: { exclude: ['password'] },
    });

    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Ошибка при создании сотрудника' });
  }
};

// Обновить сотрудника
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, phone, role, status } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    if (full_name !== undefined) employee.full_name = full_name;
    if (email !== undefined) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (role !== undefined) employee.role = role;
    if (status !== undefined) employee.status = status;

    if (password) {
      employee.password = await bcrypt.hash(password, 10);
    }

    await employee.save();

    const employeeWithoutPassword = await Employee.findByPk(employee.id, {
      attributes: { exclude: ['password'] },
    });

    res.json(employeeWithoutPassword);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении сотрудника' });
  }
};

// Удалить сотрудника
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    await employee.destroy();

    res.json({ message: 'Сотрудник успешно удален' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Ошибка при удалении сотрудника' });
  }
};

// Получить активность сотрудника
const getEmployeeActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_from, date_to } = req.query;

    const where = { employee_id: id };
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = date_from;
      if (date_to) where.created_at[Op.lte] = date_to;
    }

    const [clients, workSessions] = await Promise.all([
      Client.count({ where: { manager_id: id, ...where } }),
      WorkSession.findAll({
        where: {
          employee_id: id,
          end_at: { [Op.ne]: null },
        },
        order: [['start_at', 'DESC']],
        limit: 50,
      }),
    ]);

    const totalWorkMinutes = workSessions.reduce(
      (sum, s) => sum + (s.duration_minutes || 0),
      0
    );
    const totalWorkHours = (totalWorkMinutes / 60).toFixed(2);

    res.json({
      employee_id: id,
      period: { from: date_from, to: date_to },
      statistics: {
        clients_count: clients,
        work_sessions_count: workSessions.length,
        total_work_hours: parseFloat(totalWorkHours),
      },
      recent_sessions: workSessions,
    });
  } catch (error) {
    console.error('Get employee activity error:', error);
    res.status(500).json({ error: 'Ошибка при получении активности сотрудника' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeActivity,
};

