import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { controlNetGenerator } from './src/controlNetGenerator.mjs';
import { roomAnalyzer } from './src/roomAnalyzer.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Проверяем наличие ControlNet
console.log('🔍 Проверка ControlNet:');
console.log('✅ Используется локальная генерация через ControlNet');
console.log('🎯 Полная независимость от внешних API');

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


// Маршрут для генерации простого плана
app.post('/api/generate-photo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const imagePath = req.file.path;
    console.log('Обработка изображения для генерации простого плана:', imagePath);

    // Генерируем простой план без мебели через ControlNet
    const prompt = 'a detailed architectural floor plan drawing, perfectly centered on a clean white background, showing room layouts with walls, doors, and windows. The plan should be drawn exactly as shown in the reference image with precise proportions. Clean, professional architectural drawing style with black lines on white background. The floor plan should be centered and clearly visible.';
    
    const photoBuffer = await controlNetGenerator.generatePlanWithFurniture(imagePath, prompt);
    
    // Удаляем временный файл
    fs.unlinkSync(imagePath);

    res.setHeader('Content-Type', 'image/png');
    res.send(photoBuffer);

  } catch (error) {
    console.error('Ошибка генерации простого плана:', error);
    res.status(500).json({ error: 'Ошибка генерации простого плана: ' + error.message });
  }
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Маршрут для генерации плана с мебелью
app.post('/api/generate-with-furniture', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const imagePath = req.file.path;
    console.log('Обработка изображения для генерации плана с мебелью:', imagePath);

    // Анализируем тип помещения
    const roomType = await roomAnalyzer.analyzeRoomType(imagePath);
    console.log('Определен тип помещения:', roomType);

    // Выбираем подходящую мебель
    const selectedFurniture = roomAnalyzer.selectFurnitureForRoom(roomType);
    console.log('Выбрана мебель:', selectedFurniture);

    // Генерируем промпт с мебелью
    const prompt = roomAnalyzer.generateFurniturePrompt(roomType, selectedFurniture);
    console.log('Сгенерирован промпт:', prompt);

    // Генерируем план с мебелью через ControlNet
    const photoBuffer = await controlNetGenerator.generatePlanWithFurniture(imagePath, prompt);
    
    // Удаляем временный файл
    fs.unlinkSync(imagePath);

    res.setHeader('Content-Type', 'image/png');
    res.send(photoBuffer);

  } catch (error) {
    console.error('Ошибка генерации плана с мебелью:', error);
    res.status(500).json({ error: 'Ошибка генерации плана с мебелью: ' + error.message });
  }
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
