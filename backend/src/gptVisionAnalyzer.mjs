import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

export async function analyzeImageWithGPT(imagePath, furnitureData) {
  try {
    // Если нет реального API ключа, возвращаем пример SVG
    if (!openai) {
      console.log('Используется демо-режим без GPT API');
      return createExampleSvg(furnitureData);
    }

    // Читаем изображение как base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = createAnalysisPrompt();
    
    // Используем DALL-E для генерации изображения
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      response_format: "b64_json",
      n: 1,
      quality: "hd"
    });

    console.log('DALL-E генерация завершена');
    
    // Конвертируем base64 в SVG (пока возвращаем как base64 PNG)
    const imageData = response.data[0].b64_json;
    return convertBase64ToSvg(imageData);
    
  } catch (error) {
    console.error('Ошибка генерации изображения с DALL-E:', error);
    // Возвращаем пример SVG в случае ошибки
    return createExampleSvg(furnitureData);
  }
}

function createAnalysisPrompt() {
  return `Ты — инструмент для точного переноса планов квартир из фотографий в чистую 2D-схему.  
Задача: строго копировать чертёж с фотографии, не добавляя и не убирая никаких деталей.  
Все размеры, линии, подписи и пропорции должны быть перенесены максимально точно.  
Не нужно придумывать мебель или элементы, которых нет на фото.  

Инструкция для генерации изображения:
- Стиль: чёрно-белая 2D-схема (архитектурный чертёж).  
- Линии: ровные, чёткие, одинаковой толщины.  
- Все цифры (размеры, площади комнат) должны быть перенесены в том же виде, что и на фото.  
- Формат: план сверху (top view), строго повторяющий исходное изображение.  
- Никаких надписей «недвижимость», водяных знаков или посторонних элементов.  
- Максимальная точность — это основная цель.  

Входные данные: фотография плана квартиры (будет загружена пользователем).  
Выходные данные: готовая 2D-схема в векторном стиле без посторонних элементов.`;
}

function convertBase64ToSvg(base64Data) {
  // Создаем SVG с встроенным изображением
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${base64Data}" width="1024" height="1024"/>
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
