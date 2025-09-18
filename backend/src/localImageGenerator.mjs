import sharp from 'sharp';
import fs from 'fs';

/**
 * Локальная генерация изображений на основе эскизов
 * Использует простые алгоритмы обработки изображений
 * @param {string} sketchPath - Путь к файлу эскиза
 * @param {string} prompt - Текстовое описание желаемого изображения
 * @returns {Promise<Buffer>} Сгенерированное изображение
 */
export async function generateLocalImage(sketchPath, prompt) {
  try {
    console.log('🎨 Генерируем изображение локально:', sketchPath);
    console.log('Промпт:', prompt);

    // Читаем эскиз
    const sketchBuffer = fs.readFileSync(sketchPath);
    const sketchImage = sharp(sketchBuffer);
    const metadata = await sketchImage.metadata();

    // Проверяем, нужен ли план с мебелью
    const isFurniturePlan = prompt.toLowerCase().includes('furniture') || 
                           prompt.toLowerCase().includes('with furniture');

    if (isFurniturePlan) {
      // Создаем план с мебелью
      const furnitureImage = await createFurniturePlan(sketchImage, metadata, prompt);
      console.log('✅ Локальный план с мебелью сгенерирован');
      return furnitureImage;
    } else {
      // Создаем обычный план
      const coloredImage = await createColoredImage(sketchImage, metadata, prompt);
      console.log('✅ Локальное изображение сгенерировано');
      return coloredImage;
    }

  } catch (error) {
    console.error('❌ Ошибка локальной генерации:', error);
    console.log('🔄 Создаем простое изображение...');
    
    // Fallback - создаем простое изображение
    try {
      const sketchBuffer = fs.readFileSync(sketchPath);
      const sketchImage = sharp(sketchBuffer);
      const metadata = await sketchImage.metadata();
      
      // Простое цветное изображение
      const simpleImage = await sketchImage
        .greyscale()
        .normalize()
        .png()
        .toBuffer();
      
      return simpleImage;
    } catch (fallbackError) {
      console.error('❌ Ошибка fallback генерации:', fallbackError);
      throw error; // Возвращаем оригинальную ошибку
    }
  }
}

/**
 * Создает цветное изображение на основе эскиза
 * @param {Object} sketchImage - Sharp объект эскиза
 * @param {Object} metadata - Метаданные изображения
 * @param {string} prompt - Промпт для определения стиля
 * @returns {Promise<Buffer>} Цветное изображение
 */
async function createColoredImage(sketchImage, metadata, prompt) {
  const { width, height } = metadata;
  
  // Определяем цветовую схему на основе промпта
  const colorScheme = getColorSchemeFromPrompt(prompt);
  
  // Создаем базовое изображение с градиентом
  const baseImage = await createBaseGradient(width, height, colorScheme);
  
  // Применяем эскиз как маску
  const result = await applySketchAsMask(baseImage, sketchImage, colorScheme);
  
  return result;
}

/**
 * Определяет цветовую схему на основе промпта
 * @param {string} prompt - Промпт
 * @returns {Object} Цветовая схема
 */
function getColorSchemeFromPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Специальная схема для архитектурных планов
  if (lowerPrompt.includes('architectural') || lowerPrompt.includes('floor plan') || 
      lowerPrompt.includes('blueprint') || lowerPrompt.includes('technical drawing')) {
    return {
      primary: '#000000',      // Черные линии плана
      secondary: '#333333',    // Темно-серые элементы
      accent: '#666666',       // Серые детали
      background: '#FFFFFF',   // Белый фон
      furniture: '#2C3E50',    // Темно-синий для мебели
      walls: '#000000'         // Черные стены
    };
  } else if (lowerPrompt.includes('furniture') || lowerPrompt.includes('with furniture')) {
    return {
      primary: '#000000',      // Черные линии плана
      secondary: '#2C3E50',    // Темно-синий для мебели
      accent: '#34495E',       // Серо-синий для деталей
      background: '#FFFFFF',   // Белый фон
      furniture: '#2C3E50',    // Темно-синий для мебели
      walls: '#000000'         // Черные стены
    };
  } else if (lowerPrompt.includes('sunset') || lowerPrompt.includes('sunrise')) {
    return {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFD23F',
      background: '#FFE5B4'
    };
  } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('sea') || lowerPrompt.includes('water')) {
    return {
      primary: '#0066CC',
      secondary: '#00BFFF',
      accent: '#87CEEB',
      background: '#E6F3FF'
    };
  } else if (lowerPrompt.includes('forest') || lowerPrompt.includes('nature') || lowerPrompt.includes('green')) {
    return {
      primary: '#228B22',
      secondary: '#32CD32',
      accent: '#90EE90',
      background: '#F0FFF0'
    };
  } else if (lowerPrompt.includes('room') || lowerPrompt.includes('interior') || lowerPrompt.includes('home')) {
    return {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#F4A460',
      background: '#FFF8DC'
    };
  } else {
    // Дефолтная схема
    return {
      primary: '#4169E1',
      secondary: '#87CEEB',
      accent: '#FFB6C1',
      background: '#F0F8FF'
    };
  }
}

/**
 * Создает базовый градиент
 * @param {number} width - Ширина
 * @param {number} height - Высота
 * @param {Object} colorScheme - Цветовая схема
 * @returns {Promise<Buffer>} Градиентное изображение
 */
