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
    
    const prompt = createAnalysisPrompt(furnitureData);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000
    });

    const analysis = response.choices[0].message.content;
    console.log('GPT Analysis:', analysis);
    
    // Парсим ответ и генерируем SVG
    const svgContent = parseAnalysisAndGenerateSvg(analysis, furnitureData);
    return svgContent;
    
  } catch (error) {
    console.error('Ошибка анализа изображения с GPT:', error);
    // Возвращаем пример SVG в случае ошибки
    return createExampleSvg(furnitureData);
  }
}

function createAnalysisPrompt(furnitureData) {
  const furnitureList = furnitureData.furniture.map(item => 
    `- ${item.name}: ${item.keywords.join(', ')}`
  ).join('\n');

  return `ТЫ ДОЛЖЕН СТРОГО КОПИРОВАТЬ ПЛАН С ФОТОГРАФИИ! НЕ ПРИДУМЫВАЙ НИЧЕГО СВОЕГО!

ЗАДАЧА: Проанализируй план квартиры на изображении и передай его ТОЧНО как есть.

КРИТИЧЕСКИ ВАЖНО:
1. СТРОГО следуй тому, что видишь на фотографии
2. НЕ добавляй ничего, чего нет на плане
3. НЕ убирай ничего, что есть на плане
4. Сохраняй точные пропорции и размеры
5. Передавай ВСЕ помещения, стены, окна, двери

ПОШАГОВЫЙ АНАЛИЗ:

ШАГ 1 - ВНЕШНИЕ СТЕНЫ:
- Найди периметр квартиры (внешние стены)
- Измерь точные координаты каждой стены
- Передай ВСЕ внешние стены как есть

ШАГ 2 - ВНУТРЕННИЕ СТЕНЫ:
- Найди ВСЕ внутренние стены, разделяющие комнаты
- Передай их точные координаты
- НЕ пропускай ни одной стены

ШАГ 3 - ОКНА:
- Найди ВСЕ окна на внешних стенах
- Передай их точное расположение и размеры
- Сохрани пропорции окон

ШАГ 4 - ДВЕРИ:
- Найди ВСЕ двери между комнатами
- Найди входную дверь
- Передай их точные координаты

ШАГ 5 - ПОМЕЩЕНИЯ:
- Определи ВСЕ комнаты на плане
- Для каждой комнаты укажи точные границы (x, y, width, height)
- Используй названия: гостиная, спальня, кухня, ванная, прихожая, коридор, балкон, лоджия, кладовка, гардеробная
- Сохрани точные размеры каждой комнаты

ШАГ 6 - МЕБЕЛЬ (только если четко видна):
${furnitureList}

ФОРМАТ ОТВЕТА (строго JSON):
{
  "walls": {
    "external": [{"x1": 0, "y1": 0, "x2": 100, "y2": 0, "thickness": 2}],
    "internal": [{"x1": 50, "y1": 0, "x2": 50, "y2": 50, "thickness": 1}]
  },
  "windows": [{"x1": 10, "y1": 0, "x2": 30, "y2": 0, "width": 2}],
  "doors": [{"x1": 40, "y1": 0, "x2": 60, "y2": 0, "width": 2}],
  "rooms": [{"name": "гостиная", "x": 0, "y": 0, "width": 50, "height": 50, "area": 25}],
  "furniture": [{"name": "диван", "x": 20, "y": 20, "width": 30, "height": 15}]
}

ПРАВИЛА:
- Координаты в процентах (0-100)
- Толщина стен в пикселях
- Площадь комнат в квадратных метрах (если указана на плане)
- Мебель добавляй ТОЛЬКО если четко видна
- НЕ ПРИДУМЫВАЙ НИЧЕГО - только то, что видишь!

ПОМНИ: Твоя задача - создать ТОЧНУЮ копию плана с фотографии!`;
}

function parseAnalysisAndGenerateSvg(analysis, furnitureData) {
  try {
    console.log('Получен ответ от GPT:', analysis);
    
    // Извлекаем JSON из ответа GPT (ищем самый большой JSON блок)
    const jsonMatches = analysis.match(/\{[\s\S]*\}/g);
    if (!jsonMatches || jsonMatches.length === 0) {
      throw new Error('Не найден JSON в ответе GPT');
    }
    
    // Берем самый большой JSON блок (скорее всего основной ответ)
    const jsonString = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
    console.log('Извлеченный JSON:', jsonString);
    
    const planData = JSON.parse(jsonString);
    console.log('Распарсенные данные плана:', planData);
    
    // Валидация обязательных полей
    if (!planData.walls || (!planData.walls.external && !planData.walls.internal)) {
      console.warn('Отсутствуют данные о стенах, используем пример');
      return createExampleSvg(furnitureData);
    }
    
    return generateSvgFromPlanData(planData, furnitureData);
    
  } catch (error) {
    console.error('Ошибка парсинга ответа GPT:', error);
    console.error('Ответ GPT был:', analysis);
    
    // Попробуем извлечь хотя бы частичную информацию
    try {
      const partialData = extractPartialData(analysis);
      if (partialData) {
        console.log('Используем частично извлеченные данные:', partialData);
        return generateSvgFromPlanData(partialData, furnitureData);
      }
    } catch (partialError) {
      console.error('Ошибка при извлечении частичных данных:', partialError);
    }
    
    return createExampleSvg(furnitureData);
  }
}

