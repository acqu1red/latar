# База данных ARCPLAN

## SQLite Database Structure

База данных создается автоматически при первом запуске сервера и хранится в файле `backend/planai.db`.

### Таблицы

#### 1. `users` - Пользователи
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ (автоинкремент) |
| username | TEXT | Псевдоним пользователя (уникальный) |
| name | TEXT | Название организации |
| password_hash | TEXT | Хеш пароля (bcrypt) |
| telegram | TEXT | Telegram для связи |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

#### 2. `user_settings` - Настройки пользователей
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ (автоинкремент) |
| user_id | INTEGER | ID пользователя (внешний ключ) |
| setting_key | TEXT | Ключ настройки |
| setting_value | TEXT | Значение настройки (JSON) |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

**Сохраняемые настройки:**
- `siteStyle` - стиль сайта (advanced/standard)
- `backgroundType` - тип фона (alternative/interactive/standard)
- И другие пользовательские настройки

#### 3. `agency_data` - Данные агентств
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ (автоинкремент) |
| user_id | INTEGER | ID пользователя (внешний ключ) |
| name | TEXT | Название агентства |
| address | TEXT | Адрес |
| city | TEXT | Город |
| country | TEXT | Страна |
| telegram | TEXT | Telegram для связи |
| whatsapp | TEXT | WhatsApp для связи |
| vk | TEXT | VK для связи |
| status | TEXT | Статус (none/pending/approved) |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

### API Endpoints

#### Авторизация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход пользователя
- `GET /api/auth/me` - Получение данных текущего пользователя

#### Настройки
- `GET /api/auth/settings` - Получение всех настроек пользователя
- `POST /api/auth/settings` - Сохранение настроек пользователя

#### Агентство
- `GET /api/auth/agency` - Получение данных агентства
- `POST /api/auth/agency` - Сохранение данных агентства

### Безопасность

- Пароли хешируются с помощью bcrypt (10 раундов)
- JWT токены используются для аутентификации (срок действия: 30 дней)
- Внешние ключи обеспечивают целостность данных
- Индексы создаются для быстрого поиска

### Использование

База данных инициализируется автоматически при импорте модуля `database.mjs`.
Все операции выполняются синхронно с использованием better-sqlite3.

### Миграции

При изменении схемы базы данных необходимо:
1. Обновить SQL в `database.mjs`
2. Перезапустить сервер
3. База данных автоматически применит изменения (IF NOT EXISTS)

