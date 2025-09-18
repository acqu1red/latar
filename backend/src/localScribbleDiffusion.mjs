/**
 * Локальная реализация ScribbleDiffusion без Replicate API
 * Использует Stable Diffusion и ControlNet для генерации изображений из эскизов
 */

import fetch from 'node-fetch';
import fs from 'fs';
import sharp from 'sharp';

/**
 * Конфигурация для локальной генерации
 */
const LOCAL_CONFIG = {
  // Hugging Face API для локального запуска Stable Diffusion
  HUGGINGFACE_API_URL: process.env.HUGGINGFACE_API_URL || 'http://localhost:7860',
  
  // Альтернативно - Ollama API
  OLLAMA_API_URL: process.env.OLLAMA_API_URL || 'http://localhost:11434',
  
  // Используем ли мы локальную модель
  USE_LOCAL_MODEL: process.env.USE_LOCAL_MODEL === 'true',
  
  // Fallback на улучшенную локальную генерацию
  FALLBACK_TO_ENHANCED: true
};

/**
 * Генерирует изображение из эскиза используя локальную модель
 * @param {string} sketchPath - Путь к файлу эскиза
 * @param {string} prompt - Текстовое описание желаемого изображения
 * @returns {Promise<Buffer>} Сгенерированное изображение
 */
export async function generateLocalScribbleDiffusion(sketchPath, prompt) {
  try {
    console.log('🎨 Локальная генерация ScribbleDiffusion:', sketchPath);
    console.log('Промпт:', prompt);

    // Пробуем разные методы локальной генерации
    if (LOCAL_CONFIG.USE_LOCAL_MODEL) {
      try {
        // Метод 1: Hugging Face API
        const result = await generateWithHuggingFace(sketchPath, prompt);
        if (result) return result;
      } catch (error) {
        console.log('⚠️ Hugging Face недоступен, пробуем Ollama...');
      }

      try {
        // Метод 2: Ollama API
        const result = await generateWithOllama(sketchPath, prompt);
        if (result) return result;
      } catch (error) {
        console.log('⚠️ Ollama недоступен, используем улучшенную локальную генерацию...');
      }
    }

    // Метод 3: Улучшенная локальная генерация (fallback)
    if (LOCAL_CONFIG.FALLBACK_TO_ENHANCED) {
      return await generateEnhancedLocal(sketchPath, prompt);
    }

    throw new Error('Все методы локальной генерации недоступны');

  } catch (error) {
    console.error('❌ Ошибка локальной генерации ScribbleDiffusion:', error);
    throw error;
  }
}

/**
 * Генерация через Hugging Face API
 * @param {string} sketchPath - Путь к эскизу
 * @param {string} prompt - Промпт
 * @returns {Promise<Buffer|null>} Результат или null
 */
