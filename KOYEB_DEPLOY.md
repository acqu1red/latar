# Деплой на Koyeb

## Обзор

Проект настроен для автоматического деплоя на Koyeb с поддержкой ControlNet для локальной генерации планов квартир с мебелью.

## Что включено

- ✅ **Docker контейнер** с Node.js и Python
- ✅ **ControlNet** для локальной генерации
- ✅ **Автоматический деплой** при push в main ветку
- ✅ **Health check** для мониторинга

## Структура деплоя

### Backend (Koyeb)
- **Файл**: `koyeb.yaml`
- **Dockerfile**: `backend/Dockerfile`
- **Порт**: 3001
- **Health check**: `/healthz`

### Frontend (GitHub Pages)
- **Автоматический деплой** при push
- **URL**: https://acqu1red.github.io/latar

## Настройка Koyeb

### 1. Создание сервиса

1. Войдите в [Koyeb Dashboard](https://app.koyeb.com)
2. Нажмите "Create Service"
3. Выберите "GitHub" как источник
4. Подключите репозиторий `acqu1red/latar`
5. Выберите ветку `main`
6. Укажите поддиректорию: `backend`

### 2. Конфигурация

Koyeb автоматически использует `koyeb.yaml`:

```yaml
services:
  - name: latar-backend
    source:
      repository: https://github.com/acqu1red/latar
      subdirectory: backend
    ports:
      - port: 3001
        targetPort: 3001
        protocol: http
    env:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "3001"
    healthcheck:
      path: /healthz
      port: 3001
      initialDelaySeconds: 120
      periodSeconds: 30
    dockerfile: Dockerfile
```

### 3. Переменные окружения

Koyeb автоматически установит:
- `NODE_ENV=production`
- `PORT=3001`

## Процесс деплоя

### Автоматический деплой

1. **Push в main** → автоматический деплой
2. **Docker build** → создание образа с ControlNet
3. **Health check** → проверка работоспособности
4. **Service ready** → сервис доступен

### Ручной деплой

```bash
# 1. Зафиксировать изменения
git add .
git commit -m "Update for deployment"
git push origin main

# 2. Koyeb автоматически начнет деплой
# 3. Проверить статус в Koyeb Dashboard
```

## Мониторинг

### Health Check
- **URL**: `https://your-app.koyeb.app/healthz`
- **Ожидаемый ответ**: `{"status":"ok","timestamp":"..."}`

### Логи
- Доступны в Koyeb Dashboard
- Показывают процесс инициализации ControlNet
- Отображают ошибки генерации

## Возможные проблемы

### 1. Долгая инициализация
- **Причина**: Загрузка моделей ControlNet
- **Решение**: Увеличьте `initialDelaySeconds` в healthcheck

### 2. Ошибка Python зависимостей
- **Причина**: Проблемы с установкой PyTorch
- **Решение**: Проверьте логи сборки Docker

### 3. Недостаточно памяти
- **Причина**: ControlNet требует много RAM
- **Решение**: Обновите план Koyeb

## Оптимизация

### Для продакшена
1. **Увеличьте RAM** - ControlNet требует минимум 4GB
2. **Настройте кэширование** моделей
3. **Мониторинг** использования ресурсов

### Для разработки
1. **Локальная разработка** с `npm start`
2. **Тестирование** на staging окружении
3. **Логирование** для отладки

## URL после деплоя

- **Backend API**: `https://your-app.koyeb.app`
- **Frontend**: `https://acqu1red.github.io/latar`
- **Health Check**: `https://your-app.koyeb.app/healthz`

## Поддержка

При проблемах с деплоем:
1. Проверьте логи в Koyeb Dashboard
2. Убедитесь что все файлы зафиксированы в git
3. Проверьте статус health check
4. Обратитесь к документации Koyeb
