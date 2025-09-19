import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Локальная генерация с помощью Stable Diffusion + ControlNet
 * Точное воспроизведение планов без творческих изменений
 */
export class LocalStableDiffusion {
  constructor() {
    this.webuiPath = path.join(__dirname, '..', '..', '..', 'stable-diffusion-webui');
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Проверяет доступность Stable Diffusion WebUI
   */
  checkAvailability() {
    try {
      return fs.existsSync(this.webuiPath) && 
             fs.existsSync(path.join(this.webuiPath, 'webui.py'));
    } catch (error) {
      console.error('Ошибка проверки Stable Diffusion:', error);
      return false;
    }
  }

  /**
   * Генерирует план с помощью локальной Stable Diffusion
   * @param {string} imagePath - Путь к исходному изображению
   * @param {string} prompt - Промпт для генерации
   * @returns {Promise<Buffer>} Сгенерированное изображение
   */
  async generatePlan(imagePath, prompt) {
    try {
      console.log('🎨 Запускаем локальную генерацию с Stable Diffusion');
      
      if (!this.isAvailable) {
        throw new Error('Stable Diffusion WebUI не установлен');
      }

      // Создаем эскиз для ControlNet
      const sketchPath = await this.createSketchForControlNet(imagePath);
      
      // Генерируем изображение через API WebUI
      const resultPath = await this.generateViaAPI(sketchPath, prompt);
      
      // Читаем результат
      const resultBuffer = fs.readFileSync(resultPath);
      
      // Очищаем временные файлы
      if (fs.existsSync(sketchPath)) {
        fs.unlinkSync(sketchPath);
      }
      if (fs.existsSync(resultPath)) {
        fs.unlinkSync(resultPath);
      }
      
      console.log('✅ Локальная генерация завершена');
      return resultBuffer;
      
    } catch (error) {
      console.error('❌ Ошибка локальной генерации:', error);
      throw error;
    }
  }

  /**
   * Создает эскиз для ControlNet
   * @param {string} imagePath - Путь к изображению
   * @returns {Promise<string>} Путь к эскизу
   */
  async createSketchForControlNet(imagePath) {
    const outputPath = imagePath.replace(/\.[^/.]+$/, '_controlnet_sketch.png');
    
    // Создаем эскиз с высокой контрастностью для ControlNet
    await sharp(imagePath)
      .greyscale()
      .normalize()
      .sharpen({ sigma: 1.0, m1: 0.5, m2: 3.0, x1: 2, y2: 10 })
      .threshold(128)
      .png()
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Генерирует изображение через API WebUI
   * @param {string} sketchPath - Путь к эскизу
   * @param {string} prompt - Промпт
   * @returns {Promise<string>} Путь к результату
   */
  async generateViaAPI(sketchPath, prompt) {
    // Запускаем WebUI если не запущен
    await this.ensureWebUIRunning();
    
    // Отправляем запрос к API
    const response = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, deformed, artistic, creative, colorful",
        steps: 20,
        cfg_scale: 7.5,
        width: 512,
        height: 512,
        sampler_name: "DPM++ 2M Karras",
        batch_size: 1,
        n_iter: 1,
        seed: -1,
        controlnet_units: [{
          input_image: this.imageToBase64(sketchPath),
          module: "scribble",
          model: "control_v11p_sd15_scribble [ca1f5f75]",
          weight: 1.0,
          resize_mode: 1,
          lowvram: false,
          processor_res: 512,
          threshold_a: 64,
          threshold_b: 64,
          guidance_start: 0.0,
          guidance_end: 1.0,
          pixel_perfect: true
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка API WebUI: ${response.status}`);
    }

    const result = await response.json();
    const imageData = result.images[0];
    
    // Сохраняем результат
    const outputPath = path.join(__dirname, '..', 'uploads', `generated_${Date.now()}.png`);
    const imageBuffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(outputPath, imageBuffer);
    
    return outputPath;
  }

  /**
   * Запускает WebUI если он не запущен
   */
  async ensureWebUIRunning() {
    try {
      // Проверяем, запущен ли WebUI
      const response = await fetch('http://127.0.0.1:7860/sdapi/v1/options', {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        console.log('✅ WebUI уже запущен');
        return;
      }
    } catch (error) {
      console.log('🔄 Запускаем WebUI...');
    }

    // Запускаем WebUI
    const { spawn } = await import('child_process');
    const webuiProcess = spawn('python', ['webui.py', '--api', '--listen'], {
      cwd: this.webuiPath,
      detached: true,
      stdio: 'ignore'
    });

    // Ждем запуска
    await this.waitForWebUI();
  }

  /**
   * Ждет запуска WebUI
   */
  async waitForWebUI() {
    const maxAttempts = 60; // 5 минут
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch('http://127.0.0.1:7860/sdapi/v1/options', {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          console.log('✅ WebUI запущен и готов');
          return;
        }
      } catch (error) {
        // Игнорируем ошибки подключения
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Не удалось запустить WebUI');
  }

  /**
   * Конвертирует изображение в base64
   * @param {string} imagePath - Путь к изображению
   * @returns {string} Base64 строка
   */
  imageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  }
}

// Экспортируем единственный экземпляр
export const localStableDiffusion = new LocalStableDiffusion();
