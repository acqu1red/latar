import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

/**
 * Конвертирует изображение в SVG с встроенным base64 изображением
 * Сохраняет все детали исходной фотографии
 * @param {string} imagePath - Путь к исходному изображению
 * @returns {string} SVG контент с встроенным изображением
 */
export async function convertImageToSvg(imagePath) {
  try {
    console.log('🖼️ Конвертируем изображение в SVG:', imagePath);
    
    // Читаем исходное изображение
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('Размер исходного изображения:', imageBuffer.length, 'байт');
    
    // Получаем метаданные изображения
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Метаданные изображения:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels
    });
    
    // Конвертируем изображение в base64
    const base64Image = imageBuffer.toString('base64');
    console.log('Base64 длина:', base64Image.length);
    
    // Определяем MIME тип
    const mimeType = getMimeType(metadata.format);
    console.log('MIME тип:', mimeType);
    
    // Создаем SVG с встроенным изображением
    const svgContent = createSvgWithEmbeddedImage(
      base64Image, 
      mimeType, 
      metadata.width, 
      metadata.height
    );
    
    console.log('✅ SVG создан успешно, размер:', svgContent.length, 'символов');
    return svgContent;
    
  } catch (error) {
    console.error('❌ Ошибка конвертации изображения в SVG:', error);
    throw error;
  }
}

/**
 * Создает SVG с встроенным изображением
 * @param {string} base64Data - Base64 данные изображения
 * @param {string} mimeType - MIME тип изображения
 * @param {number} width - Ширина изображения
 * @param {number} height - Высота изображения
 * @returns {string} SVG контент
 */
function createSvgWithEmbeddedImage(base64Data, mimeType, width, height) {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <image id="originalImage" 
           x="0" y="0" 
           width="${width}" height="${height}" 
           xlink:href="${dataUrl}"/>
  </defs>
  
  <!-- Встроенное изображение - точная копия оригинала -->
  <use xlink:href="#originalImage"/>
  
  <!-- Дополнительный слой для возможных векторных элементов -->
  <g id="vectorLayer" opacity="0">
    <!-- Здесь можно добавить векторные элементы поверх изображения -->
  </g>
</svg>`;
}

/**
 * Определяет MIME тип по формату изображения
 * @param {string} format - Формат изображения от Sharp
 * @returns {string} MIME тип
 */
function getMimeType(format) {
  const mimeTypes = {
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'tiff': 'image/tiff',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml'
  };
  
  return mimeTypes[format] || 'image/jpeg';
}

/**
 * Создает оптимизированный SVG с возможностью масштабирования
 * @param {string} base64Data - Base64 данные изображения
 * @param {string} mimeType - MIME тип изображения
 * @param {number} width - Ширина изображения
 * @param {number} height - Высота изображения
 * @param {Object} options - Опции оптимизации
 * @returns {string} Оптимизированный SVG контент
 */
export function createOptimizedSvg(base64Data, mimeType, width, height, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    preserveAspectRatio = true,
    addGrid = false,
    addMeasurements = false
  } = options;
  
  // Вычисляем масштаб для оптимизации размера
  let scaleX = 1;
  let scaleY = 1;
  let viewBoxWidth = width;
  let viewBoxHeight = height;
  
  if (preserveAspectRatio) {
    const scale = Math.min(maxWidth / width, maxHeight / height);
    scaleX = scaleY = scale;
    viewBoxWidth = width * scale;
    viewBoxHeight = height * scale;
  } else {
    scaleX = maxWidth / width;
    scaleY = maxHeight / height;
    viewBoxWidth = maxWidth;
    viewBoxHeight = maxHeight;
  }
  
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${viewBoxWidth}" height="${viewBoxHeight}" 
     viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <image id="originalImage" 
           x="0" y="0" 
           width="${width}" height="${height}" 
           xlink:href="${dataUrl}"/>
  </defs>
  
  <!-- Встроенное изображение - точная копия оригинала -->
  <use xlink:href="#originalImage"/>`;
  
  // Добавляем сетку если нужно
  if (addGrid) {
    svgContent += `
  
  <!-- Сетка для масштабирования -->
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ccc" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.1"/>`;
  }
  
  // Добавляем измерения если нужно
  if (addMeasurements) {
    svgContent += `
  
  <!-- Измерения -->
  <g id="measurements" font-family="Arial, sans-serif" font-size="12" fill="#333">
    <text x="10" y="20">${width}px × ${height}px</text>
    <text x="10" y="35">Масштаб: ${(scaleX * 100).toFixed(1)}%</text>
  </g>`;
  }
  
  svgContent += `
</svg>`;
  
  return svgContent;
}
