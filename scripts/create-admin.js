const bcrypt = require('bcrypt');
const { Employee } = require('../models');
const sequelize = require('../config/database');
require('dotenv').config();

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const fullName = process.argv[4] || 'Администратор';

    // Проверка существующего пользователя
    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      console.log('✗ Пользователь с таким email уже существует');
      process.exit(1);
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание директора
    const admin = await Employee.create({
      full_name: fullName,
      email,
      password: hashedPassword,
      role: 'director',
      status: 'active',
    });

    console.log('✓ Администратор успешно создан!');
    console.log(`  Email: ${email}`);
    console.log(`  Пароль: ${password}`);
    console.log(`  Роль: director`);
    console.log('\n⚠️  Не забудьте изменить пароль после первого входа!');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Ошибка при создании администратора:', error);
    await sequelize.close();
    process.exit(1);
  }
}

createAdmin();

