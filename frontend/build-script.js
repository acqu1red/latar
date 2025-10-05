#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем сборку проекта...');

try {
  // Сборка основной версии
  console.log('📦 Собираем основную версию...');
  execSync('npm run build', { stdio: 'inherit' });

  // Сборка версии для поддомена new
  console.log('📦 Собираем версию для поддомена new...');
  execSync('npm run build:new', { stdio: 'inherit' });

  // Копируем файлы для поддомена new в основную папку dist
  console.log('📋 Копируем файлы для поддомена new...');
  
  const distNewPath = path.join(__dirname, 'dist-new', 'public', 'new.html');
  const distPath = path.join(__dirname, 'dist', 'new.html');
  
  if (fs.existsSync(distNewPath)) {
    fs.copyFileSync(distNewPath, distPath);
    console.log('✅ new.html скопирован');
  }

  // Копируем CSS и JS файлы
  const assetsNewPath = path.join(__dirname, 'dist-new', 'assets');
  const assetsPath = path.join(__dirname, 'dist', 'assets');
  
  if (fs.existsSync(assetsNewPath)) {
    const files = fs.readdirSync(assetsNewPath);
    files.forEach(file => {
      if (file.startsWith('new-')) {
        const srcPath = path.join(assetsNewPath, file);
        const destPath = path.join(assetsPath, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ ${file} скопирован`);
      }
    });
  }

  console.log('🎉 Сборка завершена успешно!');
  console.log('📁 Основная версия: dist/');
  console.log('📁 Версия для поддомена new: dist/new.html');

} catch (error) {
  console.error('❌ Ошибка при сборке:', error.message);
  process.exit(1);
}
