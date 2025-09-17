import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { uploadImageToGitHub, deleteImageFromGitHub, generateTempFilename, isGitHubConfigured } from './githubUploader.mjs';
import { convertImageToSvg, createOptimizedSvg } from './imageToSvgConverter.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Проверяем API ключ
console.log('API ключ установлен:', !!process.env.OPENAI_API_KEY);
console.log('API ключ начинается с:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'НЕТ');

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key' && process.env.OPENAI_API_KEY !== 'YOUR_API_KEY_HERE'
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

/**
 * Прямое конвертирование изображения в SVG без использования GPT
 * Сохраняет все детали исходной фотографии
 * @param {string} imagePath - Путь к изображению
 * @param {Object} furnitureData - Данные мебели (не используются)
 * @param {string} baseUrl - Базовый URL (не используется)
 * @returns {string} SVG контент
 */
export async function convertImageToSvgDirect(imagePath, furnitureData, baseUrl = 'https://acqu1red.github.io/latar') {
  try {
    console.log('🎯 Прямое конвертирование изображения в SVG:', imagePath);
    
    // Конвертируем изображение в SVG с сохранением всех деталей
    const svgContent = await convertImageToSvg(imagePath);
    
    console.log('✅ SVG создан успешно, размер:', svgContent.length, 'символов');
    return svgContent;
    
  } catch (error) {
    console.error('❌ Ошибка прямого конвертирования в SVG:', error);
    // В случае ошибки возвращаем пример SVG
    return createExampleSvg(furnitureData);
  }
}

export async function analyzeImageWithGPT(imagePath, furnitureData, baseUrl = 'https://acqu1red.github.io/latar') {
  try {
    // Если нет реального API ключа, используем прямое конвертирование в SVG
    if (!openai) {
      console.log('Используется прямое конвертирование в SVG без GPT API');
      console.log('Причина: openai client не инициализирован');
      console.log('Переменная OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'установлена' : 'НЕ установлена');
      return await convertImageToSvgDirect(imagePath, furnitureData, baseUrl);
    }

    const prompt = createAnalysisPrompt();
    
    // Сжимаем изображение для экономии памяти (но не так агрессивно)
    console.log('Сжимаем изображение для экономии памяти...');
    const compressedImageBuffer = await resizeImageForResponses(imagePath);
    console.log('Размер сжатого изображения:', compressedImageBuffer.length, 'байт');
    
    let imageUrl;
    let cleanupData = null;
    
    // Проверяем, настроен ли GitHub
    if (isGitHubConfigured()) {
      console.log('Используем GitHub для загрузки изображения');
      
      // Загружаем изображение на GitHub
      const tempFileName = generateTempFilename();
      const uploadResult = await uploadImageToGitHub(compressedImageBuffer, tempFileName);
      imageUrl = uploadResult.url;
      cleanupData = {
        type: 'github',
        path: uploadResult.path,
        commitSha: uploadResult.commitSha
      };
      
    } else {
      console.log('GitHub не настроен, используем локальную загрузку');
      
      // Проверяем, что мы не в продакшене без GitHub
      if (baseUrl.includes('github.io')) {
        console.warn('⚠️ ВНИМАНИЕ: GitHub не настроен, но используется продакшен URL');
        console.warn('Это может привести к ошибкам загрузки изображений');
        console.warn('Рекомендуется настроить GITHUB_TOKEN для стабильной работы');
      }
      
      // Fallback на локальную загрузку
      const tempFileName = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
      const tempFilePath = path.join(path.dirname(imagePath), tempFileName);
      
      // Сохраняем сжатое изображение во временный файл
      fs.writeFileSync(tempFilePath, compressedImageBuffer);
      console.log('Временный файл создан:', tempFileName);
      
      // Создаем публичный URL для изображения
      imageUrl = `${baseUrl}/temp-images/${tempFileName}`;
      cleanupData = {
        type: 'local',
        path: tempFilePath
      };
    }
    
    console.log('Публичный URL изображения:', imageUrl);
    
    // Освобождаем память от сжатого буфера
    compressedImageBuffer.fill(0);
    
    // Используем Responses API с GPT-4o mini
    console.log('Отправляем запрос в GPT-4o mini с URL:', imageUrl);
    
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageUrl }
          ]
        }
      ]
    });
    
    console.log('Получен ответ от GPT-4o mini, структура:', {
      hasOutput: !!response.output,
      outputLength: response.output?.length || 0,
      firstOutput: response.output?.[0] ? 'exists' : 'missing'
    });

    console.log('GPT-4o mini генерация завершена');
    
    // Очищаем временные файлы
    await cleanupTempFiles(cleanupData);
    
    // Детальная диагностика ответа
    console.log('Диагностика ответа от GPT-4o mini:');
    console.log('Количество output элементов:', response.output?.length || 0);
    
    if (response.output && response.output.length > 0) {
      console.log('Первый output элемент:', JSON.stringify(response.output[0], null, 2));
      
      if (response.output[0].content) {
        console.log('Количество content элементов:', response.output[0].content.length);
        response.output[0].content.forEach((item, index) => {
          console.log(`Content[${index}]:`, {
            type: item.type,
            hasImage: !!item.image,
            hasB64Json: !!item.image?.b64_json
          });
        });
      }
    }
    
    // Получаем сгенерированное изображение из ответа
    const generatedImage = response.output?.[0]?.content?.find(c => c.type === "output_image");
    
    if (!generatedImage) {
      console.error('❌ Не найден элемент с типом "output_image"');
      console.error('Доступные типы:', response.output?.[0]?.content?.map(c => c.type) || []);
      
      // Проверяем, есть ли текстовый ответ
      const textContent = response.output?.[0]?.content?.find(c => c.type === "text");
      if (textContent) {
        console.log('Получен текстовый ответ от GPT-4o mini:', textContent.text);
        console.log('GPT-4o mini не сгенерировал изображение, возможно, это не поддерживается');
      }
      
      throw new Error("Изображение не получено от GPT-4o mini - не найден output_image");
    }
    
    if (!generatedImage.image?.b64_json) {
      console.error('❌ Не найден b64_json в изображении');
      console.error('Структура изображения:', JSON.stringify(generatedImage, null, 2));
      throw new Error("Изображение не получено от GPT-4o mini - не найден b64_json");
    }
    
    const resultImageBase64 = generatedImage.image.b64_json;
    console.log('Base64 изображения получен, длина:', resultImageBase64.length);
    
    // Конвертируем base64 в SVG с встроенным изображением
    return convertBase64ToSvg(resultImageBase64);
    
  } catch (error) {
    console.error('Ошибка генерации изображения с GPT-4o mini:', error);
    // Возвращаем пример SVG в случае ошибки
    return createExampleSvg(furnitureData);
  }
}


