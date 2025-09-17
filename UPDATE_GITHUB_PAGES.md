# Обновление GitHub Pages

## ✅ Frontend собран успешно!

Папка `dist/` создана со следующими файлами:
- `index.html` - главная страница
- `assets/index-BFG9Zo-T.js` - JavaScript бандл
- `assets/index-uRu-1cvt.css` - CSS стили

## 🚀 Как обновить GitHub Pages:

### Вариант 1: Через GitHub Web Interface

1. **Перейдите в ваш репозиторий** на GitHub
2. **Откройте папку** `frontend/dist/`
3. **Скопируйте все файлы** из `dist/` в корень репозитория
4. **Удалите старые файлы** (если есть)
5. **Зафиксируйте изменения**:
   ```bash
   git add .
   git commit -m "Update frontend build"
   git push
   ```

### Вариант 2: Через командную строку

```bash
# Перейдите в корень репозитория
cd /Users/offspring/Desktop/latar

# Скопируйте файлы из dist в корень
cp -r frontend/dist/* .

# Зафиксируйте изменения
git add .
git commit -m "Update frontend build"
git push
```

### Вариант 3: Автоматическое обновление

Создайте GitHub Action для автоматической сборки:

1. **Создайте папку** `.github/workflows/`
2. **Создайте файл** `deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build
      run: |
        cd frontend
        npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
```

## 🔍 Проверка обновления

После обновления:
1. **Подождите 1-2 минуты** (время обновления GitHub Pages)
2. **Откройте** https://acqu1red.github.io/latar/
3. **Проверьте**, что сайт обновился

## ⚠️ Важные моменты:

- **Всегда собирайте frontend** перед обновлением: `npm run build`
- **Копируйте файлы из `dist/`** в корень репозитория
- **Не копируйте папку `dist/`** - только её содержимое
- **Проверяйте**, что `index.html` находится в корне репозитория
