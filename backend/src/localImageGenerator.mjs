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

    // Создаем цветную версию на основе эскиза
    const coloredImage = await createColoredImage(sketchImage, metadata, prompt);
    
    console.log('✅ Локальное изображение сгенерировано');
    return coloredImage;

  } catch (error) {
    console.error('❌ Ошибка локальной генерации:', error);
    throw error;
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
  
  // Определяем основные цвета на основе ключевых слов
  if (lowerPrompt.includes('sunset') || lowerPrompt.includes('sunrise')) {
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
  // Создаем SVG с градиентом
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
  // Конвертируем эскиз в маску
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
 * Создает эскиз из изображения с улучшенным алгоритмом
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<string>} Путь к эскизу
 */
export async function createEnhancedSketch(imagePath) {
  try {
    console.log('✏️ Создаем улучшенный эскиз:', imagePath);
    
    const outputPath = imagePath.replace(/\.[^/.]+$/, '_enhanced_sketch.png');
    
    await sharp(imagePath)
      .greyscale() // Конвертируем в черно-белое
      .normalize() // Нормализуем контраст
      .sharpen({ sigma: 1.5, m1: 0.5, m2: 3.0, x1: 2, y2: 10 }) // Увеличиваем резкость
      .threshold(140) // Применяем пороговое значение
      .morphology({
        operation: 'erode',
        kernel: sharp.kernel.circle(1)
      }) // Утончаем линии
      .png()
      .toFile(outputPath);
    
    console.log('✅ Улучшенный эскиз создан:', outputPath);
    return outputPath;
    
  } catch (error) {
    console.error('❌ Ошибка создания улучшенного эскиза:', error);
    throw error;
  }
}
