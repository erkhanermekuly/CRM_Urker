const sequelize = require('../config/database');
const Client = require('./Client');
const Employee = require('./Employee');
const Olympiad = require('./Olympiad');
const OlympiadRegistration = require('./OlympiadRegistration');
const WorkSession = require('./WorkSession');
const ClientHistory = require('./ClientHistory');
const CallReminder = require('./CallReminder');

// Ассоциации для CRM
// Employee (Manager) -> Client
Employee.hasMany(Client, { foreignKey: 'manager_id', as: 'clients' });
Client.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });

// Employee -> WorkSession
Employee.hasMany(WorkSession, { foreignKey: 'employee_id', as: 'workSessions' });
WorkSession.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Client -> ClientHistory
Client.hasMany(ClientHistory, { foreignKey: 'client_id', as: 'history' });
ClientHistory.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Employee -> ClientHistory
Employee.hasMany(ClientHistory, { foreignKey: 'employee_id', as: 'actions' });
ClientHistory.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Client -> CallReminder
Client.hasMany(CallReminder, { foreignKey: 'client_id', as: 'reminders' });
CallReminder.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Employee -> CallReminder
Employee.hasMany(CallReminder, { foreignKey: 'manager_id', as: 'callReminders' });
CallReminder.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });

// Client -> OlympiadRegistration
Client.hasMany(OlympiadRegistration, { foreignKey: 'client_id', as: 'registrations' });
OlympiadRegistration.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Olympiad -> OlympiadRegistration
Olympiad.hasMany(OlympiadRegistration, { foreignKey: 'olympiad_id', as: 'registrations' });
OlympiadRegistration.belongsTo(Olympiad, { foreignKey: 'olympiad_id', as: 'olympiad' });

module.exports = {
  sequelize,
  Client,
  Employee,
  Olympiad,
  OlympiadRegistration,
  WorkSession,
  ClientHistory,
  CallReminder,
};
