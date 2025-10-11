import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { generateTechnicalPlan, checkCometApiHealth, generateCleanupImage } from './src/cometApiGenerator.mjs';
import authRoutes from './src/authRoutes.mjs';
import { userDB, imageUrlsDB } from './src/database.mjs';
import { generateImageUrl, uploadToExternalService } from './src/imageUrlService.mjs';

// Загружаем переменные окружения из .env файла
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

// Логируем переменные окружения для отладки
console.log('🔧 Переменные окружения:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${PORT}`);
console.log(`   COMET_API_KEY: ${process.env.COMET_API_KEY ? 'установлен' : 'не установлен'}`);

// Настройка multer для обработки файлов
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит на файл
    files: 5 // максимум 5 файлов
  }
});

const guestUsage = new Map();
const MAX_GUEST_PLANS = 1;
const MAX_USER_PLANS = 1;

// Проверяем файловую систему
console.log('🔍 Проверка файловой системы:');
console.log('Текущая директория:', process.cwd());
console.log('Содержимое директории:', fs.readdirSync(process.cwd()));
console.log('Существует ли server.mjs:', fs.existsSync('server.mjs'));
console.log('Существует ли package.json:', fs.existsSync('package.json'));

// Проверяем наличие API ключа
console.log('🔍 Проверка API ключа:');
console.log('COMET_API_KEY установлен:', !!process.env.COMET_API_KEY);
console.log('COMET_API_KEY значение:', process.env.COMET_API_KEY ? '***скрыто***' : 'не установлено');
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

const isCometApiKeyValid = process.env.COMET_API_KEY && 
    process.env.COMET_API_KEY !== 'YOUR_COMET_API_KEY_HERE' && 
    process.env.COMET_API_KEY !== 'your_comet_api_key_here';

if (!isCometApiKeyValid) {
  console.warn('⚠️  ВНИМАНИЕ: COMETAPI ключ не настроен!');
  console.warn('📝 Для работы генерации технических планов добавьте переменную окружения:');
  console.warn('   COMET_API_KEY=ваш_comet_api_ключ_здесь');
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


// Auth routes
app.use('/api/auth', authRoutes);

// Маршрут для временных изображений (заглушка)
app.get('/temp-images/:filename', (req, res) => {
  // В реальном проекте здесь можно отдавать реальные изображения
  // Пока что возвращаем заглушку
  res.status(404).json({ 
    error: 'Изображение не найдено',
    message: 'Временные изображения не сохраняются локально. Используйте внешние сервисы для production.'
  });
});

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



// Маршрут для генерации технического плана
app.post('/api/generate-technical-plan', upload.array('image', 5), async (req, res) => {
  try {
    console.log('📥 Получен запрос на генерацию технического плана');
    console.log('📋 Тело запроса:', {
      hasFiles: !!req.files,
      filesLength: req.files?.length,
      mode: req.body.mode,
      bodyKeys: Object.keys(req.body)
    });
    
    const files = req.files;
    const { mode } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.log('❌ Ошибка: изображения не загружены');
      return res.status(400).json({ error: 'Изображения не загружены' });
    }

    // Ограничиваем количество изображений для предотвращения перегрузки
    if (files.length > 5) {
      return res.status(400).json({ 
        error: 'Слишком много изображений. Максимум 5 изображений за раз.' 
      });
    }
    
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

    console.log(`Обработка ${files.length} изображений для генерации технического плана (режим: ${mode})`);

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📸 Обработка изображения ${i + 1}/${files.length}: ${file.originalname}`);
      
      // Создаем временный файл из загруженного файла
      const tempFilePath = path.join(__dirname, `temp_${Date.now()}_${i}.jpg`);
      try {
        // Записываем файл во временный файл
        fs.writeFileSync(tempFilePath, file.buffer);
        
        // Генерируем технический план
        const generatedBuffer = await generateTechnicalPlan(tempFilePath, mode);
        
        // Генерируем URL для результата
        const urlData = generateImageUrl('generated_plan', `plan_${i}.jpg`, {
          mode,
          originalSize: buffer.length,
          processedAt: new Date().toISOString()
        });
        
        // Загружаем изображение на внешний сервис
        const uploadResult = await uploadToExternalService(generatedBuffer, urlData.filename);
        
        // Сохраняем URL в базу данных
        const dbResult = imageUrlsDB.save(
          authUser?.id || null,
          'generated_plan',
          `plan_${i}.jpg`,
          uploadResult.imageUrl,
          uploadResult.thumbnailUrl,
          {
            ...urlData.metadata,
            uploadResult: {
              service: uploadResult.service || 'temporary',
              deleteData: uploadResult.deleteHash || uploadResult.publicId || uploadResult.localPath
            }
          }
        );
        
        results.push({
          id: dbResult.lastInsertRowid,
          imageUrl: uploadResult.imageUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          originalFilename: `plan_${i}.jpg`,
          mode,
          createdAt: new Date().toISOString()
        });
        
        // Добавляем задержку между запросами для снижения нагрузки на COMETAPI
        if (i < images.length - 1) {
          const delay = 2000 + Math.random() * 1000; // 2-3 секунды
          console.log(`⏳ Задержка ${Math.round(delay)}мс перед следующим изображением...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        // Удаляем временный файл
        try { 
          fs.unlinkSync(tempFilePath); 
        } catch (unlinkError) {
          console.warn('Не удалось удалить временный файл:', tempFilePath);
        }
      }
    }

    // Возвращаем результаты с URL
    if (results.length === 1) {
      res.status(200).json({
        success: true,
        result: results[0],
        message: 'Технический план успешно создан'
      });
    } else {
      res.status(200).json({
        success: true,
        results: results,
        message: `Создано ${results.length} технических планов`
      });
    }

  } catch (error) {
    console.error('Ошибка генерации технического плана:', error);
    res.status(500).json({ error: 'Ошибка генерации технического плана: ' + error.message });
  }
});

