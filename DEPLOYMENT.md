# Инструкции для деплоя на Timeweb

## Переменные окружения для Timeweb

Установите следующие переменные окружения в панели управления Timeweb:

```
CORS_ORIGIN=https://acqu1red.github.io/latar
COMET_API_KEY=sk-Zcgm0xEeuH7Lf7gT46nVADw7RLSyRIjwH1YPnOP35PKie5Q1
CORS_ALLOW_ALL=true
VITE_API_BASE_URL=acqu1red-latar-c0f7.twc1.net
```

## Команды для сборки и запуска

### Сборка:
```bash
npm install --omit=dev
```

### Запуск:
```bash
node backend/server.mjs
```

## Проверка работоспособности

После деплоя проверьте:
1. Health check: `https://acqu1red-latar-c0f7.twc1.net/healthz`
2. API тест: `https://acqu1red-latar-c0f7.twc1.net/api/test-comet-api`

## Структура проекта

```
/
├── backend/
│   ├── server.mjs          # Основной сервер
│   ├── src/
│   │   ├── cometApiGenerator.mjs  # Генерация изображений
│   │   ├── authRoutes.mjs         # Аутентификация
│   │   ├── database.mjs           # База данных
│   │   └── imageUrlService.mjs    # Загрузка изображений
│   └── package.json
├── frontend/
│   ├── dist/               # Собранный frontend
│   └── src/
└── package.json
```

## API Endpoints

- `POST /api/generate-technical-plan` - Генерация технических планов
- `POST /api/remove-objects` - Удаление объектов
- `GET /api/furniture` - Получение данных мебели
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /healthz` - Health check

## Модель для генерации

Используется модель: `gemini-2.5-flash-image-preview`

## Логи

Сервер выводит подробные логи для отладки:
- Проверка API ключа
- Статус генерации
- Ошибки CORS
- Информация о запросах
