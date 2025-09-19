# Пример переменных окружения

Создайте файл `.env` в папке `backend/` и добавьте следующие переменные:

```env
# Scribble Diffusion API Configuration
# Получите ваш API ключ у провайдера Scribble Diffusion
SCRIBBLE_DIFFUSION_API_KEY=your_scribble_diffusion_api_key_here

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration (опционально)
# CORS_ORIGIN=https://your-frontend-domain.com
```

## Настройка для продакшена

Для деплоя на Koyeb, добавьте переменную `SCRIBBLE_DIFFUSION_API_KEY` в настройки сервиса с вашим реальным API ключом.
