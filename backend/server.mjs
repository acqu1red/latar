import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSvgFromImage } from './src/generateSvgFromImage.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Проверяем наличие API ключа
console.log('🔍 Проверка API ключа:');
console.log('OPENAI_API_KEY установлен:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY значение:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'НЕТ');

if (!process.env.OPENAI_API_KEY || 
    process.env.OPENAI_API_KEY === 'your_openai_api_key_here' || 
    process.env.OPENAI_API_KEY === 'YOUR_API_KEY_HERE' ||
    process.env.OPENAI_API_KEY === 'sk-test-key') {
  console.warn('⚠️  ВНИМАНИЕ: OpenAI API ключ не настроен!');
  console.warn('📝 Создайте файл .env в папке backend/ и добавьте:');
  console.warn('   OPENAI_API_KEY=ваш_ключ_здесь');
  console.warn('🔗 Получите ключ на: https://platform.openai.com/api-keys');
  console.warn('🔄 Система будет работать в демо-режиме');
} else {
  console.log('✅ OpenAI API ключ настроен');
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

// Маршрут для генерации плана
app.post('/api/generate-plan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const imagePath = req.file.path;
    console.log('Обработка изображения:', imagePath);

    // Определяем baseUrl для публичных ссылок
    // Для продакшена используем GitHub Pages, для локальной разработки - localhost
    const baseUrl = process.env.BASE_URL || 'https://acqu1red.github.io/latar';
    console.log('Base URL для публичных ссылок:', baseUrl);

    // Генерируем SVG план
    const svgContent = await generateSvgFromImage(imagePath, baseUrl);
    
    // Удаляем временный файл
    fs.unlinkSync(imagePath);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgContent);

  } catch (error) {
    console.error('Ошибка генерации плана:', error);
    res.status(500).json({ error: 'Ошибка генерации плана: ' + error.message });
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
