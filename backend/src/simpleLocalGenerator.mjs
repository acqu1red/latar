import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Простой локальный генератор для тестирования
 * Использует базовые алгоритмы обработки изображений
 */
export class SimpleLocalGenerator {
  
  /**
   * Генерирует улучшенную версию плана
   * @param {string} imagePath - Путь к исходному изображению
   * @param {string} prompt - Промпт (не используется в простой версии)
   * @returns {Promise<Buffer>} Обработанное изображение
   */
  async generatePlan(imagePath, prompt) {
    try {
      console.log('🎨 Простая локальная генерация плана');
      console.log('Изображение:', imagePath);
      
      // Читаем исходное изображение
      const imageBuffer = fs.readFileSync(imagePath);
      const metadata = await sharp(imageBuffer).metadata();
      
      // Создаем улучшенную версию плана
      const processedBuffer = await sharp(imageBuffer)
        .resize(512, 512, { 
          fit: 'inside',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .greyscale()
        .normalize()
        .sharpen({ sigma: 1.0, m1: 0.5, m2: 3.0, x1: 2, y2: 10 })
        .threshold(128)
        .png()
        .toBuffer();
      
      console.log('✅ Простая генерация завершена');
      return processedBuffer;
      
    } catch (error) {
      console.error('❌ Ошибка простой генерации:', error);
      throw error;
    }
  }
}

// Экспортируем единственный экземпляр
export const simpleLocalGenerator = new SimpleLocalGenerator();
