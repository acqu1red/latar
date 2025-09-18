import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { generateLocalImage, createEnhancedSketch } from './localImageGenerator.mjs';
import { generateLocalScribbleDiffusion, checkLocalServices } from './localScribbleDiffusion.mjs';

/**
 * Генерирует фотографию из эскиза используя ScribbleDiffusion через Replicate API
 * @param {string} sketchPath - Путь к файлу эскиза
 * @param {string} prompt - Текстовое описание желаемого изображения
 * @returns {Promise<Buffer>} Сгенерированное изображение
 */
export async function generatePhotoFromSketch(sketchPath, prompt) {
  try {
    console.log('🎨 Генерируем фотографию из эскиза');
    console.log('Эскиз:', sketchPath);
    console.log('Промпт:', prompt);

    // Проверяем существование файла эскиза
    if (!fs.existsSync(sketchPath)) {
      throw new Error(`Файл эскиза не найден: ${sketchPath}`);
    }

    // Используем только локальную генерацию
    console.log('🏠 Используем локальную генерацию (Replicate API отключен)');
    const result = await generateLocalScribbleDiffusion(sketchPath, prompt);
    
    if (!result || result.length === 0) {
      throw new Error('Локальная генерация вернула пустой результат');
    }
    
    console.log('✅ Локальная генерация завершена успешно, размер:', result.length, 'байт');
    return result;

  } catch (error) {
    console.error('❌ Ошибка генерации фотографии:', error);
    console.error('❌ Детали ошибки:', error.message);
    console.error('❌ Стек ошибки:', error.stack);
    throw error;
  }
}


/**
 * Создает эскиз из загруженного изображения для ScribbleDiffusion
 * @param {string} imagePath - Путь к исходному изображению
 * @returns {Promise<string>} Путь к созданному эскизу
 */
export async function createSketchFromImage(imagePath) {
  try {
    console.log('✏️ Создаем эскиз из изображения:', imagePath);
    
    // Используем улучшенный алгоритм для создания эскиза
    const sketchPath = await createEnhancedSketch(imagePath);
    
    console.log('✅ Эскиз создан:', sketchPath);
    return sketchPath;
    
  } catch (error) {
    console.error('❌ Ошибка создания эскиза:', error);
    console.log('🔄 Переключаемся на простой алгоритм...');
    try {
      return await convertToSketch(imagePath);
    } catch (fallbackError) {
      console.error('❌ Ошибка простого алгоритма:', fallbackError);
      // Создаем базовый эскиз
      const outputPath = imagePath.replace(/\.[^/.]+$/, '_basic_sketch.png');
      await sharp(imagePath)
        .greyscale()
        .threshold(128)
        .png()
        .toFile(outputPath);
      return outputPath;
    }
  }
}

/**
 * Конвертирует изображение в эскиз
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<string>} Путь к эскизу
 */
async function convertToSketch(imagePath) {
  const sharp = await import('sharp');
  
  const outputPath = imagePath.replace(/\.[^/.]+$/, '_sketch.png');
  
  await sharp.default(imagePath)
    .greyscale() // Конвертируем в черно-белое
    .normalize() // Нормализуем контраст
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 3.0, x1: 2, y2: 10 }) // Увеличиваем резкость
    .threshold(128) // Применяем пороговое значение для создания контуров
    .png()
    .toFile(outputPath);
  
  return outputPath;
}

/**
 * Генерирует промпт на основе анализа изображения
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<string>} Сгенерированный промпт
 */
export async function generatePromptFromImage(imagePath) {
  try {
    console.log('📝 Генерируем промпт для изображения:', imagePath);
    
    // Простой анализ изображения для создания промпта
    const prompt = await analyzeImageForPrompt(imagePath);
    
    console.log('✅ Промпт сгенерирован:', prompt);
    return prompt;
    
  } catch (error) {
    console.error('❌ Ошибка генерации промпта:', error);
    // Возвращаем базовый промпт в случае ошибки
    return "a detailed, high-quality, professional photograph";
  }
}

/**
 * Анализирует изображение и создает промпт
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<string>} Промпт
 */
async function analyzeImageForPrompt(imagePath) {
  const sharp = await import('sharp');
  
  // Получаем метаданные изображения
  const metadata = await sharp.default(imagePath).metadata();
  
  // Анализируем основные характеристики
  const isLandscape = metadata.width > metadata.height;
  const aspectRatio = metadata.width / metadata.height;
  
  // Базовые промпты в зависимости от характеристик
  let basePrompt = "a detailed, high-quality, professional photograph";
  
  if (isLandscape) {
    basePrompt += ", landscape orientation";
  } else {
    basePrompt += ", portrait orientation";
  }
  
  if (aspectRatio > 2) {
    basePrompt += ", wide panoramic view";
  } else if (aspectRatio < 0.5) {
    basePrompt += ", tall vertical composition";
  }
  
  // Добавляем общие улучшения качества
  basePrompt += ", sharp focus, good lighting, vibrant colors, detailed textures";
  
  return basePrompt;
}
