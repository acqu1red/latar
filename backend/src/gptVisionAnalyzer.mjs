import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

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

export async function analyzeImageWithGPT(imagePath, furnitureData) {
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
    
    // Используем gpt-image-1 через images.edit для редактирования плана
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: compressedImageBuffer,
      prompt: prompt,
      size: "1024x1024"
    });

    console.log('GPT Image генерация завершена');
    
    // Освобождаем память от сжатого буфера
    compressedImageBuffer.fill(0);
    
    // Получаем base64 изображения из ответа
    const imageBase64 = response.data[0].b64_json;
    console.log('Base64 изображения получен, длина:', imageBase64.length);
    
    // Конвертируем base64 в PNG
    return convertBase64ToPng(imageBase64);
    
  } catch (error) {
    console.error('Ошибка генерации изображения с GPT Image:', error);
    // Возвращаем пример SVG в случае ошибки
    return createExampleSvg(furnitureData);
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
