import fetch from 'node-fetch';
import fs from 'fs';

/**
 * Модуль для работы с ScribbleDiffusion API
 */
export const scribbleDiffusionAPI = {
  /**
   * Проверяет доступность API
   * @returns {boolean} Доступен ли API
   */
  get isAvailable() {
    return !!process.env.SCRIBBLE_DIFFUSION_API_URL;
  },

  /**
   * Генерирует изображение через ScribbleDiffusion API
   * @param {string} sketchPath - Путь к эскизу
   * @param {string} prompt - Промпт
   * @returns {Promise<Buffer>} Сгенерированное изображение
   */
  async generateImage(sketchPath, prompt) {
    try {
      console.log('🎨 Генерируем через ScribbleDiffusion API');
      console.log('Эскиз:', sketchPath);
      console.log('Промпт:', prompt);

      if (!this.isAvailable) {
        throw new Error('ScribbleDiffusion API не настроен');
      }

      // Читаем эскиз
      const sketchBuffer = fs.readFileSync(sketchPath);
      const sketchBase64 = sketchBuffer.toString('base64');

      // Подготавливаем данные для API
      const requestData = {
        image: sketchBase64,
        prompt: prompt,
        // Дополнительные параметры можно добавить здесь
        num_inference_steps: 20,
        guidance_scale: 7.5
      };

      // Отправляем запрос к API
      const response = await fetch(process.env.SCRIBBLE_DIFFUSION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SCRIBBLE_DIFFUSION_API_KEY || ''}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ScribbleDiffusion API ошибка: ${response.status} - ${errorText}`);
      }

      // Получаем результат
      const result = await response.json();
      
      // Если API возвращает base64 изображение
      if (result.image) {
        const imageBuffer = Buffer.from(result.image, 'base64');
        console.log('✅ Изображение получено от ScribbleDiffusion API');
        return imageBuffer;
      }
      
      // Если API возвращает URL изображения
      if (result.url) {
        const imageResponse = await fetch(result.url);
        if (!imageResponse.ok) {
          throw new Error(`Ошибка загрузки изображения: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.buffer();
        console.log('✅ Изображение загружено от ScribbleDiffusion API');
        return imageBuffer;
      }

      throw new Error('Неожиданный формат ответа от ScribbleDiffusion API');

    } catch (error) {
      console.error('❌ Ошибка ScribbleDiffusion API:', error);
      throw error;
    }
  },

  /**
   * Проверяет статус API
   * @returns {Promise<Object>} Статус API
   */
  async checkStatus() {
    try {
      if (!this.isAvailable) {
        return { available: false, error: 'API URL не настроен' };
      }

      const response = await fetch(`${process.env.SCRIBBLE_DIFFUSION_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SCRIBBLE_DIFFUSION_API_KEY || ''}`
        }
      });

      if (response.ok) {
        return { available: true, status: 'healthy' };
      } else {
        return { available: false, error: `API недоступен: ${response.status}` };
      }
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
};
