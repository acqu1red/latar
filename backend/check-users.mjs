#!/usr/bin/env node

import { userDB } from './src/database.mjs';

console.log('👥 Все пользователи в базе данных:');
console.log('='.repeat(50));

try {
  // Получаем всех пользователей (простой способ - через SQL)
  const db = await import('./src/database.mjs');
  const allUsers = db.default.prepare('SELECT id, username, name, telegram, created_at FROM users ORDER BY created_at DESC').all();
  
  if (allUsers.length === 0) {
    console.log('📭 База данных пуста');
  } else {
    console.log(`📊 Найдено пользователей: ${allUsers.length}\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Псевдоним: ${user.username}`);
      console.log(`   Организация: ${user.name}`);
      console.log(`   Telegram: ${user.telegram || 'не указан'}`);
      console.log(`   Дата регистрации: ${user.created_at}`);
      console.log('');
    });
  }
} catch (error) {
  console.error('❌ Ошибка при получении пользователей:', error.message);
}

console.log('='.repeat(50));
