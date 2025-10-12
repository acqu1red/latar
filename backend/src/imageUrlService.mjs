import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

/**
 * Сервис для работы с URL изображений
 * Вместо сохранения файлов на диск, генерирует URL для внешних сервисов
 */

// Конфигурация внешних сервисов
const EXTERNAL_SERVICES = {
  // Пример конфигурации для различных сервисов
  imgur: {
    enabled: false,
    uploadUrl: 'https://api.imgur.com/3/image',
    apiKey: process.env.IMGUR_API_KEY,
    baseUrl: 'https://i.imgur.com/'
  },
  
  cloudinary: {
    enabled: false,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    baseUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`
  },
  
  // Встроенный сервис для временных URL
  temporary: {
    enabled: true,
    baseUrl: process.env.TEMPORARY_IMAGE_BASE_URL || 'https://acqu1red-latar-084a.twc1.net/temp-images/',
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
};

/**
 * Генерирует уникальный URL для изображения
 * @param {string} imageType - Тип изображения (user_upload, generated_plan, generated_cleanup)
 * @param {string} originalFilename - Оригинальное имя файла
 * @param {Object} metadata - Дополнительные метаданные
 * @returns {Object} Объект с URL и метаданными
 */
export function generateImageUrl(imageType, originalFilename, metadata = {}) {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalFilename) || '.jpg';
  
  // Генерируем уникальное имя файла
  const filename = `${imageType}_${timestamp}_${randomId}${extension}`;
  
  // Выбираем активный сервис
  const activeService = getActiveService();
  
  let imageUrl, thumbnailUrl = null;
  
  switch (activeService) {
    case 'temporary':
      imageUrl = `${EXTERNAL_SERVICES.temporary.baseUrl}${filename}`;
      thumbnailUrl = `${EXTERNAL_SERVICES.temporary.baseUrl}thumb_${filename}`;
      break;
      
    case 'imgur':
      // Здесь будет логика загрузки на Imgur
      imageUrl = `${EXTERNAL_SERVICES.imgur.baseUrl}${filename}`;
      break;
      
    case 'cloudinary':
      // Здесь будет логика загрузки на Cloudinary
      imageUrl = `${EXTERNAL_SERVICES.cloudinary.baseUrl}${filename}`;
      thumbnailUrl = `${EXTERNAL_SERVICES.cloudinary.baseUrl}w_300,h_auto,c_scale/${filename}`;
      break;
      
    default:
      throw new Error('Нет активного сервиса для хранения изображений');
  }
  
  return {
    imageUrl,
    thumbnailUrl,
    filename,
    service: activeService,
    metadata: {
      ...metadata,
      originalFilename,
      imageType,
      generatedAt: new Date().toISOString(),
      expiresAt: activeService === 'temporary' ? 
        new Date(Date.now() + EXTERNAL_SERVICES.temporary.maxAge).toISOString() : 
        null
    }
  };
}

/**
 * Получает активный сервис для хранения изображений
 * @returns {string} Название активного сервиса
 */
function getActiveService() {
  // Проверяем доступность сервисов в порядке приоритета
  if (EXTERNAL_SERVICES.cloudinary.enabled && 
      EXTERNAL_SERVICES.cloudinary.cloudName && 
      EXTERNAL_SERVICES.cloudinary.apiKey) {
    return 'cloudinary';
  }
  
  if (EXTERNAL_SERVICES.imgur.enabled && EXTERNAL_SERVICES.imgur.apiKey) {
    return 'imgur';
  }
  
  // По умолчанию используем временный сервис
  return 'temporary';
}

/**
 * Загружает изображение на внешний сервис
 * @param {Buffer} imageBuffer - Буфер изображения
 * @param {string} filename - Имя файла
 * @param {string} service - Сервис для загрузки
 * @returns {Promise<Object>} Результат загрузки
 */
export async function uploadToExternalService(imageBuffer, filename, service = null) {
  const targetService = service || getActiveService();
  
  switch (targetService) {
    case 'imgur':
      return await uploadToImgur(imageBuffer, filename);
      
    case 'cloudinary':
      return await uploadToCloudinary(imageBuffer, filename);
      
    case 'temporary':
      return await uploadToTemporary(imageBuffer, filename);
      
    default:
      throw new Error(`Неподдерживаемый сервис: ${targetService}`);
  }
}

/**
 * Загрузка на Imgur
 */
async function uploadToImgur(imageBuffer, filename) {
  const FormData = (await import('form-data')).default;
  const fetch = (await import('node-fetch')).default;
  
  const formData = new FormData();
  formData.append('image', imageBuffer, filename);
  
  const response = await fetch(EXTERNAL_SERVICES.imgur.uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Client-ID ${EXTERNAL_SERVICES.imgur.apiKey}`,
      ...formData.getHeaders()
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Ошибка загрузки на Imgur: ${response.status}`);
  }
  
  const result = await response.json();
  return {
    imageUrl: result.data.link,
    thumbnailUrl: result.data.link.replace('.jpg', 'm.jpg'),
    deleteHash: result.data.deletehash
  };
}

/**
 * Загрузка на Cloudinary
 */
async function uploadToCloudinary(imageBuffer, filename) {
  const FormData = (await import('form-data')).default;
  const fetch = (await import('node-fetch')).default;
  
  const formData = new FormData();
  formData.append('file', imageBuffer, filename);
  formData.append('upload_preset', 'ml_default'); // Настройте свой preset
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${EXTERNAL_SERVICES.cloudinary.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  if (!response.ok) {
    throw new Error(`Ошибка загрузки на Cloudinary: ${response.status}`);
  }
  
  const result = await response.json();
  return {
    imageUrl: result.secure_url,
    thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_300,h_auto,c_scale/'),
    publicId: result.public_id
  };
}

/**
 * Загрузка во временное хранилище (с реальным сохранением файлов)
 */
async function uploadToTemporary(imageBuffer, filename) {
  try {
    // Получаем правильный путь к директории сервера
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const serverDir = path.dirname(__dirname); // Поднимаемся на уровень выше от src/
    
    // Создаем директорию для изображений, если её нет
    const uploadsDir = path.join(serverDir, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Создана директория uploads: ${uploadsDir}`);
    }
    
    // Путь к файлу
    const filePath = path.join(uploadsDir, filename);
    
    // Сохраняем файл
    fs.writeFileSync(filePath, imageBuffer);
    
    console.log(`✅ Файл сохранен: ${filePath}`);
    console.log(`📁 Директория uploads: ${uploadsDir}`);
    console.log(`📄 Файл существует: ${fs.existsSync(filePath)}`);
    
    return {
      imageUrl: `${EXTERNAL_SERVICES.temporary.baseUrl}${filename}`,
      thumbnailUrl: `${EXTERNAL_SERVICES.temporary.baseUrl}${filename}`, // Используем тот же файл для превью
      service: 'temporary',
      localPath: filePath
    };
  } catch (error) {
    console.error('❌ Ошибка сохранения файла:', error);
    throw new Error('Не удалось сохранить изображение: ' + error.message);
  }
}

