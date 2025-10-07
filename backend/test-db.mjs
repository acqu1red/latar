#!/usr/bin/env node

import { userDB, settingsDB, agencyDB } from './src/database.mjs';
import bcrypt from 'bcrypt';

console.log('🔍 Тестирование базы данных SQLite');
console.log('='.repeat(50));

// Тест 1: Создание пользователя
console.log('\n📝 Тест 1: Создание тестового пользователя');
try {
  const passwordHash = await bcrypt.hash('test123', 10);
  const result = userDB.create('testuser', 'Тестовая Организация', passwordHash, '@testuser');
  console.log('✅ Пользователь создан, ID:', result.lastInsertRowid);
} catch (error) {
  console.log('ℹ️  Пользователь уже существует или ошибка:', error.message);
}

// Тест 2: Поиск пользователя
console.log('\n🔍 Тест 2: Поиск пользователя по username');
const user = userDB.findByUsername('testuser');
if (user) {
  console.log('✅ Пользователь найден:');
  console.log('   ID:', user.id);
  console.log('   Username:', user.username);
  console.log('   Name:', user.name);
  console.log('   Telegram:', user.telegram);
} else {
  console.log('❌ Пользователь не найден');
}

// Тест 3: Сохранение настроек
if (user) {
  console.log('\n💾 Тест 3: Сохранение настроек');
  settingsDB.set(user.id, 'siteStyle', 'advanced');
  settingsDB.set(user.id, 'backgroundType', 'alternative');
  settingsDB.set(user.id, 'theme', { primary: '#000', secondary: '#fff' });
  console.log('✅ Настройки сохранены');

  // Тест 4: Загрузка настроек
  console.log('\n📥 Тест 4: Загрузка настроек');
  const settings = settingsDB.getAll(user.id);
  console.log('✅ Настройки загружены:');
  console.log(JSON.stringify(settings, null, 2));

  // Тест 5: Сохранение данных агентства
  console.log('\n🏢 Тест 5: Сохранение данных агентства');
  agencyDB.upsert(user.id, {
    name: 'ООО "Тестовое Агентство"',
    address: 'ул. Тестовая, д. 1',
    city: 'Москва',
    country: 'Россия',
    telegram: '@testagency',
    whatsapp: '+79001234567',
    vk: 'vk.com/testagency',
    status: 'pending'
  });
  console.log('✅ Данные агентства сохранены');

  // Тест 6: Загрузка данных агентства
  console.log('\n📥 Тест 6: Загрузка данных агентства');
  const agency = agencyDB.get(user.id);
  console.log('✅ Данные агентства загружены:');
  console.log(JSON.stringify(agency, null, 2));
}

console.log('\n' + '='.repeat(50));
console.log('✅ Все тесты завершены!');
console.log('📊 База данных находится в: backend/planai.db');