async function createBaseGradient(width, height, colorScheme) {
  // Для архитектурных планов создаем чистый белый фон
  if (colorScheme.background === '#FFFFFF') {
    // Создаем чисто белое изображение
    return await sharp({
      create: {
        width: width,
        height: height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .png()
    .toBuffer();
  }
  
  // Для других типов изображений создаем градиент
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorScheme.background};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colorScheme.accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colorScheme.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
    </svg>
  `;
  
  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Применяет эскиз как маску к базовому изображению
 * @param {Buffer} baseImage - Базовое изображение
 * @param {Object} sketchImage - Эскиз
 * @param {Object} colorScheme - Цветовая схема
 * @returns {Promise<Buffer>} Результат
 */
async function applySketchAsMask(baseImage, sketchImage, colorScheme) {
  // Для архитектурных планов используем специальную обработку
  if (colorScheme.background === '#FFFFFF') {
    // Создаем черные линии на белом фоне
    const blackLines = await sketchImage
      .greyscale()
      .normalize()
      .threshold(140) // Более четкие линии
      .png()
      .toBuffer();
    
    // Применяем черные линии к белому фону
    const result = await sharp(baseImage)
      .composite([
        {
          input: blackLines,
          blend: 'multiply',
          opacity: 1.0 // Полная непрозрачность для четких линий
        }
      ])
      .png()
      .toBuffer();
    
    return result;
  }
  
  // Для других типов изображений используем стандартную обработку
  const mask = await sketchImage
    .greyscale()
    .normalize()
    .threshold(128)
    .png()
    .toBuffer();
  
  // Создаем цветную версию эскиза
  const coloredSketch = await sketchImage
    .greyscale()
    .normalize()
    .png()
    .toBuffer();
  
  // Применяем маску к базовому изображению
  const result = await sharp(baseImage)
    .composite([
      {
        input: coloredSketch,
        blend: 'multiply',
        opacity: 0.7
      },
      {
        input: mask,
        blend: 'overlay',
        opacity: 0.5
      }
    ])
    .png()
    .toBuffer();
  
  return result;
}

/**
 * Создает план с мебелью
 * @param {Object} sketchImage - Sharp объект эскиза
 * @param {Object} metadata - Метаданные изображения
 * @param {string} prompt - Промпт
 * @returns {Promise<Buffer>} План с мебелью
 */
async function createFurniturePlan(sketchImage, metadata, prompt) {
  const { width, height } = metadata;
  
  // Создаем белый фон
  const whiteBackground = await sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
  .png()
  .toBuffer();
  
  // Создаем черные линии плана
  const planLines = await sketchImage
    .greyscale()
    .normalize()
    .threshold(140)
    .png()
    .toBuffer();
  
  // Создаем простые символы мебели
  const furnitureSymbols = await createFurnitureSymbols(width, height);
  
  // Объединяем все элементы
  const result = await sharp(whiteBackground)
    .composite([
      {
        input: planLines,
        blend: 'multiply',
        opacity: 1.0
      },
      {
        input: furnitureSymbols,
        blend: 'multiply',
        opacity: 0.8
      }
    ])
    .png()
    .toBuffer();
  
  return result;
}

/**
 * Создает простые символы мебели
 * @param {number} width - Ширина
 * @param {number} height - Высота
 * @returns {Promise<Buffer>} Символы мебели
 */
async function createFurnitureSymbols(width, height) {
  // Создаем SVG с простыми символами мебели
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="furniture" patternUnits="userSpaceOnUse" width="50" height="50">
          <rect width="50" height="50" fill="white"/>
          <!-- Простые символы мебели -->
          <rect x="10" y="10" width="30" height="20" fill="none" stroke="#2C3E50" stroke-width="2"/>
          <rect x="15" y="15" width="20" height="10" fill="none" stroke="#2C3E50" stroke-width="1"/>
          <circle cx="25" cy="25" r="3" fill="#2C3E50"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#furniture)" opacity="0.3"/>
    </svg>
  `;
  
  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Создает эскиз из изображения с улучшенным алгоритмом
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<string>} Путь к эскизу
 */
export async function createEnhancedSketch(imagePath) {
  try {
    console.log('✏️ Создаем улучшенный эскиз:', imagePath);
    
    const outputPath = imagePath.replace(/\.[^/.]+$/, '_enhanced_sketch.png');
    
    // Сначала пробуем с морфологией
    try {
      await sharp(imagePath)
        .greyscale() // Конвертируем в черно-белое
        .normalize() // Нормализуем контраст
        .sharpen({ sigma: 1.5, m1: 0.5, m2: 3.0, x1: 2, y2: 10 }) // Увеличиваем резкость
        .threshold(140) // Применяем пороговое значение
        .morphology({
          operation: 'erode',
          kernel: {
            name: 'circle',
            size: 1
          }
        }) // Утончаем линии
        .png()
        .toFile(outputPath);
    } catch (morphologyError) {
      console.log('⚠️ Морфология не поддерживается, используем упрощенный алгоритм');
      // Fallback без морфологии
      await sharp(imagePath)
        .greyscale() // Конвертируем в черно-белое
        .normalize() // Нормализуем контраст
        .sharpen({ sigma: 1.5, m1: 0.5, m2: 3.0, x1: 2, y2: 10 }) // Увеличиваем резкость
        .threshold(140) // Применяем пороговое значение
        .png()
        .toFile(outputPath);
    }
    
    console.log('✅ Улучшенный эскиз создан:', outputPath);
    return outputPath;
    
  } catch (error) {
    console.error('❌ Ошибка создания улучшенного эскиза:', error);
    throw error;
  }
}
