import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { createEnhancedSketch } from './localImageGenerator.mjs';

/**
 * Генерирует фотографию из эскиза используя ScribbleDiffusion API
 * @param {string} sketchPath - Путь к файлу эскиза
 * @param {string} prompt - Текстовое описание желаемого изображения
 * @returns {Promise<Buffer>} Сгенерированное изображение
 */
export async function generatePhotoFromSketch(sketchPath, prompt) {
  try {
    console.log('🎨 Генерируем фотографию из эскиза через Scribble Diffusion API');
    console.log('Эскиз:', sketchPath);
    console.log('Промпт:', prompt);

    // Проверяем наличие API ключа для Scribble Diffusion
    if (!process.env.SCRIBBLE_DIFFUSION_API_KEY) {
      throw new Error('SCRIBBLE_DIFFUSION_API_KEY не установлен. Добавьте API ключ в переменные окружения.');
    }

    // Читаем файл эскиза
    const sketchBuffer = fs.readFileSync(sketchPath);
    const sketchBase64 = sketchBuffer.toString('base64');
    const sketchDataUrl = `data:image/png;base64,${sketchBase64}`;

    // Создаем запрос к Scribble Diffusion API
    const response = await fetch('https://api.scribblediffusion.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SCRIBBLE_DIFFUSION_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: sketchDataUrl,
        prompt: prompt,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, deformed"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка Scribble Diffusion API: ${response.status} - ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('Неверный API ключ Scribble Diffusion. Проверьте правильность ключа.');
      } else if (response.status === 402) {
        throw new Error('Недостаточно кредитов на Scribble Diffusion. Пополните баланс.');
      } else if (response.status === 429) {
        throw new Error('Превышен лимит запросов. Попробуйте позже.');
      } else {
        throw new Error(`Ошибка API: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
    
    // Проверяем, если API возвращает изображение напрямую
    if (result.image) {
      console.log('✅ Изображение получено напрямую от API');
      const imageBuffer = Buffer.from(result.image, 'base64');
      console.log('✅ Фотография сгенерирована, размер:', imageBuffer.length, 'байт');
      return imageBuffer;
    }
    
    // Если API возвращает URL изображения
    if (result.imageUrl) {
      console.log('📥 Скачиваем сгенерированное изображение:', result.imageUrl);
      const imageResponse = await fetch(result.imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Ошибка скачивания изображения: ${imageResponse.status}`);
      }
      const imageBuffer = await imageResponse.buffer();
      console.log('✅ Фотография сгенерирована, размер:', imageBuffer.length, 'байт');
      return imageBuffer;
    }
    
    // Если API возвращает ID для отслеживания (как Replicate)
    if (result.id) {
      console.log('✅ Запрос создан, ID:', result.id);
      const finalResult = await waitForCompletion(result.id);
      
      if (!finalResult || !finalResult.output || finalResult.output.length === 0) {
        throw new Error('Генерация не завершилась успешно');
      }

      const imageUrl = finalResult.output[0];
      console.log('📥 Скачиваем сгенерированное изображение:', imageUrl);
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Ошибка скачивания изображения: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.buffer();
      console.log('✅ Фотография сгенерирована, размер:', imageBuffer.length, 'байт');
      return imageBuffer;
    }
    
    throw new Error('Неожиданный формат ответа от API');

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
      const response = await fetch(`https://api.scribblediffusion.com/v1/status/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SCRIBBLE_DIFFUSION_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка проверки статуса: ${response.status}`);
      }

      const result = await response.json();
      console.log(`⏳ Статус генерации: ${result.status} (попытка ${attempts + 1}/${maxAttempts})`);

      if (result.status === 'succeeded' || result.status === 'completed') {
        console.log('✅ Генерация завершена успешно');
        return result;
      } else if (result.status === 'failed' || result.status === 'error') {
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

