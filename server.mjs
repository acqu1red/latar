import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeImageForPhoto } from './src/imageAnalyzer.mjs';
import { generatePhotoFromSketch } from './src/scribbleDiffusionGenerator.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Проверяем наличие API ключа
console.log('🔍 Проверка API ключа:');
console.log('SCRIBBLE_DIFFUSION_API_KEY установлен:', !!process.env.SCRIBBLE_DIFFUSION_API_KEY);

if (!process.env.SCRIBBLE_DIFFUSION_API_KEY || 
    process.env.SCRIBBLE_DIFFUSION_API_KEY === 'YOUR_SCRIBBLE_DIFFUSION_API_KEY_HERE' || 
    process.env.SCRIBBLE_DIFFUSION_API_KEY === 'your_scribble_diffusion_api_key_here') {
  console.error('❌ ОШИБКА: Scribble Diffusion API ключ не настроен!');
  console.error('📝 Создайте файл .env в папке backend/ и добавьте:');
  console.error('   SCRIBBLE_DIFFUSION_API_KEY=ваш_ключ_здесь');
  console.error('🔗 Получите ключ на вашем API провайдере');
  console.error('⚠️  Приложение не будет работать без API ключа!');
  process.exit(1);
} else {
  console.log('✅ Scribble Diffusion API ключ настроен');
}

// Middleware
app.use(cors({
  origin: ['https://acqu1red.github.io'],
  credentials: true
}));
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
    if (!process.env.SCRIBBLE_DIFFUSION_API_KEY) {
      return res.status(500).json({ error: 'API ключ не настроен. Обратитесь к администратору.' });
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

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Health check доступен по адресу: http://localhost:${PORT}/healthz`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/generate-photo - генерация фотографии`);
  console.log(`   GET  /api/furniture - получение данных мебели`);
  console.log(`   GET  /healthz - проверка здоровья сервера`);
  console.log(`✅ Приложение готово к работе!`);
});
