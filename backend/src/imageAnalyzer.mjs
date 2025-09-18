import sharp from 'sharp';
import fs from 'fs';
import { createSketchFromImage, generatePromptFromImage } from './scribbleDiffusionGenerator.mjs';

/**
 * Анализирует изображение и создает эскиз для ScribbleDiffusion
 * @param {string} imagePath - Путь к изображению
 * @returns {Object} Данные для генерации фотографии
 */
export async function analyzeImageForPhoto(imagePath) {
  try {
    console.log('🔍 Анализируем изображение для генерации фотографии:', imagePath);
    
    // Создаем эскиз из изображения
    const sketchPath = await createSketchFromImage(imagePath);
    
    // Генерируем промпт на основе изображения
    const prompt = await generatePromptFromImage(imagePath);
    
    // Читаем метаданные изображения
    const imageBuffer = fs.readFileSync(imagePath);
    const metadata = await sharp(imageBuffer).metadata();
    
    return {
      sketchPath,
      prompt,
      metadata,
      originalImagePath: imagePath
    };
    
  } catch (error) {
    console.error('❌ Ошибка анализа изображения для фотографии:', error);
    throw error;
  }
}

/**
 * Анализирует изображение и извлекает контуры, цвета и детали для генерации SVG
 * @param {string} imagePath - Путь к изображению
 * @returns {Object} Данные для генерации SVG
 */
export async function analyzeImageForSvg(imagePath) {
  try {
    console.log('🔍 Анализируем изображение для генерации SVG:', imagePath);
    
    // Читаем изображение
    const imageBuffer = fs.readFileSync(imagePath);
    const metadata = await sharp(imageBuffer).metadata();
    
    console.log('Метаданные изображения:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels
    });
    
    // Создаем несколько версий изображения для анализа
    const analysisData = await Promise.all([
      // Оригинальное изображение
      sharp(imageBuffer).raw().toBuffer(),
      // Черно-белая версия для контуров
      sharp(imageBuffer).greyscale().raw().toBuffer(),
      // Упрощенная версия с меньшим количеством цветов
      sharp(imageBuffer).modulate({ brightness: 1.1, contrast: 1.2 }).raw().toBuffer(),
      // Версия с повышенной резкостью для лучшего выделения контуров
      sharp(imageBuffer).sharpen({ sigma: 1.0, m1: 0.5, m2: 3.0, x1: 2, y2: 10 }).raw().toBuffer()
    ]);
    
    const [originalData, greyscaleData, simplifiedData, sharpenedData] = analysisData;
    
    // Анализируем цвета
    const colorPalette = await extractColorPalette(originalData, metadata);
    console.log('Извлечено цветов:', colorPalette.length);
    
    // Извлекаем контуры
    const contours = await extractContours(greyscaleData, metadata);
    console.log('Найдено контуров:', contours.length);
    
    // Анализируем основные формы
    const shapes = await analyzeShapes(contours, metadata);
    console.log('Найдено форм:', shapes.length);
    
    // Извлекаем текстуры и паттерны
    const textures = await extractTextures(sharpenedData, metadata);
    console.log('Найдено текстур:', textures.length);
    
    return {
      metadata,
      colorPalette,
      contours,
      shapes,
      textures,
      originalData: originalData.toString('base64')
    };
    
  } catch (error) {
    console.error('❌ Ошибка анализа изображения:', error);
    throw error;
  }
}

/**
 * Извлекает цветовую палитру из изображения
 * @param {Buffer} imageData - Данные изображения
 * @param {Object} metadata - Метаданные изображения
 * @returns {Array} Массив цветов
 */
async function extractColorPalette(imageData, metadata) {
  const colors = new Map();
  const { width, height, channels } = metadata;
  
  // Анализируем каждый пиксель
  for (let i = 0; i < imageData.length; i += channels) {
    let r, g, b, a = 255;
    
    if (channels >= 3) {
      r = imageData[i];
      g = imageData[i + 1];
      b = imageData[i + 2];
    }
    
    if (channels >= 4) {
      a = imageData[i + 3];
    }
    
    // Квантуем цвета для уменьшения количества
    const quantizedR = Math.round(r / 32) * 32;
    const quantizedG = Math.round(g / 32) * 32;
    const quantizedB = Math.round(b / 32) * 32;
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
    const color = `rgb(${quantizedR},${quantizedG},${quantizedB})`;
    
    if (colors.has(colorKey)) {
      colors.set(colorKey, colors.get(colorKey) + 1);
    } else {
      colors.set(colorKey, 1);
    }
  }
  
  // Сортируем по частоте использования и возвращаем топ-20 цветов
  return Array.from(colors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return {
        color: `rgb(${r},${g},${b})`,
        frequency: count,
        percentage: (count / (width * height)) * 100
      };
    });
}

/**
 * Извлекает контуры из черно-белого изображения
 * @param {Buffer} imageData - Данные изображения в оттенках серого
 * @param {Object} metadata - Метаданные изображения
 * @returns {Array} Массив контуров
 */
async function extractContours(imageData, metadata) {
  const { width, height } = metadata;
  const contours = [];
  const visited = new Array(width * height).fill(false);
  
  // Простой алгоритм поиска контуров
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      
      if (!visited[index]) {
        const pixelValue = imageData[index];
        
        // Если пиксель достаточно темный, начинаем поиск контура
        if (pixelValue < 128) {
          const contour = traceContour(imageData, width, height, x, y, visited);
          if (contour.length > 10) { // Игнорируем очень маленькие контуры
            contours.push(contour);
          }
        }
      }
    }
  }
  
  return contours;
}

