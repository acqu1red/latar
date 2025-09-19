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

// Проверяем наличие API ключей
console.log('🔍 Проверка API ключей:');
console.log('OPENAI_API_KEY установлен:', !!process.env.OPENAI_API_KEY);
console.log('REPLICATE_API_TOKEN установлен:', !!process.env.REPLICATE_API_TOKEN);
console.log('SCRIBBLE_DIFFUSION_API_URL установлен:', !!process.env.SCRIBBLE_DIFFUSION_API_URL);

if (!process.env.REPLICATE_API_TOKEN || 
    process.env.REPLICATE_API_TOKEN === 'your_replicate_token_here' || 
    process.env.REPLICATE_API_TOKEN === 'YOUR_TOKEN_HERE') {
  console.warn('⚠️  ВНИМАНИЕ: Replicate API токен не настроен!');
  console.warn('📝 Создайте файл .env в папке backend/ и добавьте:');
  console.warn('   REPLICATE_API_TOKEN=ваш_токен_здесь');
  console.warn('🔗 Получите токен на: https://replicate.com/account/api-tokens');
  console.warn('🔄 Будет использоваться локальная генерация');
} else {
  console.log('✅ Replicate API токен настроен');
}

if (!process.env.SCRIBBLE_DIFFUSION_API_URL || 
    process.env.SCRIBBLE_DIFFUSION_API_URL === 'your_api_url_here' || 
    process.env.SCRIBBLE_DIFFUSION_API_URL === 'YOUR_API_URL_HERE') {
  console.warn('⚠️  ВНИМАНИЕ: ScribbleDiffusion API URL не настроен!');
  console.warn('📝 Добавьте в переменные окружения:');
  console.warn('   SCRIBBLE_DIFFUSION_API_URL=ваш_api_url_здесь');
  console.warn('   SCRIBBLE_DIFFUSION_API_KEY=ваш_api_key_здесь (опционально)');
  console.warn('🔄 Будет использоваться локальная генерация');
} else {
  console.log('✅ ScribbleDiffusion API URL настроен');
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

    // Replicate API токен не обязателен - есть локальная генерация
    if (!process.env.REPLICATE_API_TOKEN) {
      console.log('⚠️ Replicate API токен не настроен, используем локальную генерацию');
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
  console.log(`Сервер запущен на порту ${PORT}`);
});
