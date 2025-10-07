# Latar - Генератор планов квартир с AI

Проект для генерации технических планов помещений с помощью искусственного интеллекта.

## Структура проекта

```
latar/
├── frontend/          # React + Vite приложение
│   ├── src/          # Исходный код frontend
│   ├── dist/         # Собранное приложение
│   └── package.json  # Зависимости frontend
├── backend/          # Node.js + Express сервер
│   ├── src/          # Исходный код backend
│   ├── server.mjs    # Главный файл сервера
│   └── package.json  # Зависимости backend
├── uploads/          # Загруженные файлы
└── package.json      # Корневой package.json для управления проектом
```

## Установка и запуск

### Установка всех зависимостей
```bash
npm run install:all
```

### Разработка (запуск frontend и backend одновременно)
```bash
npm run dev
```

### Разработка только frontend
```bash
npm run dev:frontend
```

### Разработка только backend
```bash
npm run dev:backend
```

### Сборка для продакшена
```bash
npm run build
```

### Запуск в продакшене
```bash
npm start
```

## API Endpoints

### Основные
- `GET /healthz` - проверка здоровья сервера
- `POST /api/generate-technical-plan` - генерация технического плана
- `GET /api/furniture` - получение данных мебели

### Авторизация и пользователи
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход пользователя
- `GET /api/auth/me` - данные текущего пользователя

### Настройки
- `GET /api/auth/settings` - получение настроек пользователя
- `POST /api/auth/settings` - сохранение настроек пользователя

### Агентство
- `GET /api/auth/agency` - получение данных агентства
- `POST /api/auth/agency` - сохранение данных агентства

## Переменные окружения

Создайте файл `.env` в папке `backend/`:

```env
SCRIBBLE_DIFFUSION_API_KEY=your_replicate_api_key_here
PORT=3001
NODE_ENV=production
```

## Технологии

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Konva (для работы с канвасом)

### Backend
- Node.js
- Express
- Multer (загрузка файлов)
- Sharp (обработка изображений)
- CORS
- SQLite + better-sqlite3 (база данных)
- bcrypt (хеширование паролей)
- jsonwebtoken (JWT аутентификация)
- CometAPI (генерация изображений)

### База данных
- SQLite (встроенная база данных)
- Автоматическое создание таблиц при запуске
- Хранение пользователей, настроек и данных агентств
- Подробнее: `backend/DATABASE.md`