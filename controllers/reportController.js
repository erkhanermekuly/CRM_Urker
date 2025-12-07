const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { Client, Employee, Olympiad, OlympiadRegistration, WorkSession } = require('../models');

// Отчет по клиентам
const getClientsReport = async (req, res) => {
  try {
    const { date_from, date_to, manager_id, status } = req.query;

    const where = {};
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = date_from;
      if (date_to) where.created_at[Op.lte] = date_to;
    }
    if (manager_id) where.manager_id = manager_id;
    if (status) where.status = status;

    const clients = await Client.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    // Статистика
    const stats = {
      total: clients.length,
      by_status: {},
      by_source: {},
      by_manager: {},
    };

    clients.forEach((client) => {
      // По статусам
      stats.by_status[client.status] = (stats.by_status[client.status] || 0) + 1;

      // По источникам
      stats.by_source[client.source] = (stats.by_source[client.source] || 0) + 1;

      // По менеджерам
      const managerName = client.manager ? client.manager.full_name : 'Не назначен';
      stats.by_manager[managerName] = (stats.by_manager[managerName] || 0) + 1;
    });

    res.json({
      period: { from: date_from, to: date_to },
      statistics: stats,
      clients,
    });
  } catch (error) {
    console.error('Get clients report error:', error);
    res.status(500).json({ error: 'Ошибка при получении отчета по клиентам' });
  }
};

// Отчет по олимпиадам
const getOlympiadsReport = async (req, res) => {
  try {
    const { date_from, date_to, subject } = req.query;

    const where = {};
    if (date_from || date_to) {
      where.date = {};
      if (date_from) where.date[Op.gte] = date_from;
      if (date_to) where.date[Op.lte] = date_to;
    }
    if (subject) where.subject = subject;

    const olympiads = await Olympiad.findAll({
      where,
      include: [
        {
          model: OlympiadRegistration,
          as: 'registrations',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'full_name'],
            },
          ],
        },
      ],
    });

    // Статистика
    const stats = {
      total_olympiads: olympiads.length,
      total_registrations: 0,
      total_paid: 0,
      total_revenue: 0,
      by_subject: {},
      by_status: {},
    };

    olympiads.forEach((olympiad) => {
      const registrations = olympiad.registrations || [];
      stats.total_registrations += registrations.length;

      const paidRegistrations = registrations.filter((r) => r.status === 'paid' || r.status === 'completed');
      stats.total_paid += paidRegistrations.length;

      const revenue = registrations.reduce((sum, r) => sum + parseFloat(r.paid_amount || 0), 0);
      stats.total_revenue += revenue;

      stats.by_subject[olympiad.subject] = (stats.by_subject[olympiad.subject] || 0) + 1;
      stats.by_status[olympiad.status] = (stats.by_status[olympiad.status] || 0) + 1;
    });

    res.json({
      period: { from: date_from, to: date_to },
      statistics: stats,
      olympiads,
    });
  } catch (error) {
    console.error('Get olympiads report error:', error);
    res.status(500).json({ error: 'Ошибка при получении отчета по олимпиадам' });
  }
};

// Отчет по эффективности менеджеров
const getManagersReport = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    const where = {};
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = date_from;
      if (date_to) where.created_at[Op.lte] = date_to;
    }

    const managers = await Employee.findAll({
      where: { role: 'manager' },
      include: [
        {
          model: Client,
          as: 'clients',
          where,
          required: false,
        },
      ],
    });

    const stats = managers.map((manager) => {
      const clients = manager.clients || [];
      const statsByStatus = {};
      const statsBySource = {};

      clients.forEach((client) => {
        statsByStatus[client.status] = (statsByStatus[client.status] || 0) + 1;
        statsBySource[client.source] = (statsBySource[client.source] || 0) + 1;
      });

      return {
        manager_id: manager.id,
        manager_name: manager.full_name,
        total_clients: clients.length,
        by_status: statsByStatus,
        by_source: statsBySource,
        conversion_rate: clients.length > 0
          ? ((statsByStatus.paid || 0) / clients.length * 100).toFixed(2)
          : 0,
      };
    });

    res.json({
      period: { from: date_from, to: date_to },
      managers: stats,
    });
  } catch (error) {
    console.error('Get managers report error:', error);
    res.status(500).json({ error: 'Ошибка при получении отчета по менеджерам' });
  }
};

// Экспорт отчета в Excel
const exportToExcel = async (req, res) => {
  try {
    const { type, date_from, date_to, employee_id } = req.query;

    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (type === 'clients') {
      worksheet = workbook.addWorksheet('Клиенты');
      const where = {};
      if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at[Op.gte] = date_from;
        if (date_to) where.created_at[Op.lte] = date_to;
      }

      const clients = await Client.findAll({
        where,
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['full_name'],
          },
        ],
      });

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'ФИО', key: 'full_name', width: 30 },
        { header: 'Телефон', key: 'phone', width: 15 },
        { header: 'Возраст', key: 'age', width: 10 },
        { header: 'Класс', key: 'class_grade', width: 10 },
        { header: 'Менеджер', key: 'manager', width: 25 },
        { header: 'Статус', key: 'status', width: 15 },
        { header: 'Источник', key: 'source', width: 15 },
        { header: 'Дата создания', key: 'created_at', width: 20 },
      ];

      clients.forEach((client) => {
        worksheet.addRow({
          id: client.id,
          full_name: client.full_name,
          phone: client.phone,
          age: client.age,
          class_grade: client.class_grade,
          manager: client.manager ? client.manager.full_name : 'Не назначен',
          status: client.status,
          source: client.source,
          created_at: client.created_at,
        });
      });
    } else if (type === 'work_time') {
      worksheet = workbook.addWorksheet('Рабочее время');
      const targetEmployeeId = employee_id || req.user.id;

      const where = {
        employee_id: targetEmployeeId,
        end_at: { [Op.ne]: null },
      };

      if (date_from || date_to) {
        where.start_at = {};
        if (date_from) where.start_at[Op.gte] = date_from;
        if (date_to) where.start_at[Op.lte] = date_to;
      }

      const sessions = await WorkSession.findAll({
        where,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['full_name'],
          },
        ],
        order: [['start_at', 'DESC']],
      });

      worksheet.columns = [
        { header: 'Дата', key: 'date', width: 15 },
        { header: 'Сотрудник', key: 'employee', width: 25 },
        { header: 'Начало', key: 'start_at', width: 20 },
        { header: 'Конец', key: 'end_at', width: 20 },
        { header: 'Часов', key: 'hours', width: 10 },
        { header: 'Перерыв (мин)', key: 'break', width: 15 },
      ];

      sessions.forEach((session) => {
        const hours = ((session.duration_minutes || 0) / 60).toFixed(2);
        worksheet.addRow({
          date: session.start_at.toISOString().split('T')[0],
          employee: session.employee ? session.employee.full_name : '',
          start_at: session.start_at,
          end_at: session.end_at,
          hours: hours,
          break: session.break_duration || 0,
        });
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export to excel error:', error);
    res.status(500).json({ error: 'Ошибка при экспорте в Excel' });
  }
};

module.exports = {
  getClientsReport,
  getOlympiadsReport,
  getManagersReport,
  exportToExcel,
};

