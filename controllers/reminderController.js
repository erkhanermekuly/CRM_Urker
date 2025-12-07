const { CallReminder, Client, Employee } = require('../models');
const { Op } = require('sequelize');

// Получить все напоминания
const getReminders = async (req, res) => {
  try {
    const { manager_id, status, date_from, date_to } = req.query;

    const where = {};
    if (manager_id) where.manager_id = manager_id;
    if (status) where.status = status;
    if (date_from || date_to) {
      where.reminder_date = {};
      if (date_from) where.reminder_date[Op.gte] = date_from;
      if (date_to) where.reminder_date[Op.lte] = date_to;
    }

    const reminders = await CallReminder.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'full_name', 'phone', 'status'],
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['reminder_date', 'ASC']],
    });

    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Ошибка при получении напоминаний' });
  }
};

// Создать напоминание
const createReminder = async (req, res) => {
  try {
    const { client_id, reminder_date, description } = req.body;
    const manager_id = req.user.id;

    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    const reminder = await CallReminder.create({
      client_id,
      manager_id,
      reminder_date,
      description,
      status: 'pending',
    });

    const reminderWithDetails = await CallReminder.findByPk(reminder.id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'full_name', 'phone'],
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    res.status(201).json(reminderWithDetails);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Ошибка при создании напоминания' });
  }
};

// Обновить напоминание
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reminder_date, description, status } = req.body;

    const reminder = await CallReminder.findByPk(id);
    if (!reminder) {
      return res.status(404).json({ error: 'Напоминание не найдено' });
    }

    if (reminder_date !== undefined) reminder.reminder_date = reminder_date;
    if (description !== undefined) reminder.description = description;
    if (status !== undefined) reminder.status = status;

    await reminder.save();

    const updatedReminder = await CallReminder.findByPk(reminder.id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'full_name', 'phone'],
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    res.json(updatedReminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении напоминания' });
  }
};

// Удалить напоминание
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await CallReminder.findByPk(id);
    if (!reminder) {
      return res.status(404).json({ error: 'Напоминание не найдено' });
    }

    await reminder.destroy();

    res.json({ message: 'Напоминание успешно удалено' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Ошибка при удалении напоминания' });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
};