/**
 * Удаляет изображение с внешнего сервиса
 * @param {string} imageUrl - URL изображения
 * @param {string} service - Сервис
 * @param {Object} deleteData - Данные для удаления (deleteHash, publicId и т.д.)
 */
export async function deleteFromExternalService(imageUrl, service, deleteData = {}) {
  switch (service) {
    case 'imgur':
      if (deleteData.deleteHash) {
        await deleteFromImgur(deleteData.deleteHash);
      }
      break;
      
    case 'cloudinary':
      if (deleteData.publicId) {
        await deleteFromCloudinary(deleteData.publicId);
      }
      break;
      
    case 'temporary':
      if (deleteData.localPath) {
        await deleteFromTemporary(deleteData.localPath);
      }
      break;
      
    default:
      console.warn(`Не удалось удалить изображение с сервиса: ${service}`);
  }
}

async function deleteFromImgur(deleteHash) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch(`https://api.imgur.com/3/image/${deleteHash}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Client-ID ${EXTERNAL_SERVICES.imgur.apiKey}`
    }
  });
  
  if (!response.ok) {
    console.error(`Ошибка удаления с Imgur: ${response.status}`);
  }
}

async function deleteFromCloudinary(publicId) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${EXTERNAL_SERVICES.cloudinary.cloudName}/image/destroy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: EXTERNAL_SERVICES.cloudinary.apiKey,
        api_secret: EXTERNAL_SERVICES.cloudinary.apiSecret
      })
    }
  );
  
  if (!response.ok) {
    console.error(`Ошибка удаления с Cloudinary: ${response.status}`);
  }
}

async function deleteFromTemporary(localPath) {
  try {
    if (localPath && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log(`✅ Файл удален: ${localPath}`);
    } else {
      console.log(`⚠️ Файл не найден для удаления: ${localPath}`);
    }
  } catch (error) {
    console.error('❌ Ошибка удаления файла:', error);
  }
}

/**
 * Получает информацию о доступных сервисах
 */
export function getServicesInfo() {
  return {
    available: Object.keys(EXTERNAL_SERVICES).filter(key => EXTERNAL_SERVICES[key].enabled),
    active: getActiveService(),
    config: EXTERNAL_SERVICES
  };
}
