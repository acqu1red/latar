import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePhotoFromSketch, createSketchFromImage } from './src/scribbleDiffusionGenerator.mjs';
import { generatePlanOnlyPrompt, generatePlanWithFurniturePrompt, enhancePromptForCentering } from './src/promptGenerator.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Локальная генерация без внешних API
console.log('🏠 Локальная генерация планов квартир');
console.log('✅ Все ИИ функции работают локально без внешних API');
console.log('💡 Никаких кредитов или токенов не требуется');

// Middleware
app.use(cors({
  origin: [
    'https://acqu1red.github.io/latar',
    'https://competitive-camellia-latar-a11ca532.koyeb.app'
  ],
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

// Маршрут для генерации фотографии без мебели
app.post('/api/generate-photo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const imagePath = req.file.path;
    console.log('Обработка изображения для генерации фотографии:', imagePath);

    // Создаем эскиз из изображения
    const sketchPath = await createSketchFromImage(imagePath);
    
    // Генерируем автоматический промпт для плана без мебели
    const basePrompt = generatePlanOnlyPrompt();
    const prompt = enhancePromptForCentering(basePrompt);
    
    // Генерируем фотографию из эскиза
    const photoBuffer = await generatePhotoFromSketch(sketchPath, prompt);
    
    // Удаляем временные файлы
    fs.unlinkSync(imagePath);
    if (fs.existsSync(sketchPath)) {
      fs.unlinkSync(sketchPath);
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(photoBuffer);

  } catch (error) {
    console.error('Ошибка генерации фотографии:', error);
    res.status(500).json({ error: 'Ошибка генерации фотографии: ' + error.message });
  }
});

// Маршрут для генерации плана с мебелью
app.post('/api/generate-with-furniture', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const imagePath = req.file.path;
    console.log('Обработка изображения для генерации плана с мебелью:', imagePath);

    // Создаем эскиз из изображения
    const sketchPath = await createSketchFromImage(imagePath);
    
    // Генерируем автоматический промпт для плана с мебелью
    const basePrompt = generatePlanWithFurniturePrompt();
    const prompt = enhancePromptForCentering(basePrompt);
    
    // Генерируем фотографию из эскиза
    const photoBuffer = await generatePhotoFromSketch(sketchPath, prompt);
    
    // Удаляем временные файлы
    fs.unlinkSync(imagePath);
    if (fs.existsSync(sketchPath)) {
      fs.unlinkSync(sketchPath);
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(photoBuffer);

  } catch (error) {
    console.error('Ошибка генерации плана с мебелью:', error);
    res.status(500).json({ error: 'Ошибка генерации плана с мебелью: ' + error.message });
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