// Маршрут для удаления объектов (очистка комнаты)
app.post('/api/remove-objects', upload.array('image', 5), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Изображения не загружены' });
    }

    // Ограничиваем количество изображений для предотвращения перегрузки
    if (files.length > 5) {
      return res.status(400).json({ 
        error: 'Слишком много изображений. Максимум 5 изображений за раз.' 
      });
    }

    // COMETAPI ключ обязателен
    if (!isCometApiKeyValid) {
      return res.status(503).json({ 
        error: 'Сервис удаления объектов временно недоступен. API ключ не настроен.',
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
        console.error('Ошибка проверки токена при удалении объектов:', err);
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
    } else if (!authUser) {
      // Гостевой доступ
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.ip;
      const usage = guestUsage.get(clientIp) || { plans: 0 };
      if (usage.plans >= MAX_GUEST_PLANS) {
        return res.status(403).json({ error: 'Лимит генераций для гостей исчерпан', code: 'GUEST_LIMIT' });
      }
      usage.plans += 1;
      guestUsage.set(clientIp, usage);
    }

    console.log(`Обработка ${files.length} изображений для удаления объектов`);

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`🧹 Обработка изображения ${i + 1}/${files.length}: ${file.originalname}`);
      
      // Создаем временный файл из загруженного файла
      const tempFilePath = path.join(__dirname, `temp_cleanup_${Date.now()}_${i}.jpg`);
      try {
        // Записываем файл во временный файл
        fs.writeFileSync(tempFilePath, file.buffer);
        
        // Генерируем очищенное изображение
        const generatedBuffer = await generateCleanupImage({ imagePaths: [tempFilePath] });
        
        // Генерируем URL для результата
        const urlData = generateImageUrl('generated_cleanup', `cleanup_${i}.jpg`, {
          originalSize: file.buffer.length,
          processedAt: new Date().toISOString()
        });
        
        // Загружаем изображение на внешний сервис
        const uploadResult = await uploadToExternalService(generatedBuffer[0], urlData.filename);
        
        // Сохраняем URL в базу данных
        const dbResult = imageUrlsDB.save(
          authUser?.id || null,
          'generated_cleanup',
          `cleanup_${i}.jpg`,
          uploadResult.imageUrl,
          uploadResult.thumbnailUrl,
          {
            ...urlData.metadata,
            uploadResult: {
              service: uploadResult.service || 'temporary',
              deleteData: uploadResult.deleteHash || uploadResult.publicId || uploadResult.localPath
            }
          }
        );
        
        results.push({
          id: dbResult.lastInsertRowid,
          imageUrl: uploadResult.imageUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          originalFilename: `cleanup_${i}.jpg`,
          createdAt: new Date().toISOString()
        });
        
        // Добавляем задержку между запросами для снижения нагрузки на COMETAPI
        if (i < images.length - 1) {
          const delay = 2000 + Math.random() * 1000; // 2-3 секунды
          console.log(`⏳ Задержка ${Math.round(delay)}мс перед следующим изображением...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        // Удаляем временный файл
        try { 
          fs.unlinkSync(tempFilePath); 
        } catch (unlinkError) {
          console.warn('Не удалось удалить временный файл:', tempFilePath);
        }
      }
    }

    // Возвращаем результаты с URL
    if (results.length === 1) {
      res.status(200).json({
        success: true,
        result: results[0],
        message: 'Объекты успешно удалены'
      });
    } else {
      res.status(200).json({
        success: true,
        results: results,
        message: `Обработано ${results.length} изображений`
      });
    }

  } catch (error) {
    console.error('Ошибка удаления объектов:', error);
    res.status(500).json({ error: 'Ошибка удаления объектов: ' + error.message });
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

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('Ошибка сервера:', error);
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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Health check доступен по адресу: http://0.0.0.0:${PORT}/healthz`);
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
  console.log(`✅ Сервер готов к работе!`);
});

// Добавляем обработчик для graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, завершаем работу...');
  server.close(() => {
    console.log('✅ Сервер закрыт');
    process.exit(0);
  });
});
