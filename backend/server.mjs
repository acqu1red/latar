import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import { generateTechnicalPlan, checkCometApiHealth } from './src/cometApiGenerator.mjs';
import authRoutes from './src/authRoutes.mjs';
import { userDB } from './src/database.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем папку uploads если её нет (в корне проекта)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Создана папка uploads');
}

// Проверяем существование необходимых файлов
console.log('🔍 Проверка файлов:');
const requiredFiles = [
  'furniture.json',
  'src/cometApiGenerator.mjs'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
  if (!exists) {
    console.error(`❌ Критический файл отсутствует: ${file}`);
  }
});

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const guestUsage = new Map();
const MAX_GUEST_PLANS = 1;
const MAX_USER_PLANS = 1;

// Проверяем файловую систему
console.log('🔍 Проверка файловой системы:');
console.log('Текущая директория:', process.cwd());
console.log('Содержимое директории:', fs.readdirSync(process.cwd()));
console.log('Существует ли server.mjs:', fs.existsSync('server.mjs'));
console.log('Существует ли package.json:', fs.existsSync('package.json'));
console.log('Существует ли папка uploads:', fs.existsSync('uploads'));

// Проверяем наличие API ключа
console.log('🔍 Проверка API ключа:');
console.log('COMETAPI_API_KEY установлен:', !!process.env.COMETAPI_API_KEY);
console.log('COMETAPI_API_KEY значение:', process.env.COMETAPI_API_KEY ? '***скрыто***' : 'не установлено');
console.log('Все переменные окружения:', Object.keys(process.env).filter(key => key.includes('COMET') || key.includes('NODE') || key.includes('PORT')));

// Проверяем системные зависимости
console.log('🔍 Проверка системных зависимостей:');
try {
  const sharp = await import('sharp');
  console.log('✅ Sharp загружен успешно');
  console.log('Sharp версия:', sharp.default.versions);
} catch (error) {
  console.error('❌ Ошибка загрузки Sharp:', error.message);
  console.error('Это может быть связано с отсутствием системных библиотек');
}

const isCometApiKeyValid = process.env.COMETAPI_API_KEY && 
    process.env.COMETAPI_API_KEY !== 'YOUR_COMETAPI_API_KEY_HERE' && 
    process.env.COMETAPI_API_KEY !== 'your_cometapi_key_here';

if (!isCometApiKeyValid) {
  console.warn('⚠️  ВНИМАНИЕ: COMETAPI ключ не настроен!');
  console.warn('📝 Для работы генерации технических планов добавьте переменную окружения:');
  console.warn('   COMETAPI_API_KEY=ваш_cometapi_ключ_здесь');
  console.warn('🔗 Получите ключ на https://cometapi.com');
  console.warn('⚠️  Приложение запустится, но генерация технических планов будет недоступна!');
} else {
  console.log('✅ COMETAPI ключ настроен');
}

