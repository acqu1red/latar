import sharp from 'sharp';
import fs from 'fs';

/**
 * Простая локальная генерация изображений
 * Использует базовые алгоритмы обработки изображений
 */
export const simpleLocalGenerator = {
  /**
   * Генерирует план/изображение на основе эскиза
   * @param {string} sketchPath - Путь к эскизу
   * @param {string} prompt - Промпт
   * @returns {Promise<Buffer>} Сгенерированное изображение
   */
  async generatePlan(sketchPath, prompt) {
    try {
      console.log('🎨 Простая локальная генерация:', sketchPath);
      console.log('Промпт:', prompt);

      // Читаем эскиз
      const sketchBuffer = fs.readFileSync(sketchPath);
      const sketchImage = sharp(sketchBuffer);
      const metadata = await sketchImage.metadata();

      // Создаем улучшенное изображение
      const result = await this.createEnhancedImage(sketchImage, metadata, prompt);
      
      console.log('✅ Простое изображение сгенерировано');
      return result;

    } catch (error) {
      console.error('❌ Ошибка простой генерации:', error);
      throw error;
    }
  },

  /**
   * Создает улучшенное изображение на основе эскиза
   * @param {Object} sketchImage - Sharp объект эскиза
   * @param {Object} metadata - Метаданные
   * @param {string} prompt - Промпт
   * @returns {Promise<Buffer>} Результат
   */
  async createEnhancedImage(sketchImage, metadata, prompt) {
    const { width, height } = metadata;
    
    // Определяем стиль на основе промпта
    const style = this.analyzePrompt(prompt);
    
    // Создаем базовое изображение
    const baseImage = await this.createBaseImage(width, height, style);
    
    // Применяем эскиз
    const result = await this.applySketch(baseImage, sketchImage, style);
    
    return result;
  },

  /**
   * Анализирует промпт и определяет стиль
   * @param {string} prompt - Промпт
   * @returns {Object} Стиль
   */
  analyzePrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('план') || lowerPrompt.includes('схема') || lowerPrompt.includes('чертеж')) {
      return {
        type: 'plan',
        colors: {
          background: '#FFFFFF',
          lines: '#000000',
          accent: '#4169E1',
          highlight: '#FFD700'
        },
        effects: ['clean', 'precise', 'technical']
      };
    } else if (lowerPrompt.includes('фото') || lowerPrompt.includes('изображение')) {
      return {
        type: 'photo',
        colors: {
          background: '#F8F8FF',
          lines: '#2C2C2C',
          accent: '#FF6B35',
          highlight: '#87CEEB'
        },
        effects: ['natural', 'realistic', 'detailed']
      };
    } else {
      return {
        type: 'artistic',
        colors: {
          background: '#FFF8DC',
          lines: '#8B4513',
          accent: '#D2691E',
          highlight: '#F4A460'
        },
        effects: ['artistic', 'creative', 'stylized']
      };
    }
  },

  /**
   * Создает базовое изображение
   * @param {number} width - Ширина
   * @param {number} height - Высота
   * @param {Object} style - Стиль
   * @returns {Promise<Buffer>} Базовое изображение
   */
  async createBaseImage(width, height, style) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${style.colors.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${style.colors.accent};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
      </svg>
    `;
    
    return await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
  },

  /**
   * Применяет эскиз к базовому изображению
   * @param {Buffer} baseImage - Базовое изображение
   * @param {Object} sketchImage - Эскиз
   * @param {Object} style - Стиль
   * @returns {Promise<Buffer>} Результат
   */
  async applySketch(baseImage, sketchImage, style) {
    // Создаем цветную версию эскиза
    const coloredSketch = await sketchImage
      .greyscale()
      .normalize()
      .png()
      .toBuffer();
    
    // Применяем стиль
    const result = await sharp(baseImage)
      .composite([
        {
          input: coloredSketch,
          blend: 'multiply',
          opacity: 0.8
        }
      ])
      .png()
      .toBuffer();
    
    return result;
  }
};