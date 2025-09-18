import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { generateLocalImage, createEnhancedSketch } from './localImageGenerator.mjs';

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

    // Проверяем наличие API ключа
    if (!process.env.REPLICATE_API_TOKEN) {
      console.log('⚠️ Replicate API токен не найден, используем локальную генерацию');
      return await generateLocalImage(sketchPath, prompt);
    }

    // Читаем файл эскиза
    const sketchBuffer = fs.readFileSync(sketchPath);
    const sketchBase64 = sketchBuffer.toString('base64');
    const sketchDataUrl = `data:image/png;base64,${sketchBase64}`;

    // Создаем запрос к Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // ControlNet Scribble model
        input: {
          image: sketchDataUrl,
          prompt: prompt,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, deformed"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка Replicate API: ${response.status} - ${errorText}`);
      console.log('🔄 Переключаемся на локальную генерацию...');
      return await generateLocalImage(sketchPath, prompt);
    }

    const prediction = await response.json();
    console.log('✅ Запрос создан, ID:', prediction.id);

    // Ждем завершения генерации
    const result = await waitForCompletion(prediction.id);
    
    if (!result || !result.output || result.output.length === 0) {
      throw new Error('Генерация не завершилась успешно');
    }

    // Скачиваем результат
    const imageUrl = result.output[0];
    console.log('📥 Скачиваем сгенерированное изображение:', imageUrl);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Ошибка скачивания изображения: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.buffer();
    console.log('✅ Фотография сгенерирована, размер:', imageBuffer.length, 'байт');
    
    return imageBuffer;

  } catch (error) {
    console.error('❌ Ошибка генерации фотографии:', error);
    throw error;
  }
}

/**
 * Ожидает завершения генерации
 * @param {string} predictionId - ID предсказания
 * @returns {Promise<Object>} Результат генерации
 */
async function waitForCompletion(predictionId) {
  const maxAttempts = 60; // 5 минут максимум
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка проверки статуса: ${response.status}`);
      }

      const result = await response.json();
      console.log(`⏳ Статус генерации: ${result.status} (попытка ${attempts + 1}/${maxAttempts})`);

      if (result.status === 'succeeded') {
        console.log('✅ Генерация завершена успешно');
        return result;
      } else if (result.status === 'failed') {
        throw new Error(`Генерация не удалась: ${result.error || 'Неизвестная ошибка'}`);
      } else if (result.status === 'canceled') {
        throw new Error('Генерация отменена');
      }

      // Ждем 5 секунд перед следующей проверкой
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  throw new Error('Превышено время ожидания генерации');
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
