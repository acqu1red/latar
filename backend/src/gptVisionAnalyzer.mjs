import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { uploadImageToGitHub, deleteImageFromGitHub, generateTempFilename, isGitHubConfigured } from './githubUploader.mjs';
import fetch from 'node-fetch';

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

export async function analyzeImageWithGPT(imagePath, furnitureData, baseUrl = 'https://acqu1red.github.io/latar') {
  try {
    // Если нет реального API ключа, возвращаем пример SVG
    if (!openai) {
      console.log('Используется демо-режим без GPT API');
      console.log('Причина: openai client не инициализирован');
      console.log('Переменная OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'установлена' : 'НЕ установлена');
      return createExampleSvg(furnitureData);
    }

    const prompt = createAnalysisPrompt();
    
    // Читаем и сжимаем изображение для экономии памяти
    console.log('Сжимаем изображение для экономии памяти...');
    const compressedImageBuffer = await compressImage(imagePath);
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
    
    // Используем gpt-image-1 через images.edit с base64 данными
    // Сначала загружаем изображение по URL и конвертируем в base64
    const downloadedImageBase64 = await downloadImageAsBase64(imageUrl);
    
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: Buffer.from(downloadedImageBase64, 'base64'),
      prompt: prompt,
      size: "1024x1024"
    });

    console.log('GPT Image генерация завершена');
    
    // Очищаем временные файлы
    await cleanupTempFiles(cleanupData);
    
    // Получаем base64 изображения из ответа
    const resultImageBase64 = response.data[0].b64_json;
    console.log('Base64 изображения получен, длина:', resultImageBase64.length);
    
    // Конвертируем base64 в PNG
    return convertBase64ToPng(resultImageBase64);
    
  } catch (error) {
    console.error('Ошибка генерации изображения с GPT Image:', error);
    // Возвращаем пример SVG в случае ошибки
    return createExampleSvg(furnitureData);
  }
}

/**
 * Загружает изображение по URL и возвращает base64
 * @param {string} imageUrl - URL изображения
 * @returns {Promise<string>} Base64 строка изображения
 */
async function downloadImageAsBase64(imageUrl) {
  try {
    console.log('Загружаем изображение по URL:', imageUrl);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');
    
    console.log('Изображение загружено, размер:', buffer.length, 'байт');
    return base64;
    
  } catch (error) {
    console.error('Ошибка загрузки изображения по URL:', error);
    throw error;
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
    }
  } catch (cleanupError) {
    console.warn('Не удалось очистить временные файлы:', cleanupError.message);
  }
}

async function compressImage(imagePath) {
  try {
    // Читаем исходное изображение
    const originalBuffer = fs.readFileSync(imagePath);
    console.log('Размер исходного изображения:', originalBuffer.length, 'байт');
    
    // Сжимаем изображение до 768x768 с оптимизацией
    const compressedBuffer = await sharp(originalBuffer)
      .resize(768, 768, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({
        quality: 90,
        compressionLevel: 6
      })
      .toBuffer();
    
    console.log('Сжатие завершено. Экономия памяти:', 
      Math.round((1 - compressedBuffer.length / originalBuffer.length) * 100) + '%');
    
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
