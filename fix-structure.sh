#!/bin/bash

# Скрипт для изменения структуры проекта для Timeweb

echo "🔧 Изменяем структуру проекта для Timeweb..."

# Перемещаем все файлы из backend/ в корень
echo "📁 Перемещаем файлы из backend/ в корень..."
mv backend/* .
mv backend/.* . 2>/dev/null || true

# Удаляем пустую папку backend
echo "🗑️ Удаляем пустую папку backend..."
rmdir backend

# Обновляем package.json в корне
echo "📝 Обновляем package.json..."
cp package.json package.json.backup
cp backend/package.json package.json

echo "✅ Структура проекта изменена!"
echo ""
echo "📋 Теперь в Timeweb используйте:"
echo "   Команда сборки: npm install --only=production"
echo "   Команда запуска: node server.mjs"
echo "   Корневая папка: (оставить пустой)"
echo ""
echo "🚀 Не забудьте зафиксировать изменения в Git!"
