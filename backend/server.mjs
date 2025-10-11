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
import { generateImageUrl, uploadToExternalService, deleteFromExternalService } from './src/imageUrlService.mjs';

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

// Поддержка альтернативного имени ключа (COMET_API_KEY -> COMETAPI_API_KEY)
if (!process.env.COMETAPI_API_KEY && process.env.COMET_API_KEY) {
  process.env.COMETAPI_API_KEY = process.env.COMET_API_KEY;
}

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Доверяем заголовкам прокси (важно для Timeweb/NGINX)
app.set('trust proxy', 1);

// CORS: разрешаем запросы c известных источников (и опционально любые, если явно задано)
const defaultCorsOrigins = [
  'https://acqu1red.github.io',
  'https://acqu1red-latar-4004.twc1.net',
  'https://acqu1red-latar-c0f7.twc1.net',
  'http://localhost:3000',
  'http://localhost:5173'
];
const envCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowAllCors = process.env.CORS_ALLOW_ALL === 'true';
const allowedOrigins = envCorsOrigins.length > 0 ? envCorsOrigins : defaultCorsOrigins;

const corsOptions = {
  origin: allowAllCors ? true : (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin);
    return callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Фоллбек на случай, если какой-то middleware ответил без CORS-заголовков
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (allowAllCors || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Логирование запросов (тише в production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'не указан'}`);
  }
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

// SPA маршрут переносим ниже, после определения всех API-роутов

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
    const hasUnlimitedAccess = isDirector || isOrganization;

    console.log(`🔍 Проверка лимитов:`, {
      userId: authUser?.id,
      username: authUser?.username,
      role: authUser?.role,
      accessPrefix: authUser?.access_prefix,
      isDirector,
      isOrganization,
      hasUnlimitedAccess
    });

    if (authUser) {
      // Авторизованный пользователь
      if (!hasUnlimitedAccess) {
        // Обычный пользователь - проверяем лимиты
        if (authUser.plans_used >= MAX_USER_PLANS) {
          return res.status(403).json({ error: 'Лимит генераций исчерпан', code: 'PLAN_LIMIT' });
        }
        userDB.incrementPlanUsage(authUser.id);
        authUser.plans_used += 1;
        console.log(`📊 Пользователь ${authUser.username} использовал генерацию (${authUser.plans_used}/${MAX_USER_PLANS})`);
      } else {
        console.log(`♾️ Пользователь ${authUser.username} имеет безлимитный доступ`);
      }
    } else {
      // Гость - проверяем лимиты по IP
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.ip;
      const usage = guestUsage.get(clientIp) || { plans: 0 };
      if (usage.plans >= MAX_GUEST_PLANS) {
        return res.status(403).json({ error: 'Лимит генераций для гостей исчерпан', code: 'GUEST_LIMIT' });
      }
      usage.plans += 1;
      guestUsage.set(clientIp, usage);
      console.log(`👤 Гость с IP ${clientIp} использовал генерацию (${usage.plans}/${MAX_GUEST_PLANS})`);
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
        message: `Технический план успешно создан в режиме "${mode === 'withFurniture' ? 'С мебелью' : 'Без мебели'}"`
      });
    } else {
      res.status(200).json({
        success: true,
        results,
        message: `Создано ${results.length} технических планов в режиме "${mode === 'withFurniture' ? 'С мебелью' : 'Без мебели'}"`
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

    if (!isCometApiKeyValid) {
      return res.status(503).json({ 
        error: 'Сервис временно недоступен. API ключ не настроен.',
        code: 'API_KEY_MISSING'
      });
    }

    // Проверяем лимиты для удаления объектов
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
    const hasUnlimitedAccess = isDirector || isOrganization;

    console.log(`🔍 Проверка лимитов (удаление объектов):`, {
      userId: authUser?.id,
      username: authUser?.username,
      role: authUser?.role,
      accessPrefix: authUser?.access_prefix,
      isDirector,
      isOrganization,
      hasUnlimitedAccess
    });

    if (authUser) {
      // Авторизованный пользователь
      if (!hasUnlimitedAccess) {
        // Обычный пользователь - проверяем лимиты
        if (authUser.plans_used >= MAX_USER_PLANS) {
          return res.status(403).json({ error: 'Лимит генераций исчерпан', code: 'PLAN_LIMIT' });
        }
        userDB.incrementPlanUsage(authUser.id);
        authUser.plans_used += 1;
        console.log(`📊 Пользователь ${authUser.username} использовал удаление объектов (${authUser.plans_used}/${MAX_USER_PLANS})`);
      } else {
        console.log(`♾️ Пользователь ${authUser.username} имеет безлимитный доступ для удаления объектов`);
      }
    } else {
      // Гость - проверяем лимиты по IP
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.ip;
      const usage = guestUsage.get(clientIp) || { plans: 0 };
      if (usage.plans >= MAX_GUEST_PLANS) {
        return res.status(403).json({ error: 'Лимит генераций для гостей исчерпан', code: 'GUEST_LIMIT' });
      }
      usage.plans += 1;
      guestUsage.set(clientIp, usage);
      console.log(`👤 Гость с IP ${clientIp} использовал удаление объектов (${usage.plans}/${MAX_GUEST_PLANS})`);
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
        message: 'Объекты успешно удалены с изображения'
      });
    } else {
      res.status(200).json({
        success: true,
        results,
        message: `Объекты удалены с ${results.length} изображений`
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

// Маршруты для работы с URL изображений
app.get('/api/images', async (req, res) => {
  try {
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
        return res.status(401).json({ error: 'Неверный токен' });
      }
    }

    const { type, limit = 50, offset = 0 } = req.query;
    
    let images;
    if (authUser) {
      if (type) {
        images = imageUrlsDB.getByUserAndType(authUser.id, type);
      } else {
        images = imageUrlsDB.getByUser(authUser.id);
      }
    } else {
      return res.status(401).json({ error: 'Необходима авторизация для просмотра изображений' });
    }

    // Применяем пагинацию
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedImages = images.slice(startIndex, endIndex);

    res.json({
      success: true,
      images: paginatedImages,
      total: images.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Ошибка получения изображений:', error);
    res.status(500).json({ error: 'Ошибка получения изображений' });
  }
});

// Маршрут для удаления изображения
app.delete('/api/images/:id', async (req, res) => {
  try {
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
        return res.status(401).json({ error: 'Неверный токен' });
      }
    } else {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const imageId = req.params.id;
    const image = imageUrlsDB.getById(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }

    // Проверяем права доступа
    if (image.user_id !== authUser.id && authUser.role !== 'director') {
      return res.status(403).json({ error: 'Нет прав для удаления этого изображения' });
    }

    // Удаляем с внешнего сервиса
    try {
      const metadata = JSON.parse(image.metadata || '{}');
      const uploadResult = metadata.uploadResult;
      if (uploadResult && uploadResult.service && uploadResult.deleteData) {
        await deleteFromExternalService(image.image_url, uploadResult.service, {
          [uploadResult.service === 'imgur' ? 'deleteHash' : 
           uploadResult.service === 'cloudinary' ? 'publicId' : 
           'localPath']: uploadResult.deleteData
        });
      }
    } catch (deleteError) {
      console.error('Ошибка удаления с внешнего сервиса:', deleteError);
      // Продолжаем удаление из БД даже если не удалось удалить с внешнего сервиса
    }

    // Удаляем из базы данных
    imageUrlsDB.delete(imageId);

    res.json({
      success: true,
      message: 'Изображение успешно удалено'
    });
  } catch (error) {
    console.error('Ошибка удаления изображения:', error);
    res.status(500).json({ error: 'Ошибка удаления изображения' });
  }
});

// Маршрут для получения статистики изображений
app.get('/api/images/stats', async (req, res) => {
  try {
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
        return res.status(401).json({ error: 'Неверный токен' });
      }
    } else {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const stats = imageUrlsDB.getStats(authUser.id);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
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

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Сервер запущен на ${HOST}:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 Health check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/healthz`);
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
    console.log(`🔧 Переменные окружения:`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'не установлено'}`);
    console.log(`   PORT: ${PORT}`);
    console.log(`   HOST: ${HOST}`);
    console.log(`   COMETAPI ключ настроен: ${isCometApiKeyValid ? 'Да' : 'Нет'}`);
  }
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

// В САМОМ КОНЦЕ: SPA маршрут - все остальные запросы направляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend/dist/index.html'));
});
