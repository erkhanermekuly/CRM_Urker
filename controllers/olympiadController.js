const { Op } = require('sequelize');
const { Olympiad, OlympiadRegistration, Client, Employee } = require('../models');

// Получить все олимпиады
const getOlympiads = async (req, res) => {
  try {
    const { subject, status, date_from, date_to, page = 1, limit = 50 } = req.query;

    const where = {};
    if (subject) where.subject = subject;
    if (status) where.status = status;
    if (date_from || date_to) {
      where.date = {};
      if (date_from) where.date[Op.gte] = date_from;
      if (date_to) where.date[Op.lte] = date_to;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Olympiad.findAndCountAll({
      where,
      include: [
        {
          model: OlympiadRegistration,
          as: 'registrations',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'full_name', 'phone'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'ASC']],
    });

    res.json({
      olympiads: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get olympiads error:', error);
    res.status(500).json({ error: 'Ошибка при получении олимпиад' });
  }
};

// Получить олимпиаду по ID
const getOlympiadById = async (req, res) => {
  try {
    const { id } = req.params;

    const olympiad = await Olympiad.findByPk(id, {
      include: [
        {
          model: OlympiadRegistration,
          as: 'registrations',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'full_name', 'phone', 'age', 'class_grade'],
            },
          ],
        },
      ],
    });

    if (!olympiad) {
      return res.status(404).json({ error: 'Олимпиада не найдена' });
    }

    res.json(olympiad);
  } catch (error) {
    console.error('Get olympiad by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении олимпиады' });
  }
};

// Создать олимпиаду
const createOlympiad = async (req, res) => {
  try {
    const { name, subject, date, format, price, location, description } = req.body;

    const olympiad = await Olympiad.create({
      name,
      subject,
      date,
      format: format || 'online',
      price,
      location,
      description,
      status: 'planned',
    });

    res.status(201).json(olympiad);
  } catch (error) {
    console.error('Create olympiad error:', error);
    res.status(500).json({ error: 'Ошибка при создании олимпиады' });
  }
};

// Обновить олимпиаду
const updateOlympiad = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, date, format, price, location, description, status } = req.body;

    const olympiad = await Olympiad.findByPk(id);
    if (!olympiad) {
      return res.status(404).json({ error: 'Олимпиада не найдена' });
    }

    if (name !== undefined) olympiad.name = name;
    if (subject !== undefined) olympiad.subject = subject;
    if (date !== undefined) olympiad.date = date;
    if (format !== undefined) olympiad.format = format;
    if (price !== undefined) olympiad.price = price;
    if (location !== undefined) olympiad.location = location;
    if (description !== undefined) olympiad.description = description;
    if (status !== undefined) olympiad.status = status;

    await olympiad.save();

    res.json(olympiad);
  } catch (error) {
    console.error('Update olympiad error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении олимпиады' });
  }
};

// Удалить олимпиаду
const deleteOlympiad = async (req, res) => {
  try {
    const { id } = req.params;

    const olympiad = await Olympiad.findByPk(id);
    if (!olympiad) {
      return res.status(404).json({ error: 'Олимпиада не найдена' });
    }

    await olympiad.destroy();

    res.json({ message: 'Олимпиада успешно удалена' });
  } catch (error) {
    console.error('Delete olympiad error:', error);
    res.status(500).json({ error: 'Ошибка при удалении олимпиады' });
  }
};

// Записать клиента на олимпиаду
const registerClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id } = req.body;

    const olympiad = await Olympiad.findByPk(id);
    if (!olympiad) {
      return res.status(404).json({ error: 'Олимпиада не найдена' });
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    // Проверка на дубликат
    const existingRegistration = await OlympiadRegistration.findOne({
      where: { client_id, olympiad_id: id },
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Клиент уже зарегистрирован на эту олимпиаду' });
    }

    const registration = await OlympiadRegistration.create({
      client_id,
      olympiad_id: id,
      status: 'registered',
    });

    const registrationWithDetails = await OlympiadRegistration.findByPk(registration.id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'full_name', 'phone'],
        },
        {
          model: Olympiad,
          as: 'olympiad',
        },
      ],
    });

    res.status(201).json(registrationWithDetails);
  } catch (error) {
    console.error('Register client error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации клиента' });
  }
};

// Обновить статус регистрации
const updateRegistration = async (req, res) => {
  try {
    const { id, registrationId } = req.params;
    const { status, paid_amount, score, certificate_url } = req.body;

    const registration = await OlympiadRegistration.findOne({
      where: { id: registrationId, olympiad_id: id },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Регистрация не найдена' });
    }

    if (status !== undefined) registration.status = status;
    if (paid_amount !== undefined) {
      registration.paid_amount = paid_amount;
      if (paid_amount > 0 && !registration.paid_at) {
        registration.paid_at = new Date();
        registration.status = 'paid';
      }
    }
    if (score !== undefined) registration.score = score;
    if (certificate_url !== undefined) registration.certificate_url = certificate_url;

    await registration.save();

    const updatedRegistration = await OlympiadRegistration.findByPk(registration.id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'full_name', 'phone'],
        },
        {
          model: Olympiad,
          as: 'olympiad',
        },
      ],
    });

    res.json(updatedRegistration);
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении регистрации' });
  }
};

module.exports = {
  getOlympiads,
  getOlympiadById,
  createOlympiad,
  updateOlympiad,
  deleteOlympiad,
  registerClient,
  updateRegistration,
};

