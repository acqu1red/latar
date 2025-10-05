# Инструкции по деплою с исправлением поддомена new

## Проблема
Поддомен `new` не работал из-за ошибки 404. Проблема была в том, что сервер не знал, как обрабатывать маршрут `/new`.

## Решение

### 1. Обновлен сервер (backend/server.mjs)
Добавлены специальные маршруты для обработки `/new`:

```javascript
// Специальный маршрут для поддомена new
app.get('/new', (req, res) => {
  const newHtmlPath = path.join(__dirname, '..', 'frontend/dist/new.html');
  if (fs.existsSync(newHtmlPath)) {
    res.sendFile(newHtmlPath);
  } else {
    res.status(404).send('new.html not found');
  }
});

app.get('/new/*', (req, res) => {
  const newHtmlPath = path.join(__dirname, '..', 'frontend/dist/new.html');
  if (fs.existsSync(newHtmlPath)) {
    res.sendFile(newHtmlPath);
  } else {
    res.status(404).send('new.html not found');
  }
});
```

### 2. Создана отдельная сборка для поддомена new
- `vite.config.new.mjs` - конфигурация с `base: '/'`
- `main-new.tsx` - entry point с пустым `basename`
- `build-script.js` - автоматизированная сборка

### 3. Команды для деплоя

```bash
# 1. Собрать проект
cd frontend
npm run build:all

# 2. Проверить, что файлы созданы
ls -la dist/new.html
ls -la dist/assets/new-*

# 3. Запустить сервер
cd ..
npm start
```

### 4. Проверка работы

После деплоя проверьте:
- [ ] `https://yourdomain.com/new` - должен открывать NewPage.jsx
- [ ] `https://yourdomain.com/` - основная страница
- [ ] Нет ошибок 404 в консоли браузера
- [ ] Все ресурсы загружаются корректно

### 5. Структура файлов после сборки

```
frontend/dist/
├── index.html          # Основная версия
├── new.html           # Версия для поддомена new
├── assets/
│   ├── index-*.css    # CSS для основной версии
│   ├── index-*.js     # JS для основной версии
│   ├── new-*.css      # CSS для поддомена new
│   └── new-*.js       # JS для поддомена new
└── _redirects         # Правила редиректа
```

### 6. Логи для отладки

Если что-то не работает, проверьте логи сервера:
- Сервер должен показывать: `GET /new` с статусом 200
- Файл `new.html` должен существовать в `frontend/dist/`
- Все ресурсы должны быть доступны по прямым ссылкам

## Тестирование

Локально все работает:
- ✅ `http://localhost:3001/new` - возвращает 200
- ✅ `http://localhost:3001/assets/new-*.js` - возвращает 200
- ✅ `http://localhost:3001/assets/new-*.css` - возвращает 200

После деплоя на продакшен поддомен `new` должен работать корректно!