// Middleware
app.use(cors({
  origin: [
    'https://acqu1red.github.io',
    'https://acqu1red.github.io/latar',
    'https://acqu1red-latar-4004.twc1.net',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Логирование CORS запросов
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'не указан'}`);
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend/dist')));

// Статический маршрут для временных изображений
app.use('/temp-images', express.static(path.join(__dirname, '..', 'uploads')));

// Auth routes
app.use('/api/auth', authRoutes);

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

// SPA маршрут - все остальные запросы направляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend/dist/index.html'));
});

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});


// Маршрут для генерации технического плана
app.post('/api/generate-technical-plan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const { mode } = req.body; // 'withFurniture' или 'withoutFurniture'
    
    if (!mode || !['withFurniture', 'withoutFurniture'].includes(mode)) {
      return res.status(400).json({ 
        error: 'Неверный режим. Допустимые значения: withFurniture, withoutFurniture' 
      });
    }

    // COMETAPI ключ обязателен
    if (!isCometApiKeyValid) {
      return res.status(503).json({ 
        error: 'Сервис генерации технических планов временно недоступен. API ключ не настроен.',
        code: 'API_KEY_MISSING'
      });
    }

    const authHeader = req.headers['authorization'];
    let authUser = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        authUser = userDB.findById(decoded.id);
        if (!authUser) {
          return res.status(401).json({ error: 'Пользователь не найден' });
        }
      } catch (err) {
        console.error('Ошибка проверки токена при генерации плана:', err);
        return res.status(401).json({ error: 'Неверный токен' });
      }
    }

    const isDirector = authUser?.role === 'director';
    const isOrganization = authUser?.access_prefix === 'Организация';

    if (authUser && !isDirector && !isOrganization) {
      if (authUser.plans_used >= MAX_USER_PLANS) {
        return res.status(403).json({ error: 'Лимит генераций исчерпан', code: 'PLAN_LIMIT' });
      }
      userDB.incrementPlanUsage(authUser.id);
      authUser.plans_used += 1;
    }

    if (!authUser) {
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.ip;
      const usage = guestUsage.get(clientIp) || { plans: 0 };
      if (usage.plans >= MAX_GUEST_PLANS) {
        return res.status(403).json({ error: 'Лимит генераций для гостей исчерпан', code: 'GUEST_LIMIT' });
      }
      usage.plans += 1;
      guestUsage.set(clientIp, usage);
    }

    const imagePath = req.file.path;
    
    console.log(`Обработка изображения для генерации технического плана (режим: ${mode}):`, imagePath);

    // Генерируем технический план
    const planBuffer = await generateTechnicalPlan(imagePath, mode);
    
    // Удаляем временный файл
    fs.unlinkSync(imagePath);

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(planBuffer);

  } catch (error) {
    console.error('Ошибка генерации технического плана:', error);
    res.status(500).json({ error: 'Ошибка генерации технического плана: ' + error.message });
  }
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Маршрут для получения мебели
app.get('/api/furniture', (req, res) => {
  try {
    const furnitureData = JSON.parse(fs.readFileSync(path.join(__dirname, 'furniture.json'), 'utf8'));
    res.json(furnitureData);
  } catch (error) {
    console.error('Ошибка загрузки мебели:', error);
    res.status(500).json({ error: 'Ошибка загрузки данных мебели' });
  }
});

// Обработка ошибок multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер: 10MB' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанное исключение:', error);
  console.error('📊 Детали ошибки:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  process.exit(1);
});

// Обработка необработанных промисов
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason);
  console.error('📊 Промис:', promise);
  process.exit(1);
});

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, завершаем работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, завершаем работу...');
  process.exit(0);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Health check доступен по адресу: http://localhost:${PORT}/healthz`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/generate-technical-plan - генерация технического плана`);
  console.log(`   GET  /api/furniture - получение данных мебели`);
  console.log(`   POST /api/auth/register - регистрация пользователя`);
  console.log(`   POST /api/auth/login - вход пользователя`);
  console.log(`   GET  /api/auth/settings - получение настроек пользователя`);
  console.log(`   POST /api/auth/settings - сохранение настроек пользователя`);
  console.log(`   GET  /api/auth/agency - получение данных агентства`);
  console.log(`   POST /api/auth/agency - сохранение данных агентства`);
  console.log(`   GET  /healthz - проверка здоровья сервера`);
  console.log(`✅ Приложение готово к работе!`);
  console.log(`🔧 Переменные окружения:`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлено'}`);
  console.log(`   PORT: ${PORT}`);
  console.log(`   COMETAPI ключ настроен: ${isCometApiKeyValid ? 'Да' : 'Нет'}`);
  console.log(`🔍 Проверка модулей:`);
  console.log(`   sharp: ${typeof sharp !== 'undefined' ? '✅ Загружен' : '❌ Не загружен'}`);
  console.log(`   express: ${typeof express !== 'undefined' ? '✅ Загружен' : '❌ Не загружен'}`);
  console.log(`   multer: ${typeof multer !== 'undefined' ? '✅ Загружен' : '❌ Не загружен'}`);
  console.log(`🎯 Сервер успешно запущен и слушает порт ${PORT}`);
});

// Обработка ошибок сервера
server.on('error', (error) => {
  console.error('❌ Ошибка сервера:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${PORT} уже используется`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Нет прав для использования порта ${PORT}`);
  }
  process.exit(1);
});

// Проверяем, что сервер действительно слушает
server.on('listening', () => {
  const address = server.address();
  console.log(`🎯 Сервер слушает на ${address.address}:${address.port}`);
});