/**
 * Отслеживает контур начиная с заданной точки
 * @param {Buffer} imageData - Данные изображения
 * @param {number} width - Ширина изображения
 * @param {number} height - Высота изображения
 * @param {number} startX - Начальная X координата
 * @param {number} startY - Начальная Y координата
 * @param {Array} visited - Массив посещенных пикселей
 * @returns {Array} Массив точек контура
 */
function traceContour(imageData, width, height, startX, startY, visited) {
  const contour = [];
  const stack = [{ x: startX, y: startY }];
  
  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const index = y * width + x;
    
    if (x < 0 || x >= width || y < 0 || y >= height || visited[index]) {
      continue;
    }
    
    const pixelValue = imageData[index];
    if (pixelValue >= 128) {
      continue;
    }
    
    visited[index] = true;
    contour.push({ x, y });
    
    // Добавляем соседние пиксели в стек
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        stack.push({ x: x + dx, y: y + dy });
      }
    }
  }
  
  return contour;
}

/**
 * Анализирует формы на основе контуров
 * @param {Array} contours - Массив контуров
 * @param {Object} metadata - Метаданные изображения
 * @returns {Array} Массив форм
 */
async function analyzeShapes(contours, metadata) {
  const shapes = [];
  
  for (const contour of contours) {
    if (contour.length < 3) continue;
    
    // Вычисляем основные характеристики формы
    const bounds = calculateBounds(contour);
    const center = calculateCenter(contour);
    const area = calculateArea(contour);
    const perimeter = calculatePerimeter(contour);
    
    // Определяем тип формы
    const shapeType = classifyShape(contour, bounds, area, perimeter);
    
    // Упрощаем контур для SVG
    const simplifiedContour = simplifyContour(contour);
    
    shapes.push({
      type: shapeType,
      points: simplifiedContour,
      bounds,
      center,
      area,
      perimeter,
      fill: 'none',
      stroke: '#000',
      strokeWidth: 1
    });
  }
  
  return shapes;
}

/**
 * Вычисляет границы контура
 * @param {Array} contour - Массив точек контура
 * @returns {Object} Границы
 */
function calculateBounds(contour) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const point of contour) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Вычисляет центр контура
 * @param {Array} contour - Массив точек контура
 * @returns {Object} Центр
 */
function calculateCenter(contour) {
  const sumX = contour.reduce((sum, point) => sum + point.x, 0);
  const sumY = contour.reduce((sum, point) => sum + point.y, 0);
  
  return {
    x: sumX / contour.length,
    y: sumY / contour.length
  };
}

/**
 * Вычисляет площадь контура (приблизительно)
 * @param {Array} contour - Массив точек контура
 * @returns {number} Площадь
 */
function calculateArea(contour) {
  let area = 0;
  const n = contour.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += contour[i].x * contour[j].y;
    area -= contour[j].x * contour[i].y;
  }
  
  return Math.abs(area) / 2;
}

/**
 * Вычисляет периметр контура
 * @param {Array} contour - Массив точек контура
 * @returns {number} Периметр
 */
function calculatePerimeter(contour) {
  let perimeter = 0;
  const n = contour.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = contour[j].x - contour[i].x;
    const dy = contour[j].y - contour[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  
  return perimeter;
}

/**
 * Классифицирует тип формы
 * @param {Array} contour - Массив точек контура
 * @param {Object} bounds - Границы контура
 * @param {number} area - Площадь контура
 * @param {number} perimeter - Периметр контура
 * @returns {string} Тип формы
 */
function classifyShape(contour, bounds, area, perimeter) {
  const aspectRatio = bounds.width / bounds.height;
  const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
  const compactness = (perimeter * perimeter) / area;
  
  if (circularity > 0.8) {
    return 'circle';
  } else if (circularity > 0.6 && Math.abs(aspectRatio - 1) < 0.3) {
    return 'ellipse';
  } else if (Math.abs(aspectRatio - 1) < 0.2) {
    return 'square';
  } else if (aspectRatio > 2 || aspectRatio < 0.5) {
    return 'rectangle';
  } else if (contour.length < 10) {
    return 'polygon';
  } else if (contour.length < 5) {
    return 'line';
  } else if (compactness > 20) {
    return 'complex';
  } else {
    return 'path';
  }
}

/**
 * Упрощает контур, удаляя избыточные точки
 * @param {Array} contour - Исходный контур
 * @returns {Array} Упрощенный контур
 */
function simplifyContour(contour) {
  if (contour.length <= 3) return contour;
  
  const simplified = [contour[0]];
  const threshold = 2; // Минимальное расстояние между точками
  
  for (let i = 1; i < contour.length - 1; i++) {
    const prev = contour[i - 1];
    const curr = contour[i];
    const next = contour[i + 1];
    
    const dist1 = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );
    const dist2 = Math.sqrt(
      Math.pow(next.x - curr.x, 2) + Math.pow(next.y - curr.y, 2)
    );
    
    if (dist1 > threshold || dist2 > threshold) {
      simplified.push(curr);
    }
  }
  
  simplified.push(contour[contour.length - 1]);
  return simplified;
}

/**
 * Извлекает текстуры и паттерны
 * @param {Buffer} imageData - Данные изображения
 * @param {Object} metadata - Метаданные изображения
 * @returns {Array} Массив текстур
 */
async function extractTextures(imageData, metadata) {
  // Простая реализация - в будущем можно улучшить
  return [];
}
