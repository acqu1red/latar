#!/usr/bin/env node

// Простой тест для проверки запуска приложения
console.log('🧪 Тестирование запуска приложения...');

// Проверяем переменные окружения
console.log('📋 Переменные окружения:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'не установлено');
console.log('PORT:', process.env.PORT || 'не установлено');
console.log('SCRIBBLE_DIFFUSION_API_KEY:', process.env.SCRIBBLE_DIFFUSION_API_KEY ? 'установлено' : 'не установлено');

// Проверяем импорты
try {
  console.log('📦 Проверка импортов...');
  
  // Проверяем основные модули
  const express = await import('express');
  console.log('✅ Express импортирован');
  
  const multer = await import('multer');
  console.log('✅ Multer импортирован');
  
  const cors = await import('cors');
  console.log('✅ CORS импортирован');
  
  const sharp = await import('sharp');
  console.log('✅ Sharp импортирован');
  
  console.log('🎉 Все модули успешно импортированы!');
  
} catch (error) {
  console.error('❌ Ошибка импорта:', error.message);
  process.exit(1);
}

console.log('✅ Тест завершен успешно!');
process.exit(0);
