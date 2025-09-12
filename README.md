# latar

Генератор 2D-планов квартир по фотографиям

## Описание

Приложение для создания 2D-планов квартир на основе загруженных фотографий комнат с использованием ИИ.

## Технологии

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4 Vision + DALL-E 3
- **Deploy**: GitHub Pages + Koyeb

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Настройте переменные окружения в `.env`
4. Запустите приложение:
   ```bash
   # Frontend
   cd frontend && npm run dev
   
   # Backend
   cd backend && npm start
   ```

## Использование

1. Загрузите фотографии комнат
2. Укажите площадь каждой комнаты
3. Настройте расположение в конструкторе
4. Нажмите "Генерировать план"
