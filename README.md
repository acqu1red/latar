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

- `GET /healthz` - проверка здоровья сервера
- `POST /api/generate-photo` - генерация фотографии из эскиза
- `GET /api/furniture` - получение данных мебели

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
- Replicate API (генерация изображений)