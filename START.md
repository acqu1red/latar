# Инструкция по запуску системы

## Быстрый старт

### 1. Запуск Backend

```bash
cd backend
npm install
npm start
```

Backend будет доступен на `http://localhost:3001`

### 2. Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

## Настройка GPT Vision API

1. Получите API ключ от OpenAI
2. Создайте файл `.env` в папке `backend`:
```
OPENAI_API_KEY=your_actual_api_key_here
```

3. Перезапустите backend

## Тестирование

1. Откройте `http://localhost:5173` в браузере
2. Загрузите фотографию плана квартиры
3. Нажмите "Сгенерировать"
4. Получите красивый SVG план

## Демо-режим

Если у вас нет API ключа OpenAI, система будет работать в демо-режиме и возвращать пример SVG плана.

## Структура проекта

- `frontend/` - React приложение
- `backend/` - Express сервер с GPT Vision API
- `koyeb.yaml` - Конфигурация для развертывания
- `furniture.json` - Описание мебели и дизайна

## Особенности

- Современный дизайн с градиентами и анимациями
- Поддержка загрузки изображений
- Интеграция с GPT Vision API
- Красивая генерация SVG планов
- Адаптивный интерфейс
