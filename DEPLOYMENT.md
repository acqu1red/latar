# Инструкция по развертыванию

## 🌐 Frontend (GitHub Pages)

Ваш frontend уже развернут на: https://acqu1red.github.io/latar/

### Обновление frontend:
1. Соберите проект:
```bash
cd frontend
npm run build
```

2. Скопируйте содержимое папки `dist/` в ваш GitHub репозиторий
3. Зафиксируйте изменения в Git

## 🚀 Backend (Koyeb)

Ваш backend развернут на: https://competitive-camellia-latar-a11ca532.koyeb.app/

### Переменные окружения в Koyeb:

1. Перейдите в ваш проект на Koyeb
2. Откройте раздел "Environment Variables"
3. Добавьте следующие переменные:

```
OPENAI_API_KEY=your_actual_openai_api_key_here
NODE_ENV=production
PORT=3001
```

### Модель GPT:
- **Используется**: GPT-4o-mini (Vision) - оптимальная по цене/качеству
- **Файл конфигурации**: `backend/src/gptVisionAnalyzer.mjs`
- **Строка 30**: `model: "gpt-4o-mini"`
- **Экономия**: В 33 раза дешевле GPT-4o!

### Обновление backend:
1. Зафиксируйте изменения в Git
2. Koyeb автоматически пересоберет и развернет обновления

## 🔧 Локальная разработка

### Backend:
```bash
cd backend
npm install
npm start
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📝 Важные настройки

### CORS настроен для:
- https://acqu1red.github.io (ваш production frontend)
- http://localhost:5173 (локальная разработка)
- http://localhost:3000 (альтернативный порт)

### API Endpoints:
- `GET /api/furniture` - получение списка мебели
- `POST /api/generate-plan` - генерация SVG плана

## 🎯 Тестирование

1. Откройте https://acqu1red.github.io/latar/
2. Загрузите фотографию плана квартиры
3. Нажмите "Сгенерировать"
4. Получите красивый SVG план

## 🛠️ Troubleshooting

### Если frontend не может подключиться к backend:
1. Проверьте, что backend запущен на Koyeb
2. Проверьте переменные окружения
3. Проверьте CORS настройки

### Если GPT не работает:
1. Проверьте API ключ OpenAI
2. Проверьте баланс на аккаунте OpenAI
3. Система работает в демо-режиме без API ключа
