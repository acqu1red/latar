import sharp from 'sharp';
import fs from 'fs';

/**
 * Создает улучшенный эскиз из изображения
 * @param {string} imagePath - Путь к исходному изображению
 * @returns {Promise<string>} Путь к созданному эскизу
 */
export async function createEnhancedSketch(imagePath) {
  try {
    console.log('✏️ Создаем улучшенный эскиз:', imagePath);
    
    const outputPath = imagePath.replace(/\.[^/.]+$/, '_enhanced_sketch.png');
    
    // Создаем эскиз с улучшенными параметрами
    await sharp(imagePath)
      .greyscale() // Конвертируем в черно-белое
      .normalize() // Нормализуем контраст
      .sharpen({ 
        sigma: 1.0, 
        m1: 0.5, 
        m2: 3.0, 
        x1: 2, 
        y2: 10 
      }) // Увеличиваем резкость
      .threshold(128) // Применяем пороговое значение для создания контуров
      .png()
      .toFile(outputPath);
    
    console.log('✅ Улучшенный эскиз создан:', outputPath);
    return outputPath;
    
  } catch (error) {
    console.error('❌ Ошибка создания улучшенного эскиза:', error);
    throw error;
  }
}