/**
 * Очищает временные файлы (GitHub или локальные)
 * @param {Object} cleanupData - Данные для очистки
 */
async function cleanupTempFiles(cleanupData) {
  if (!cleanupData) return;
  
  try {
    if (cleanupData.type === 'github') {
      console.log('Удаляем временный файл с GitHub:', cleanupData.path);
      await deleteImageFromGitHub(cleanupData.path, cleanupData.commitSha);
    } else if (cleanupData.type === 'local') {
      console.log('Удаляем локальный временный файл:', cleanupData.path);
      fs.unlinkSync(cleanupData.path);
    } else if (cleanupData.type === 'direct') {
      console.log('Очистка не требуется для прямого использования Buffer');
      // Для прямого использования Buffer очистка не требуется
    }
  } catch (cleanupError) {
    console.warn('Не удалось очистить временные файлы:', cleanupError.message);
  }
}

async function resizeImageForResponses(imagePath) {
  try {
    // Читаем исходное изображение
    const originalBuffer = fs.readFileSync(imagePath);
    console.log('Размер исходного изображения:', originalBuffer.length, 'байт');
    
    // Сжимаем изображение до 768px для Responses API (нет ограничений на размер)
    const resizedBuffer = await sharp(originalBuffer)
      .resize({ width: 768 })
      .png()
      .toBuffer();
    
    console.log('Сжатие завершено. Размер сжатого изображения:', resizedBuffer.length, 'байт');
    console.log('Экономия памяти:', 
      Math.round((1 - resizedBuffer.length / originalBuffer.length) * 100) + '%');
    
    return resizedBuffer;
  } catch (error) {
    console.error('Ошибка сжатия изображения:', error);
    // В случае ошибки возвращаем исходное изображение
    return fs.readFileSync(imagePath);
  }
}

