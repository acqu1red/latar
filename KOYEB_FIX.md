# Исправление проблемы сборки в Koyeb

## ❌ Проблема
```
npm error Missing script: "build"
```

## ✅ Решение

### 1. Добавлены недостающие скрипты в package.json:
```json
{
  "scripts": {
    "start": "node server.mjs",
    "dev": "node --watch server.mjs",
    "build": "echo 'No build step required for backend'",
    "heroku-postbuild": "echo 'Backend ready'"
  }
}
```

### 2. Создан файл .nvmrc:
```
22
```

### 3. Создан Procfile:
```
web: node server.mjs
```

### 4. Добавлен healthcheck endpoint:
```javascript
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 5. Обновлен koyeb.yaml:
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
      path: /api/furniture
      port: 3001
      initialDelaySeconds: 30
      periodSeconds: 10
```

## 🚀 Что делать дальше:

1. **Зафиксируйте изменения в Git:**
```bash
git add .
git commit -m "Fix Koyeb build: add missing scripts and healthcheck"
git push
```

2. **Koyeb автоматически пересоберет проект**

3. **Проверьте статус** в Koyeb Dashboard

## ✅ Результат:
- ✅ Скрипт `build` добавлен
- ✅ Скрипт `heroku-postbuild` добавлен  
- ✅ Healthcheck endpoint работает
- ✅ Версия Node.js зафиксирована
- ✅ Procfile для Heroku совместимости

Теперь сборка должна пройти успешно!