function extractPartialData(analysis) {
  // Попробуем извлечь хотя бы базовую структуру
  const data = {
    walls: { external: [], internal: [] },
    windows: [],
    doors: [],
    rooms: [],
    furniture: []
  };
  
  // Простой поиск координат стен
  const wallMatches = analysis.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
  if (wallMatches) {
    wallMatches.forEach(match => {
      const coords = match.split(',').map(n => parseInt(n.trim()));
      if (coords.length === 4) {
        data.walls.external.push({
          x1: coords[0],
          y1: coords[1], 
          x2: coords[2],
          y2: coords[3],
          thickness: 2
        });
      }
    });
  }
  
  // Если есть хотя бы одна стена, возвращаем данные
  if (data.walls.external.length > 0) {
    return data;
  }
  
  return null;
}

function generateSvgFromPlanData(planData, furnitureData) {
  const design = furnitureData.design;
  const svgWidth = 600;
  const svgHeight = 400;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="wallPattern" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="none"/>
      <line x1="0" y1="0" x2="10" y2="10" stroke="${design.walls.color}" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- Фон -->
  <rect width="${svgWidth}" height="${svgHeight}" fill="${design.rooms.fillColor}" stroke="${design.rooms.strokeColor}" stroke-width="${design.rooms.strokeThickness}"/>
`;

  // Внешние стены
  if (planData.walls && planData.walls.external) {
    planData.walls.external.forEach(wall => {
      const x1 = (wall.x1 / 100) * svgWidth;
      const y1 = (wall.y1 / 100) * svgHeight;
      const x2 = (wall.x2 / 100) * svgWidth;
      const y2 = (wall.y2 / 100) * svgHeight;
      const thickness = wall.thickness || design.walls.thickness;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.walls.color}" stroke-width="${thickness}"/>\n`;
    });
  }

  // Внутренние стены
  if (planData.walls && planData.walls.internal) {
    planData.walls.internal.forEach(wall => {
      const x1 = (wall.x1 / 100) * svgWidth;
      const y1 = (wall.y1 / 100) * svgHeight;
      const x2 = (wall.x2 / 100) * svgWidth;
      const y2 = (wall.y2 / 100) * svgHeight;
      const thickness = wall.thickness || Math.max(1, design.walls.thickness - 1);
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.walls.color}" stroke-width="${thickness}"/>\n`;
    });
  }

  // Окна
  if (planData.windows) {
    planData.windows.forEach(window => {
      const x1 = (window.x1 / 100) * svgWidth;
      const y1 = (window.y1 / 100) * svgHeight;
      const x2 = (window.x2 / 100) * svgWidth;
      const y2 = (window.y2 / 100) * svgHeight;
      const width = window.width || design.windows.thickness;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.windows.color}" stroke-width="${width}" stroke-dasharray="5,5"/>\n`;
      svg += `  <rect x="${x1-5}" y="${y1-5}" width="${x2-x1+10}" height="10" fill="none" stroke="${design.windows.frameColor}" stroke-width="${design.windows.frameThickness}"/>\n`;
    });
  }

  // Двери
  if (planData.doors) {
    planData.doors.forEach(door => {
      const x1 = (door.x1 / 100) * svgWidth;
      const y1 = (door.y1 / 100) * svgHeight;
      const x2 = (door.x2 / 100) * svgWidth;
      const y2 = (door.y2 / 100) * svgHeight;
      const width = door.width || design.doors.thickness;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.doors.color}" stroke-width="${width}"/>\n`;
      // Добавляем дугу двери
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      svg += `  <path d="M ${x1} ${y1} A 20 20 0 0 1 ${x2} ${y2}" fill="none" stroke="${design.doors.arcColor}" stroke-width="${design.doors.arcThickness}"/>\n`;
    });
  }

  // Мебель
  if (planData.furniture) {
    planData.furniture.forEach(item => {
      const furniture = furnitureData.furniture.find(f => f.name === item.name);
      if (furniture) {
        const x = (item.x / 100) * svgWidth;
        const y = (item.y / 100) * svgHeight;
        const width = (item.width / 100) * svgWidth;
        const height = (item.height / 100) * svgHeight;
        
        if (furniture.shape === 'rectangle') {
          svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${furniture.color}" stroke="#000" stroke-width="1" rx="3"/>\n`;
        } else if (furniture.shape === 'circle') {
          svg += `  <circle cx="${x + width/2}" cy="${y + height/2}" r="${Math.min(width, height)/2}" fill="${furniture.color}" stroke="#000" stroke-width="1"/>\n`;
        } else if (furniture.shape === 'oval') {
          svg += `  <ellipse cx="${x + width/2}" cy="${y + height/2}" rx="${width/2}" ry="${height/2}" fill="${furniture.color}" stroke="#000" stroke-width="1"/>\n`;
        }
        
        svg += `  <text x="${x + width/2}" y="${y + height/2 + 5}" text-anchor="middle" font-size="16">${furniture.icon}</text>\n`;
      }
    });
  }

  // Подписи комнат
  if (planData.rooms) {
    planData.rooms.forEach(room => {
      const x = (room.x / 100) * svgWidth + (room.width / 100) * svgWidth / 2;
      const y = (room.y / 100) * svgHeight + (room.height / 100) * svgHeight / 2;
      
      // Название комнаты
      svg += `  <text x="${x}" y="${y - 5}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${room.name}</text>\n`;
      
      // Площадь комнаты (если указана)
      if (room.area) {
        svg += `  <text x="${x}" y="${y + 15}" text-anchor="middle" font-size="12" fill="#666">${room.area} м²</text>\n`;
      }
    });
  }

  svg += '</svg>';
  return svg;
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
