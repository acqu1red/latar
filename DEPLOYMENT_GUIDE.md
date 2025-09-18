# 🚀 Руководство по деплою

## ✅ **Настройка завершена!**

Ваш проект полностью готов к деплою на Koyeb и GitHub Pages.

## 🔧 **Что уже настроено:**

### Backend (Koyeb)
- ✅ URL: `https://competitive-camellia-latar-a11ca532.koyeb.app`
- ✅ CORS настроен для GitHub Pages
- ✅ Docker образ готов
- ✅ Все зависимости локальные (без внешних API)

### Frontend (GitHub Pages)
- ✅ URL: `https://acqu1red.github.io/latar`
- ✅ API URL настроен на Koyeb
- ✅ Собран в папке `dist/`

## 📋 **Инструкция по деплою:**

### 1. **Backend на Koyeb**
1. Откройте [Koyeb Dashboard](https://app.koyeb.com)
2. Нажмите "Create Service"
3. Выберите "GitHub" как источник
4. Подключите репозиторий `acqu1red/latar`
5. В настройках:
   - **Root Directory**: `backend`
   - **Port**: `3001`
   - **Build Command**: `npm install`
   - **Run Command**: `node --max-old-space-size=4096 server.mjs`
6. Нажмите "Deploy"

### 2. **Frontend на GitHub Pages**
1. Откройте репозиторий на GitHub
2. Перейдите в Settings → Pages
3. В разделе "Source" выберите "Deploy from a branch"
4. Выберите ветку `main` и папку `/ (root)`
5. Загрузите содержимое папки `frontend/dist/` в корень репозитория
6. Сохраните изменения

### 3. **Проверка работы**
1. Откройте `https://acqu1red.github.io/latar`
2. Загрузите тестовое изображение плана
3. Выберите тип генерации
4. Нажмите "Сгенерировать"
5. Проверьте, что результат загружается

## 🔍 **Диагностика проблем:**

### Проблема: "CORS error"
**Решение:**
- Проверьте, что в `backend/server.mjs` добавлен ваш GitHub Pages URL
- Убедитесь, что backend запущен на Koyeb

### Проблема: "API not responding"
**Решение:**
- Проверьте URL в `frontend/src/config.ts`
- Убедитесь, что Koyeb сервис запущен
- Проверьте логи в Koyeb Dashboard

### Проблема: "Generation failed"
**Решение:**
- Проверьте логи backend в Koyeb
- Убедитесь, что все зависимости установлены
- Проверьте, что папка `uploads` создана

## 📊 **Мониторинг:**

### Koyeb Dashboard
- **URL**: https://app.koyeb.com
- **Сервис**: `latar-backend`
- **Логи**: Доступны в реальном времени
- **Метрики**: CPU, память, запросы

### GitHub Pages
- **URL**: https://acqu1red.github.io/latar
- **Статус**: Проверьте в Settings → Pages
- **Логи**: Доступны в Actions (если настроено)

## 🎯 **Готово!**

После деплоя у вас будет:
- ✅ Полностью автономная система генерации планов
- ✅ Никаких внешних API зависимостей
- ✅ Бесплатное использование без ограничений
- ✅ Профессиональное качество результатов

**Удачного деплоя!** 🎉
