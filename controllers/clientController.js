const { Op } = require('sequelize');
const { Client, Employee, ClientHistory, CallReminder } = require('../models');

// Получить всех клиентов с фильтрацией
const getClients = async (req, res) => {
  try {
    const {
      status,
      manager_id,
      age,
      search,
      source,
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (manager_id) where.manager_id = manager_id;
    if (age) where.age = age;
    if (source) where.source = source;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Client.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      clients: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Ошибка при получении клиентов' });
  }
};

// Получить клиента по ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
        },
        {
          model: ClientHistory,
          as: 'history',
          include: [
            {
              model: Employee,
              as: 'employee',
              attributes: ['id', 'full_name'],
            },
          ],
          order: [['created_at', 'DESC']],
        },
        {
          model: CallReminder,
          as: 'reminders',
          where: { status: 'pending' },
          required: false,
        },
      ],
    });

    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении клиента' });
  }
};

// Создать клиента
const createClient = async (req, res) => {
  try {
    const { full_name, phone, age, class_grade, manager_id, status, comment, source } = req.body;

    const client = await Client.create({
      full_name,
      phone,
      age,
      class_grade,
      manager_id,
      status: status || 'new',
      comment,
      source: source || 'other',
    });

    // Запись в историю
    await ClientHistory.create({
      client_id: client.id,
      employee_id: req.user.id,
      action: 'created',
      description: `Клиент создан: ${full_name}`,
    });

    const clientWithManager = await Client.findByPk(client.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.status(201).json(clientWithManager);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
};

// Обновить клиента
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, age, class_grade, manager_id, status, comment, source } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    // Сохранение старых значений для истории
    const oldValues = {
      status: client.status,
      manager_id: client.manager_id,
      comment: client.comment,
    };

    // Обновление полей
    if (full_name !== undefined) client.full_name = full_name;
    if (phone !== undefined) client.phone = phone;
    if (age !== undefined) client.age = age;
    if (class_grade !== undefined) client.class_grade = class_grade;
    if (manager_id !== undefined) client.manager_id = manager_id;
    if (status !== undefined) client.status = status;
    if (comment !== undefined) client.comment = comment;
    if (source !== undefined) client.source = source;

    await client.save();

    // Запись изменений в историю
    if (status && status !== oldValues.status) {
      await ClientHistory.create({
        client_id: client.id,
        employee_id: req.user.id,
        action: 'status_changed',
        old_value: oldValues.status,
        new_value: status,
        description: `Статус изменен с "${oldValues.status}" на "${status}"`,
      });
    }

    if (manager_id && manager_id !== oldValues.manager_id) {
      await ClientHistory.create({
        client_id: client.id,
        employee_id: req.user.id,
        action: 'assigned_to_manager',
        old_value: oldValues.manager_id?.toString(),
        new_value: manager_id.toString(),
        description: `Клиент назначен другому менеджеру`,
      });
    }

    if (comment && comment !== oldValues.comment) {
      await ClientHistory.create({
        client_id: client.id,
        employee_id: req.user.id,
        action: 'comment_added',
        description: `Добавлен комментарий: ${comment}`,
      });
    }

    const updatedClient = await Client.findByPk(client.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.json(updatedClient);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении клиента' });
  }
};

// Удалить клиента
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    await client.destroy();

    res.json({ message: 'Клиент успешно удален' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Ошибка при удалении клиента' });
  }
};

// Получить историю клиента
const getClientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await ClientHistory.findAll({
      where: { client_id: id },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(history);
  } catch (error) {
    console.error('Get client history error:', error);
    res.status(500).json({ error: 'Ошибка при получении истории клиента' });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
};

