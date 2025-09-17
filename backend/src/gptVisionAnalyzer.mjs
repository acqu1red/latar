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
      max_tokens: 2000
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

  return `Проанализируй это изображение плана квартиры и создай детальное описание для генерации SVG.

КРИТИЧЕСКИ ВАЖНО: 
- Найди на изображении именно план помещения (схему квартиры), а не фотографию комнаты
- Добавляй мебель ТОЛЬКО если она четко видна на плане
- НЕ придумывай мебель, которой нет на изображении
- Если мебель не видна или неясна - НЕ добавляй её

Анализируй:
1. Внешние стены (периметр квартиры)
2. Внутренние стены (разделяющие комнаты) 
3. Окна (их расположение и размеры)
4. Двери (между комнатами и входные)
5. Проемы (открытые проходы)
6. Комнаты (названия: гостиная, спальня, кухня, ванная, прихожая, коридор, балкон, лоджия)

Мебель - добавляй ТОЛЬКО если четко видна на плане:
${furnitureList}

Для каждой найденной мебели укажи:
- Название из списка (точно как в списке)
- Примерные координаты (x, y) в процентах
- Размеры (ширина, высота) в процентах

Ответь в формате JSON:
{
  "walls": {
    "external": [{"x1": 0, "y1": 0, "x2": 100, "y2": 0}],
    "internal": [{"x1": 50, "y1": 0, "x2": 50, "y2": 50}]
  },
  "windows": [{"x1": 10, "y1": 0, "x2": 30, "y2": 0}],
  "doors": [{"x1": 40, "y1": 0, "x2": 60, "y2": 0}],
  "rooms": [{"name": "гостиная", "x": 0, "y": 0, "width": 50, "height": 50}],
  "furniture": [{"name": "диван", "x": 20, "y": 20, "width": 30, "height": 15}]
}

Правила:
- Координаты в процентах от общего размера (0-100)
- Мебель добавляй ТОЛЬКО если она четко видна на плане
- Если сомневаешься - НЕ добавляй мебель
- Названия мебели должны точно совпадать со списком`;
}

function parseAnalysisAndGenerateSvg(analysis, furnitureData) {
  try {
    // Извлекаем JSON из ответа GPT
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Не найден JSON в ответе GPT');
    }
    
    const planData = JSON.parse(jsonMatch[0]);
    return generateSvgFromPlanData(planData, furnitureData);
    
  } catch (error) {
    console.error('Ошибка парсинга ответа GPT:', error);
    return createExampleSvg(furnitureData);
  }
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
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.walls.color}" stroke-width="${design.walls.thickness}"/>\n`;
    });
  }

  // Внутренние стены
  if (planData.walls && planData.walls.internal) {
    planData.walls.internal.forEach(wall => {
      const x1 = (wall.x1 / 100) * svgWidth;
      const y1 = (wall.y1 / 100) * svgHeight;
      const x2 = (wall.x2 / 100) * svgWidth;
      const y2 = (wall.y2 / 100) * svgHeight;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.walls.color}" stroke-width="${design.walls.thickness}"/>\n`;
    });
  }

  // Окна
  if (planData.windows) {
    planData.windows.forEach(window => {
      const x1 = (window.x1 / 100) * svgWidth;
      const y1 = (window.y1 / 100) * svgHeight;
      const x2 = (window.x2 / 100) * svgWidth;
      const y2 = (window.y2 / 100) * svgHeight;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.windows.color}" stroke-width="${design.windows.thickness}" stroke-dasharray="5,5"/>\n`;
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
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${design.doors.color}" stroke-width="${design.doors.thickness}"/>\n`;
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
      
      svg += `  <text x="${x}" y="${y}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${room.name}</text>\n`;
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
