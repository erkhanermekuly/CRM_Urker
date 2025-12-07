# CRM Система для управления олимпиадами

CRM система для автоматизации работы компании, продающей участие школьников в олимпиадах по разным предметам.

## Основные функции

- ✅ Управление клиентами (школьники/родители)
- ✅ Управление олимпиадами
- ✅ Учет рабочего времени сотрудников (чек-таймер)
- ✅ Система ролей и прав доступа
- ✅ Отчетность и аналитика
- ✅ История действий по клиентам
- ✅ Напоминания о звонках
- ✅ Экспорт отчетов в Excel

## Установка

### Требования
- Node.js v14+
- PostgreSQL v12+

### Шаги установки

1. Установите зависимости:
```bash
npm install
```

2. Создайте базу данных в PostgreSQL:
```sql
CREATE DATABASE crm_db;
```

3. Настройте `.env` файл (создайте на основе `.env.example`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

4. Запустите сервер:
```bash
npm start
```

Сервер будет доступен на `http://localhost:5000`

## Первый запуск

После запуска сервера создайте первого пользователя (директора) через API:

```bash
# Сначала зарегистрируйте директора (нужно будет временно убрать проверку роли в routes/auth.js)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Директор",
    "email": "director@example.com",
    "password": "password123",
    "role": "director"
  }'
```

Или создайте пользователя напрямую в базе данных с хешированным паролем.

## Структура проекта

```
crm/
├── config/              # Конфигурация БД
├── models/              # Sequelize модели
│   ├── Client.js        # Модель клиента
│   ├── Employee.js      # Модель сотрудника
│   ├── Olympiad.js     # Модель олимпиады
│   ├── OlympiadRegistration.js  # Регистрации на олимпиады
│   ├── WorkSession.js   # Сессии работы (чек-таймер)
│   ├── ClientHistory.js # История изменений клиентов
│   └── CallReminder.js  # Напоминания о звонках
├── controllers/         # Бизнес-логика
│   ├── authController.js
│   ├── clientController.js
│   ├── olympiadController.js
│   ├── employeeController.js
│   ├── timerController.js
│   ├── reportController.js
│   └── reminderController.js
├── routes/              # API маршруты
├── middlewares/         # Middleware функции
│   └── auth.js          # Аутентификация и авторизация
├── views/               # EJS шаблоны
│   └── pages/
│       ├── login.ejs
│       ├── dashboard.ejs
│       └── clients.ejs
├── public/              # Статические файлы
└── server.js            # Точка входа
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация (только для директора)
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получить текущего пользователя

### Клиенты
- `GET /api/clients` - Получить всех клиентов (с фильтрацией)
- `GET /api/clients/:id` - Получить клиента по ID
- `POST /api/clients` - Создать клиента
- `PUT /api/clients/:id` - Обновить клиента
- `DELETE /api/clients/:id` - Удалить клиента
- `GET /api/clients/:id/history` - Получить историю клиента

**Параметры фильтрации для GET /api/clients:**
- `status` - фильтр по статусу
- `manager_id` - фильтр по менеджеру
- `age` - фильтр по возрасту
- `search` - поиск по ФИО или телефону
- `source` - фильтр по источнику
- `page` - номер страницы
- `limit` - количество на странице

### Олимпиады
- `GET /api/olympiads` - Получить все олимпиады
- `GET /api/olympiads/:id` - Получить олимпиаду по ID
- `POST /api/olympiads` - Создать олимпиаду
- `PUT /api/olympiads/:id` - Обновить олимпиаду
- `DELETE /api/olympiads/:id` - Удалить олимпиаду
- `POST /api/olympiads/:id/register` - Записать клиента на олимпиаду
- `PUT /api/olympiads/:id/registrations/:registrationId` - Обновить регистрацию

### Сотрудники
- `GET /api/employees` - Получить всех сотрудников
- `GET /api/employees/:id` - Получить сотрудника по ID
- `POST /api/employees` - Создать сотрудника (директор/зам. директора)
- `PUT /api/employees/:id` - Обновить сотрудника (директор/зам. директора)
- `DELETE /api/employees/:id` - Удалить сотрудника (только директор)
- `GET /api/employees/:id/activity` - Получить активность сотрудника

### Чек-таймер
- `POST /api/timer/start` - Начать работу
- `POST /api/timer/stop` - Остановить работу
- `POST /api/timer/break` - Зафиксировать перерыв
- `GET /api/timer/current` - Получить текущую сессию
- `GET /api/timer/report` - Получить отчет по времени работы

**Параметры для GET /api/timer/report:**
- `employee_id` - ID сотрудника (опционально)
- `date_from` - дата начала
- `date_to` - дата окончания
- `period` - период (week/month)

### Отчеты
- `GET /api/reports/clients` - Отчет по клиентам
- `GET /api/reports/olympiads` - Отчет по олимпиадам
- `GET /api/reports/managers` - Отчет по эффективности менеджеров
- `GET /api/reports/export` - Экспорт в Excel

**Параметры для экспорта:**
- `type` - тип отчета (clients/work_time)
- `date_from` - дата начала
- `date_to` - дата окончания
- `employee_id` - ID сотрудника (для work_time)

### Напоминания
- `GET /api/reminders` - Получить все напоминания
- `POST /api/reminders` - Создать напоминание
- `PUT /api/reminders/:id` - Обновить напоминание
- `DELETE /api/reminders/:id` - Удалить напоминание

## Роли и права доступа

- **Директор** - полный доступ ко всем функциям
- **Зам. директора** - отчёты + контроль менеджеров
- **Менеджеры** - работа с клиентами
- **Маркетолог** - доступ к лидам и источникам трафика
- **Программисты/IT** - технический доступ

## Статусы клиентов

- `new` - Новый
- `processing` - В обработке
- `interested` - Заинтересован
- `paid` - Оплатил
- `participating` - Участвует
- `completed` - Завершил
- `not_worked` - Не отработан / отказался

## Источники обращения

- `instagram` - Instagram
- `tiktok` - TikTok
- `advertisement` - Реклама
- `whatsapp` - WhatsApp
- `direct` - Прямой контакт
- `other` - Другое

## Предметы олимпиад

- `mathematics` - Математика
- `physics` - Физика
- `chemistry` - Химия
- `computer_science` - ИКТ
- `english` - Английский
- `russian` - Русский
- `history` - История
- `biology` - Биология
- `other` - Другое

## Использование

1. Откройте браузер и перейдите на `http://localhost:5000`
2. Войдите в систему (или создайте первого пользователя)
3. Используйте меню навигации для доступа к различным разделам

## Разработка

Для разработки используется nodemon для автоматической перезагрузки сервера при изменениях.

```bash
npm start
```

## Безопасность

⚠️ **Важно:** В production обязательно измените `JWT_SECRET` в `.env` файле на случайную строку!

## Лицензия

ISC
