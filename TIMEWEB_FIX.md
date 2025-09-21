# Исправление ошибки деплоя на Timeweb

## Проблема
Timeweb использует Node.js v12.22.9 по умолчанию, а нам нужен Node.js 20+ для работы с Sharp.

## Решение

### Вариант 1: Настройка версии Node.js в Timeweb
1. В панели Timeweb перейдите в настройки приложения
2. Найдите раздел "Версия Node.js" или "Node.js Version"
3. Установите версию **Node.js 20+**
4. Перезапустите приложение

### Вариант 2: Использование Docker
1. В настройках приложения выберите "Docker"
2. Используйте файл `Dockerfile.timeweb` (уже создан)
3. Установите корневую папку как `backend`

## Настройки приложения

**Команда сборки:**
```bash
cd backend && npm install --only=production
```

**Команда запуска:**
```bash
cd backend && node server.mjs
```

**Переменные окружения:**
```env
NODE_ENV=production
PORT=3001
SCRIBBLE_DIFFUSION_API_KEY=ваш_ключ_здесь
```

## Проверка
После исправления проверьте:
- Health check: `https://your-app.timeweb.cloud/healthz`
- API: `https://your-app.timeweb.cloud/api/generate-photo`

## Важно
- Минимум 1024MB памяти для обработки изображений
- Таймаут не менее 60 секунд для генерации
- Приложение работает без API ключа (локальная генерация)
