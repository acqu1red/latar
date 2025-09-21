# Исправление ошибки Docker на Timeweb

## Проблема
Timeweb не может выполнить команду `cd backend && node server.mjs` из-за отсутствия команды `cd` в Docker контейнере.

## Решение

### Вариант 1: Использовать Docker (рекомендуется)

1. **В настройках Timeweb выберите "Docker"**
2. **Используйте файл `Dockerfile.timeweb`** (уже создан)
3. **Установите корневую папку как `backend`**

### Вариант 2: Исправить Procfile

Если используете Procfile, замените содержимое на:
```
web: node server.mjs
```

### Вариант 3: Настройки приложения

**Команда сборки:**
```bash
cd backend && npm install --only=production
```

**Команда запуска:**
```bash
node server.mjs
```

**Корневая папка:** `backend`

## Проверка

После исправления проверьте:
- Health check: `https://your-app.timeweb.cloud/healthz`
- API: `https://your-app.timeweb.cloud/api/generate-photo`

## Важно

- **API ключ обязателен!** Без него приложение не запустится
- **Node.js 20+** обязателен для работы с Sharp
- **Минимум 1024MB памяти** для обработки изображений
