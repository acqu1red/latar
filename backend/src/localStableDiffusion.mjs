import fs from 'fs';
import sharp from 'sharp';

/**
 * Локальная Stable Diffusion интеграция
 * Пока что заглушка для будущей интеграции
 */
export const localStableDiffusion = {
  /**
   * Проверяет доступность локальной Stable Diffusion
   * @returns {boolean} Доступна ли
   */
  get isAvailable() {
    // Пока что всегда false, так как локальная SD не настроена
    return false;
  },

  /**
   * Генерирует план с помощью локальной Stable Diffusion
   * @param {string} sketchPath - Путь к эскизу
   * @param {string} prompt - Промпт
   * @returns {Promise<Buffer>} Сгенерированное изображение
   */
  async generatePlan(sketchPath, prompt) {
    console.log('🚀 Локальная Stable Diffusion не настроена, используем fallback');
    throw new Error('Local Stable Diffusion not available');
  }
};