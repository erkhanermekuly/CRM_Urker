const { WorkSession, Employee } = require('../models');
const { Op } = require('sequelize');

// Начать работу
const startTimer = async (req, res) => {
  try {
    const employee_id = req.user.id;

    // Проверка активной сессии
    const activeSession = await WorkSession.findOne({
      where: {
        employee_id,
        end_at: null,
      },
    });

    if (activeSession) {
      return res.status(400).json({ error: 'У вас уже есть активная сессия работы' });
    }

    const session = await WorkSession.create({
      employee_id,
      start_at: new Date(),
    });

    res.status(201).json({
      message: 'Работа начата',
      session,
    });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ error: 'Ошибка при запуске таймера' });
  }
};

// Остановить работу
const stopTimer = async (req, res) => {
  try {
    const employee_id = req.user.id;

    const session = await WorkSession.findOne({
      where: {
        employee_id,
        end_at: null,
      },
      order: [['start_at', 'DESC']],
    });

    if (!session) {
      return res.status(400).json({ error: 'Нет активной сессии работы' });
    }

    const endTime = new Date();
    const durationMs = endTime - session.start_at;
    const durationMinutes = Math.floor((durationMs - (session.break_duration || 0) * 60000) / 60000);

    session.end_at = endTime;
    session.duration_minutes = durationMinutes;
    await session.save();

    res.json({
      message: 'Работа остановлена',
      session,
      duration_hours: (durationMinutes / 60).toFixed(2),
    });
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ error: 'Ошибка при остановке таймера' });
  }
};

// Перерыв
const takeBreak = async (req, res) => {
  try {
    const employee_id = req.user.id;
    const { duration_minutes } = req.body; // Длительность перерыва в минутах

    const session = await WorkSession.findOne({
      where: {
        employee_id,
        end_at: null,
      },
      order: [['start_at', 'DESC']],
    });

    if (!session) {
      return res.status(400).json({ error: 'Нет активной сессии работы' });
    }

    const breakDuration = duration_minutes || 15; // По умолчанию 15 минут
    session.break_duration = (session.break_duration || 0) + breakDuration;
    await session.save();

    res.json({
      message: 'Перерыв зафиксирован',
      session,
      break_duration_minutes: session.break_duration,
    });
  } catch (error) {
    console.error('Take break error:', error);
    res.status(500).json({ error: 'Ошибка при фиксации перерыва' });
  }
};

// Получить текущую сессию
const getCurrentSession = async (req, res) => {
  try {
    const employee_id = req.user.id;

    const session = await WorkSession.findOne({
      where: {
        employee_id,
        end_at: null,
      },
      order: [['start_at', 'DESC']],
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    if (!session) {
      return res.json({ active: false, session: null });
    }

    const now = new Date();
    const durationMs = now - session.start_at;
    const durationMinutes = Math.floor((durationMs - (session.break_duration || 0) * 60000) / 60000);

    res.json({
      active: true,
      session: {
        ...session.toJSON(),
        current_duration_minutes: durationMinutes,
        current_duration_hours: (durationMinutes / 60).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Get current session error:', error);
    res.status(500).json({ error: 'Ошибка при получении текущей сессии' });
  }
};

// Получить отчет по времени работы
const getReport = async (req, res) => {
  try {
    const { employee_id, date_from, date_to, period = 'week' } = req.query;
    const targetEmployeeId = employee_id || req.user.id;

    let startDate, endDate;

    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
    } else {
      const now = new Date();
      if (period === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
      } else if (period === 'month') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
      } else {
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
      }
    }

    const sessions = await WorkSession.findAll({
      where: {
        employee_id: targetEmployeeId,
        start_at: {
          [Op.between]: [startDate, endDate],
        },
        end_at: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['start_at', 'DESC']],
    });

    // Подсчет статистики
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(2);
    const totalBreaks = sessions.reduce((sum, s) => sum + (s.break_duration || 0), 0);
    const breakHours = (totalBreaks / 60).toFixed(2);
    const sessionsCount = sessions.length;

    res.json({
      employee_id: targetEmployeeId,
      period: {
        from: startDate,
        to: endDate,
      },
      statistics: {
        total_sessions: sessionsCount,
        total_hours: parseFloat(totalHours),
        total_minutes: totalMinutes,
        total_break_minutes: totalBreaks,
        total_break_hours: parseFloat(breakHours),
        average_session_hours: sessionsCount > 0 ? (totalHours / sessionsCount).toFixed(2) : 0,
      },
      sessions,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Ошибка при получении отчета' });
  }
};

module.exports = {
  startTimer,
  stopTimer,
  takeBreak,
  getCurrentSession,
  getReport,
};

