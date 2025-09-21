import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { analyzeImageForPhoto } from './src/imageAnalyzer.mjs';
import { generatePhotoFromSketch } from './src/scribbleDiffusionGenerator.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем папку uploads если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Создана папка uploads');
}

// Проверяем существование необходимых файлов
console.log('🔍 Проверка файлов:');
const requiredFiles = [
  'furniture.json',
  'src/imageAnalyzer.mjs',
  'src/scribbleDiffusionGenerator.mjs',
  'src/localImageGenerator.mjs'
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

// Проверяем файловую систему
console.log('🔍 Проверка файловой системы:');
console.log('Текущая директория:', process.cwd());
console.log('Содержимое директории:', fs.readdirSync(process.cwd()));
console.log('Существует ли server.mjs:', fs.existsSync('server.mjs'));
console.log('Существует ли package.json:', fs.existsSync('package.json'));
console.log('Существует ли папка uploads:', fs.existsSync('uploads'));

// Проверяем наличие API ключа
console.log('🔍 Проверка API ключа:');
console.log('SCRIBBLE_DIFFUSION_API_KEY (Replicate) установлен:', !!process.env.SCRIBBLE_DIFFUSION_API_KEY);
console.log('SCRIBBLE_DIFFUSION_API_KEY значение:', process.env.SCRIBBLE_DIFFUSION_API_KEY ? '***скрыто***' : 'не установлено');
console.log('Все переменные окружения:', Object.keys(process.env).filter(key => key.includes('SCRIBBLE') || key.includes('NODE') || key.includes('PORT')));

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

const isApiKeyValid = process.env.SCRIBBLE_DIFFUSION_API_KEY && 
    process.env.SCRIBBLE_DIFFUSION_API_KEY !== 'YOUR_SCRIBBLE_DIFFUSION_API_KEY_HERE' && 
    process.env.SCRIBBLE_DIFFUSION_API_KEY !== 'your_scribble_diffusion_api_key_here';

if (!isApiKeyValid) {
  console.warn('⚠️  ВНИМАНИЕ: Replicate API ключ не настроен!');
  console.warn('📝 Для работы генерации фотографий добавьте переменную окружения:');
  console.warn('   SCRIBBLE_DIFFUSION_API_KEY=ваш_replicate_ключ_здесь');
  console.warn('🔗 Получите ключ на https://replicate.com');
  console.warn('⚠️  Приложение запустится, но генерация фотографий будет недоступна!');
} else {
  console.log('✅ Replicate API ключ настроен');
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
app.use(express.static('public'));

// Статический маршрут для временных изображений
app.use('/temp-images', express.static(path.join(__dirname, 'uploads')));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
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


// Маршрут для генерации фотографии
app.post('/api/generate-photo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    // Scribble Diffusion API ключ обязателен
    if (!isApiKeyValid) {
      return res.status(503).json({ 
        error: 'Сервис генерации фотографий временно недоступен. API ключ не настроен.',
        code: 'API_KEY_MISSING'
      });
    }

    const imagePath = req.file.path;
    
    console.log('Обработка изображения для генерации фотографии:', imagePath);

    // Анализируем изображение и создаем эскиз
    const analysisData = await analyzeImageForPhoto(imagePath);
    
    // Используем автоматически сгенерированный промпт для точного воспроизведения плана
    const prompt = analysisData.prompt;
    
    // Генерируем фотографию из эскиза
    const photoBuffer = await generatePhotoFromSketch(analysisData.sketchPath, prompt);
    
    // Удаляем временные файлы
    fs.unlinkSync(imagePath);
    if (fs.existsSync(analysisData.sketchPath)) {
      fs.unlinkSync(analysisData.sketchPath);
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(photoBuffer);

  } catch (error) {
    console.error('Ошибка генерации фотографии:', error);
    res.status(500).json({ error: 'Ошибка генерации фотографии: ' + error.message });
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
  console.log(`   POST /api/generate-photo - генерация фотографии`);
  console.log(`   GET  /api/furniture - получение данных мебели`);
  console.log(`   GET  /healthz - проверка здоровья сервера`);
  console.log(`✅ Приложение готово к работе!`);
  console.log(`🔧 Переменные окружения:`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлено'}`);
  console.log(`   PORT: ${PORT}`);
  console.log(`   API ключ настроен: ${isApiKeyValid ? 'Да' : 'Нет'}`);
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
