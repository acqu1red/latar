# Настройка ScribbleDiffusion API

## Переменные окружения

Добавьте следующие переменные в настройки Koyeb:

### Обязательные
- `SCRIBBLE_DIFFUSION_API_URL` - URL вашего ScribbleDiffusion API

### Опциональные
- `SCRIBBLE_DIFFUSION_API_KEY` - API ключ (если требуется авторизация)

## Пример настройки

В настройках Koyeb добавьте:

```
SCRIBBLE_DIFFUSION_API_URL=https://your-api-domain.com/api/generate
SCRIBBLE_DIFFUSION_API_KEY=your_api_key_here
```

## Приоритет генерации

Система будет использовать API в следующем порядке:

1. **ScribbleDiffusion API** (ваш API) - приоритет 1
2. **Локальная Stable Diffusion** - приоритет 2 (если настроена)
3. **Replicate API** - приоритет 3 (если есть токен)
4. **Простая локальная генерация** - fallback

## Формат API

Ваш API должен принимать POST запросы с JSON:

```json
{
  "image": "base64_encoded_image",
  "prompt": "text description",
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

И возвращать:

```json
{
  "image": "base64_encoded_result_image"
}
```

Или:

```json
{
  "url": "https://example.com/result-image.png"
}
```

## Проверка работы

После настройки в логах должно появиться:

```
✅ ScribbleDiffusion API URL настроен
🚀 Используем ScribbleDiffusion API
```

## Fallback

Если ваш API недоступен, система автоматически переключится на локальную генерацию.