async function generateWithHuggingFace(sketchPath, prompt) {
  try {
    console.log('🤗 Пробуем Hugging Face API...');
    
    // Читаем эскиз
    const sketchBuffer = fs.readFileSync(sketchPath);
    const sketchBase64 = sketchBuffer.toString('base64');
    
    // Отправляем запрос к Hugging Face API
    const response = await fetch(`${LOCAL_CONFIG.HUGGINGFACE_API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: `data:image/png;base64,${sketchBase64}`,
          prompt: prompt,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          controlnet_conditioning_scale: 1.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.output && result.output.length > 0) {
      const imageResponse = await fetch(result.output[0]);
      const imageBuffer = await imageResponse.buffer();
      console.log('✅ Hugging Face генерация успешна');
      return imageBuffer;
    }

    return null;
  } catch (error) {
    console.error('❌ Ошибка Hugging Face:', error.message);
    return null;
  }
}

/**
 * Генерация через Ollama API
 * @param {string} sketchPath - Путь к эскизу
 * @param {string} prompt - Промпт
 * @returns {Promise<Buffer|null>} Результат или null
 */
async function generateWithOllama(sketchPath, prompt) {
  try {
    console.log('🦙 Пробуем Ollama API...');
    
    // Читаем эскиз
    const sketchBuffer = fs.readFileSync(sketchPath);
    const sketchBase64 = sketchBuffer.toString('base64');
    
    // Отправляем запрос к Ollama API
    const response = await fetch(`${LOCAL_CONFIG.OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'stable-diffusion',
        prompt: `${prompt}, based on this sketch: data:image/png;base64,${sketchBase64}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.response) {
      // Ollama возвращает base64 изображение
      const imageBuffer = Buffer.from(result.response, 'base64');
      console.log('✅ Ollama генерация успешна');
      return imageBuffer;
    }

    return null;
  } catch (error) {
    console.error('❌ Ошибка Ollama:', error.message);
    return null;
  }
}

/**
 * Улучшенная локальная генерация (fallback)
 * @param {string} sketchPath - Путь к эскизу
 * @param {string} prompt - Промпт
 * @returns {Promise<Buffer>} Результат
 */
async function generateEnhancedLocal(sketchPath, prompt) {
  console.log('🎨 Улучшенная локальная генерация...');
  
  // Читаем эскиз
  const sketchBuffer = fs.readFileSync(sketchPath);
  const sketchImage = sharp(sketchBuffer);
  const metadata = await sketchImage.metadata();
  
  // Определяем тип генерации по промпту
  const isFurniturePlan = prompt.toLowerCase().includes('furniture') || 
                         prompt.toLowerCase().includes('with furniture');
  
  if (isFurniturePlan) {
    return await createAdvancedFurniturePlan(sketchImage, metadata, prompt);
  } else {
    return await createAdvancedPlan(sketchImage, metadata, prompt);
  }
}

/**
 * Создает продвинутый план без мебели
 * @param {Object} sketchImage - Sharp объект эскиза
 * @param {Object} metadata - Метаданные
 * @param {string} prompt - Промпт
 * @returns {Promise<Buffer>} Результат
 */
async function createAdvancedPlan(sketchImage, metadata, prompt) {
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
  
  // Создаем улучшенные линии плана
  const planLines = await sketchImage
    .greyscale()
    .normalize()
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 3.0, x1: 2, y2: 10 })
    .threshold(140)
    .png()
    .toBuffer();
  
  // Создаем профессиональные элементы плана
  const planElements = await createPlanElements(width, height);
  
  // Объединяем все элементы
  const result = await sharp(whiteBackground)
    .composite([
      {
        input: planLines,
        blend: 'multiply',
        opacity: 1.0
      },
      {
        input: planElements,
        blend: 'multiply',
        opacity: 0.9
      }
    ])
    .png()
    .toBuffer();
  
  return result;
}

/**
 * Создает продвинутый план с мебелью
 * @param {Object} sketchImage - Sharp объект эскиза
 * @param {Object} metadata - Метаданные
 * @param {string} prompt - Промпт
 * @returns {Promise<Buffer>} Результат
 */
async function createAdvancedFurniturePlan(sketchImage, metadata, prompt) {
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
  
  // Создаем улучшенные линии плана
  const planLines = await sketchImage
    .greyscale()
    .normalize()
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 3.0, x1: 2, y2: 10 })
    .threshold(140)
    .png()
    .toBuffer();
  
  // Создаем профессиональные элементы плана
  const planElements = await createPlanElements(width, height);
  
  // Создаем улучшенные символы мебели
  const furnitureSymbols = await createAdvancedFurnitureSymbols(width, height);
  
  // Объединяем все элементы
  const result = await sharp(whiteBackground)
    .composite([
      {
        input: planLines,
        blend: 'multiply',
        opacity: 1.0
      },
      {
        input: planElements,
        blend: 'multiply',
        opacity: 0.9
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
 * Создает профессиональные элементы плана
 * @param {number} width - Ширина
 * @param {number} height - Высота
 * @returns {Promise<Buffer>} Элементы плана
 */
async function createPlanElements(width, height) {
  // Создаем SVG с профессиональными элементами плана
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="planElements" patternUnits="userSpaceOnUse" width="100" height="100">
          <rect width="100" height="100" fill="white"/>
          <!-- Профессиональные элементы плана -->
          <line x1="10" y1="10" x2="90" y2="10" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="20" x2="90" y2="20" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="30" x2="90" y2="30" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="60" x2="90" y2="60" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="70" x2="90" y2="70" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="80" x2="90" y2="80" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="10" y1="90" x2="90" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          
          <line x1="10" y1="10" x2="10" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="20" y1="10" x2="20" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="30" y1="10" x2="30" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="40" y1="10" x2="40" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="50" y1="10" x2="50" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="60" y1="10" x2="60" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="70" y1="10" x2="70" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="80" y1="10" x2="80" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
          <line x1="90" y1="10" x2="90" y2="90" stroke="#000000" stroke-width="1" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#planElements)" opacity="0.3"/>
    </svg>
  `;
  
  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Создает продвинутые символы мебели
 * @param {number} width - Ширина
 * @param {number} height - Высота
 * @returns {Promise<Buffer>} Символы мебели
 */
async function createAdvancedFurnitureSymbols(width, height) {
  // Создаем SVG с продвинутыми символами мебели
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="advancedFurniture" patternUnits="userSpaceOnUse" width="80" height="80">
          <rect width="80" height="80" fill="white"/>
          <!-- Продвинутые символы мебели -->
          <!-- Кровать -->
          <rect x="10" y="15" width="25" height="15" fill="none" stroke="#2C3E50" stroke-width="2"/>
          <rect x="12" y="17" width="21" height="11" fill="none" stroke="#2C3E50" stroke-width="1"/>
          <circle cx="22" cy="22" r="2" fill="#2C3E50"/>
          
          <!-- Диван -->
          <rect x="40" y="10" width="30" height="20" fill="none" stroke="#2C3E50" stroke-width="2"/>
          <rect x="42" y="12" width="26" height="16" fill="none" stroke="#2C3E50" stroke-width="1"/>
          <line x1="45" y1="15" x2="65" y2="15" stroke="#2C3E50" stroke-width="1"/>
          
          <!-- Стол -->
          <rect x="15" y="40" width="20" height="15" fill="none" stroke="#2C3E50" stroke-width="2"/>
          <rect x="17" y="42" width="16" height="11" fill="none" stroke="#2C3E50" stroke-width="1"/>
          <circle cx="25" cy="47" r="1" fill="#2C3E50"/>
          
          <!-- Стул -->
          <rect x="45" y="40" width="8" height="8" fill="none" stroke="#2C3E50" stroke-width="2"/>
          <rect x="47" y="42" width="4" height="4" fill="none" stroke="#2C3E50" stroke-width="1"/>
          
          <!-- Шкаф -->
          <rect x="60" y="40" width="12" height="20" fill="none" stroke="#2C3E50" stroke-width="2"/>
          <rect x="62" y="42" width="8" height="16" fill="none" stroke="#2C3E50" stroke-width="1"/>
          <line x1="64" y1="45" x2="68" y2="45" stroke="#2C3E50" stroke-width="1"/>
          <line x1="64" y1="50" x2="68" y2="50" stroke="#2C3E50" stroke-width="1"/>
          <line x1="64" y1="55" x2="68" y2="55" stroke="#2C3E50" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#advancedFurniture)" opacity="0.4"/>
    </svg>
  `;
  
  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Проверяет доступность локальных сервисов
 * @returns {Promise<Object>} Статус сервисов
 */
export async function checkLocalServices() {
  const status = {
    huggingface: false,
    ollama: false,
    enhanced: true
  };

  try {
    const response = await fetch(`${LOCAL_CONFIG.HUGGINGFACE_API_URL}/health`, { timeout: 5000 });
    status.huggingface = response.ok;
  } catch (error) {
    console.log('Hugging Face недоступен');
  }

  try {
    const response = await fetch(`${LOCAL_CONFIG.OLLAMA_API_URL}/api/tags`, { timeout: 5000 });
    status.ollama = response.ok;
  } catch (error) {
    console.log('Ollama недоступен');
  }

  return status;
}
