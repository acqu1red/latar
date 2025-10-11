# 🚀 Настройка и запуск Plan AI

## ✅ Проблема решена!

Ошибка регистрации была связана с тем, что frontend не мог подключиться к backend API. Теперь все настроено и работает!

## 🔧 Что было исправлено:

1. **Настроено проксирование API** в `frontend/vite.config.mjs`
2. **Запущены оба сервера** (frontend на GitHub Pages, backend на Timeweb)
3. **API endpoints работают** корректно
4. **База данных SQLite** создана и функционирует

## 🎯 Как запустить проект:

### Вариант 1: Автоматический запуск (рекомендуется)
```bash
# В корне проекта
npm run dev
```

### Вариант 2: Ручной запуск
```bash
# Терминал 1 - Backend
cd backend
node server.mjs

# Терминал 2 - Frontend  
cd frontend
npm run dev
```

## 🌐 Доступ к приложению:

- **Frontend**: https://acqu1red.github.io/latar
- **Backend API**: https://acqu1red-latar-084a.twc1.net
- **Health Check**: https://acqu1red-latar-084a.twc1.net/healthz

## 📊 Проверка работы:

### Тест API регистрации:
```bash
curl -X POST https://acqu1red-latar-084a.twc1.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","name":"Test Org","password":"123456"}'
```

### Проверка пользователей в БД:
```bash
cd backend
node check-users.mjs
```

## 🎉 Теперь можно:

1. **Открыть** https://acqu1red.github.io/latar/new
2. **Нажать** на аватар (вопросительный знак)
3. **Выбрать** "Войти / Регистрация"
4. **Зарегистрироваться** с псевдонимом
5. **Все настройки** будут автоматически сохраняться в SQLite БД

## 📁 Файлы базы данных:

- **SQLite БД**: `backend/planai.db`
- **Документация**: `backend/DATABASE.md`
- **Тесты**: `backend/test-db.mjs`

---

**Статус**: ✅ Все работает! Регистрация и авторизация функционируют корректно.
