import sharp from 'sharp';
import fs from 'fs';
import { createSketchFromImage } from './scribbleDiffusionGenerator.mjs';

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
    
    // Генерируем специальный промпт для точного воспроизведения плана
    const prompt = generatePlanFocusedPrompt(imagePath);
    
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
 * Генерирует промпт специально для точного воспроизведения плана квартиры
 * @param {string} imagePath - Путь к изображению
 * @returns {string} Промпт для генерации
 */
function generatePlanFocusedPrompt(imagePath) {
  return `a professional architectural floor plan drawing, perfectly centered on a clean white background. The floor plan should be drawn exactly as shown in the reference image with precise proportions, room layouts, walls, doors, and windows. Use clean black lines on white background, architectural drawing style. The plan must be centered and clearly visible, maintaining all original details and measurements from the reference image.`;
}


