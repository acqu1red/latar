# Система URL изображений ARCPLAN

## Обзор

Новая система ARCPLAN использует URL вместо сохранения файлов на диск, что значительно экономит память и улучшает производительность. Вместо сохранения изображений локально, система генерирует URL и сохраняет их в базе данных.

## Архитектура

### Компоненты системы

1. **База данных** (`image_urls` таблица) - хранит URL и метаданные изображений
2. **Сервис URL** (`imageUrlService.mjs`) - генерирует URL и управляет внешними сервисами
3. **API endpoints** - новые маршруты для работы с URL изображений
4. **Фронтенд** - обновлен для работы с URL вместо base64

### Типы изображений

- `user_upload` - загруженные пользователем изображения
- `generated_plan` - сгенерированные технические планы
- `generated_cleanup` - изображения после удаления объектов

## База данных

### Таблица `image_urls`

```sql
CREATE TABLE image_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  image_type TEXT NOT NULL,
  original_filename TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata TEXT, -- JSON с дополнительными данными
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Индексы

- `idx_image_urls_user_id` - для быстрого поиска по пользователю
- `idx_image_urls_type` - для фильтрации по типу изображения

## API Endpoints

### Генерация технических планов

**POST** `/api/generate-technical-plan`

**Новый формат ответа:**
```json
{
  "success": true,
  "result": {
    "id": 1,
    "imageUrl": "https://your-domain.com/temp-images/generated_plan_1234567890_abc123.jpg",
    "thumbnailUrl": "https://your-domain.com/temp-images/thumb_generated_plan_1234567890_abc123.jpg",
    "originalFilename": "plan.jpg",
    "mode": "withFurniture",
    "createdAt": "2025-10-10T16:41:45.450Z"
  },
  "message": "Технический план успешно создан в режиме \"С мебелью\""
}
```

**Для множественных изображений:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "imageUrl": "https://your-domain.com/temp-images/generated_plan_1234567890_abc123.jpg",
      "thumbnailUrl": "https://your-domain.com/temp-images/thumb_generated_plan_1234567890_abc123.jpg",
      "originalFilename": "plan1.jpg",
      "mode": "withFurniture",
      "createdAt": "2025-10-10T16:41:45.450Z"
    }
  ],
  "message": "Создано 1 технических планов в режиме \"С мебелью\""
}
```

### Удаление объектов

**POST** `/api/remove-objects`

**Формат ответа аналогичен генерации технических планов, но с типом `generated_cleanup`**

### Управление изображениями

#### Получение изображений пользователя

**GET** `/api/images`

**Параметры:**
- `type` - фильтр по типу изображения (опционально)
- `limit` - количество изображений (по умолчанию 50)
- `offset` - смещение для пагинации (по умолчанию 0)

**Ответ:**
```json
{
  "success": true,
  "images": [
    {
      "id": 1,
      "user_id": 1,
      "image_type": "generated_plan",
      "original_filename": "plan.jpg",
      "image_url": "https://your-domain.com/temp-images/generated_plan_1234567890_abc123.jpg",
      "thumbnail_url": "https://your-domain.com/temp-images/thumb_generated_plan_1234567890_abc123.jpg",
      "metadata": "{\"mode\":\"withFurniture\",\"originalSize\":1024000}",
      "created_at": "2025-10-10T16:41:45.450Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Удаление изображения

**DELETE** `/api/images/:id`

**Ответ:**
```json
{
  "success": true,
  "message": "Изображение успешно удалено"
}
```

#### Статистика изображений

**GET** `/api/images/stats`

**Ответ:**
```json
{
  "success": true,
  "stats": [
    {
      "image_type": "generated_plan",
      "count": 5,
      "first_created": "2025-10-10T16:41:45.450Z",
      "last_created": "2025-10-10T16:41:45.450Z"
    }
  ]
}
```

## Внешние сервисы

### Поддерживаемые сервисы

1. **Temporary** (по умолчанию) - локальное временное хранилище
2. **Imgur** - облачное хранилище изображений
3. **Cloudinary** - профессиональное облачное хранилище

### Конфигурация

Настройка через переменные окружения:

```env
# Temporary (включен по умолчанию)
TEMPORARY_IMAGE_BASE_URL=https://your-domain.com/temp-images/

# Imgur
IMGUR_API_KEY=your_imgur_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Преимущества новой системы

### Экономия памяти

- **До**: Изображения сохранялись на диск + base64 в ответах
- **После**: Только URL в базе данных + внешнее хранилище

### Улучшенная производительность

- Меньше операций с файловой системой
- Быстрее передача данных (URL вместо base64)
- Возможность кэширования на CDN

### Масштабируемость

- Легко переключиться между сервисами хранения
- Возможность использования CDN
- Автоматическое управление жизненным циклом изображений

## Миграция

### Совместимость

Система поддерживает обратную совместимость:
- Старые API endpoints продолжают работать
- Фронтенд автоматически определяет формат ответа
- Fallback на base64 для старых версий сервера

### Очистка старых данных

```javascript
// Удаление старых изображений (старше 30 дней)
imageUrlsDB.deleteOld(30);
```

## Мониторинг

### Логирование

Все операции с изображениями логируются:
- Генерация URL
- Загрузка на внешние сервисы
- Удаление изображений
- Ошибки обработки

### Метрики

- Количество изображений по типам
- Использование внешних сервисов
- Время обработки
- Ошибки загрузки

## Безопасность

### Права доступа

- Пользователи могут видеть только свои изображения
- Директор имеет доступ ко всем изображениям
- Гости не имеют доступа к API изображений

### Валидация

- Проверка типов файлов
- Ограничения размера
- Санитизация имен файлов
- Проверка прав доступа

## Развертывание

### Требования

- Node.js 18+
- SQLite3
- Доступ к внешним сервисам (опционально)

### Переменные окружения

```env
# Обязательные
JWT_SECRET=your_jwt_secret
COMETAPI_API_KEY=your_comet_api_key

# Опциональные
TEMPORARY_IMAGE_BASE_URL=https://your-domain.com/temp-images/
IMGUR_API_KEY=your_imgur_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

### Запуск

```bash
cd backend
npm install
npm start
```

## Тестирование

Запустите тест системы:

```bash
node test-url-system.mjs
```

Тест проверяет:
- Структуру базы данных
- Функции работы с URL
- Совместимость с существующими данными
- Работу внешних сервисов

## Поддержка

При возникновении проблем:

1. Проверьте логи сервера
2. Убедитесь в корректности переменных окружения
3. Проверьте доступность внешних сервисов
4. Запустите тест системы

## Планы развития

- [ ] Интеграция с AWS S3
- [ ] Автоматическое сжатие изображений
- [ ] Поддержка WebP формата
- [ ] Аналитика использования изображений
- [ ] Автоматическая очистка неиспользуемых изображений