async function compressImage(imagePath) {
  try {
    // Читаем исходное изображение
    const originalBuffer = fs.readFileSync(imagePath);
    console.log('Размер исходного изображения:', originalBuffer.length, 'байт');
    
    // Сжимаем изображение до очень маленького размера для API
    // API ограничение: 16,384 байт, поэтому делаем ~128x128
    const compressedBuffer = await sharp(originalBuffer)
      .resize(128, 128, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toBuffer();
    
    console.log('Сжатие завершено. Размер сжатого изображения:', compressedBuffer.length, 'байт');
    console.log('Экономия памяти:', 
      Math.round((1 - compressedBuffer.length / originalBuffer.length) * 100) + '%');
    
    // Проверяем, что размер не превышает лимит API
    if (compressedBuffer.length > 16384) {
      console.warn('⚠️ Размер изображения всё ещё превышает лимит API (16KB)');
      console.warn('Попробуем сжать ещё сильнее...');
      
      // Дополнительное сжатие до 64x64
      const ultraCompressedBuffer = await sharp(originalBuffer)
        .resize(64, 64, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 70,
          progressive: true
        })
        .toBuffer();
      
      console.log('Ультра-сжатие завершено. Размер:', ultraCompressedBuffer.length, 'байт');
      return ultraCompressedBuffer;
    }
    
    return compressedBuffer;
  } catch (error) {
    console.error('Ошибка сжатия изображения:', error);
    // В случае ошибки возвращаем исходное изображение
    return fs.readFileSync(imagePath);
  }
}

function createAnalysisPrompt() {
  return `Скопируй предоставленный план квартиры в точности.
Сделай чёрно-белую 2D-схему в виде архитектурного чертежа сверху.
Не добавляй никаких новых деталей, мебели, текстов, теней или 3D-эффектов.
Сохрани все размеры, подписи и пропорции строго такими, как на исходной фотографии.`;
}

function convertBase64ToPng(base64Data) {
  // Возвращаем PNG как data URL без дополнительной конвертации
  // Это экономит память, так как не создаем дополнительный Buffer
  return `data:image/png;base64,${base64Data}`;
}

function convertBase64ToSvg(base64Data) {
  // Создаем SVG с встроенным base64 изображением
  // Предполагаем, что изображение от GPT имеет размер 1024x1024
  const width = 1024;
  const height = 1024;
  const dataUrl = `data:image/png;base64,${base64Data}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <image id="generatedImage" 
           x="0" y="0" 
           width="${width}" height="${height}" 
           xlink:href="${dataUrl}"/>
  </defs>
  
  <!-- Сгенерированное изображение от GPT -->
  <use xlink:href="#generatedImage"/>
</svg>`;
}



function createExampleSvg(furnitureData) {
  // Возвращаем пример SVG если GPT недоступен
  const design = furnitureData.design;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="wallPattern" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="none"/>
      <line x1="0" y1="0" x2="10" y2="10" stroke="${design.walls.color}" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- Фон -->
  <rect width="600" height="400" fill="${design.rooms.fillColor}" stroke="${design.rooms.strokeColor}" stroke-width="${design.rooms.strokeThickness}"/>
  
  <!-- Внешние стены -->
  <rect x="50" y="50" width="500" height="300" fill="none" stroke="${design.walls.color}" stroke-width="${design.walls.thickness}"/>
  
  <!-- Внутренние стены -->
  <line x1="300" y1="50" x2="300" y2="200" stroke="${design.walls.color}" stroke-width="${design.walls.thickness}"/>
  <line x1="50" y1="200" x2="300" y2="200" stroke="${design.walls.color}" stroke-width="${design.walls.thickness}"/>
  
  <!-- Окна -->
  <line x1="100" y1="50" x2="200" y2="50" stroke="${design.windows.color}" stroke-width="${design.windows.thickness}" stroke-dasharray="5,5"/>
  <rect x="95" y="45" width="110" height="10" fill="none" stroke="${design.windows.frameColor}" stroke-width="${design.windows.frameThickness}"/>
  
  <line x1="400" y1="50" x2="500" y2="50" stroke="${design.windows.color}" stroke-width="${design.windows.thickness}" stroke-dasharray="5,5"/>
  <rect x="395" y="45" width="110" height="10" fill="none" stroke="${design.windows.frameColor}" stroke-width="${design.windows.frameThickness}"/>
  
  <!-- Двери -->
  <line x1="280" y1="200" x2="320" y2="200" stroke="${design.doors.color}" stroke-width="${design.doors.thickness}"/>
  <path d="M 300 200 A 20 20 0 0 1 320 180" fill="none" stroke="${design.doors.arcColor}" stroke-width="${design.doors.arcThickness}"/>
  
  <!-- Подписи комнат -->
  <text x="150" y="100" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Гостиная</text>
  <text x="400" y="100" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Спальня</text>
  
  <text x="300" y="40" text-anchor="middle" font-size="12" fill="#666">Пример плана квартиры</text>
</svg>`;
}
