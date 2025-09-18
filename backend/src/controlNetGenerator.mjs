import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * ControlNet генератор для создания планов квартир с мебелью
 * Использует локальную модель ControlNet вместо внешних API
 */
export class ControlNetGenerator {
  constructor() {
    this.modelLoaded = false;
    this.pipeline = null;
    this.controlnet = null;
  }

  /**
   * Инициализирует ControlNet модель
   */
  async initialize() {
    try {
      console.log('🔄 Инициализация ControlNet...');
      
      // Проверяем наличие Python и необходимых библиотек
      await this.checkPythonEnvironment();
      
      // Загружаем модель ControlNet
      await this.loadControlNetModel();
      
      this.modelLoaded = true;
      console.log('✅ ControlNet успешно инициализирован');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации ControlNet:', error);
      throw error;
    }
  }

  /**
   * Проверяет наличие Python окружения
   */
  async checkPythonEnvironment() {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      // Проверяем виртуальное окружение ControlNet
      const venvPath = path.join(process.cwd(), 'controlnet_env', 'bin', 'python');
      
      if (fs.existsSync(venvPath)) {
        console.log('✅ Виртуальное окружение ControlNet найдено');
        this.pythonPath = venvPath;
      } else {
        // Проверяем системный Python
        await execAsync('python3 --version');
        console.log('✅ Python найден');
        this.pythonPath = 'python3';
      }
      
      // Проверяем наличие необходимых библиотек
      try {
        const pythonCmd = this.pythonPath || 'python3';
        await execAsync(`${pythonCmd} -c "import torch, diffusers, transformers"`);
        console.log('✅ Необходимые библиотеки установлены');
      } catch (libError) {
        console.log('⚠️ Устанавливаем необходимые библиотеки...');
        await this.installPythonDependencies();
      }
      
    } catch (error) {
      throw new Error('Python не найден. Установите Python 3.8+ для работы ControlNet');
    }
  }

  /**
   * Устанавливает Python зависимости
   */
  async installPythonDependencies() {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const dependencies = [
      'torch',
      'torchvision',
      'diffusers',
      'transformers',
      'accelerate',
      'controlnet-aux',
      'opencv-python',
      'Pillow',
      'numpy'
    ];

    for (const dep of dependencies) {
      try {
        console.log(`📦 Устанавливаем ${dep}...`);
        await execAsync(`pip install ${dep}`);
      } catch (error) {
        console.warn(`⚠️ Не удалось установить ${dep}:`, error.message);
      }
    }
  }

  /**
   * Загружает модель ControlNet
   */
  async loadControlNetModel() {
    try {
      // Создаем Python скрипт для загрузки модели
      const pythonScript = `
import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
from PIL import Image
import numpy as np
import json
import sys
import os

def load_controlnet():
    try:
        # Загружаем ControlNet для scribble
        controlnet = ControlNetModel.from_pretrained(
            "lllyasviel/sd-controlnet-scribble",
            torch_dtype=torch.float16
        )
        
        # Загружаем Stable Diffusion pipeline
        pipe = StableDiffusionControlNetPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            controlnet=controlnet,
            torch_dtype=torch.float16
        )
        
        # Оптимизируем для CPU/GPU
        if torch.cuda.is_available():
            pipe = pipe.to("cuda")
            print("GPU доступен")
        else:
            pipe = pipe.to("cpu")
            print("Используем CPU")
        
        # Сохраняем информацию о модели
        model_info = {
            "status": "loaded",
            "device": "cuda" if torch.cuda.is_available() else "cpu",
            "model": "lllyasviel/sd-controlnet-scribble"
        }
        
        with open("model_status.json", "w") as f:
            json.dump(model_info, f)
            
        print("Модель ControlNet загружена успешно")
        return True
        
    except Exception as e:
        error_info = {
            "status": "error",
            "error": str(e)
        }
        
        with open("model_status.json", "w") as f:
            json.dump(error_info, f)
            
        print(f"Ошибка загрузки модели: {e}")
        return False

if __name__ == "__main__":
    load_controlnet()
`;

      // Сохраняем Python скрипт
      const scriptPath = path.join(process.cwd(), 'load_controlnet.py');
      fs.writeFileSync(scriptPath, pythonScript);

      // Запускаем скрипт
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      console.log('🔄 Загружаем модель ControlNet...');
      const pythonCmd = this.pythonPath || 'python3';
      await execAsync(`${pythonCmd} ${scriptPath}`);

      // Проверяем результат
      const statusPath = path.join(process.cwd(), 'model_status.json');
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        if (status.status === 'error') {
          throw new Error(`Ошибка загрузки модели: ${status.error}`);
        }
      }

      // Удаляем временные файлы
      fs.unlinkSync(scriptPath);
      if (fs.existsSync(statusPath)) {
        fs.unlinkSync(statusPath);
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки ControlNet модели:', error);
      throw error;
    }
  }

  /**
   * Генерирует план квартиры с мебелью используя ControlNet
   * @param {string} imagePath - Путь к изображению плана
   * @param {string} prompt - Промпт для генерации
   * @returns {Promise<Buffer>} Сгенерированное изображение
   */
  async generatePlanWithFurniture(imagePath, prompt) {
    try {
      if (!this.modelLoaded) {
        await this.initialize();
      }

      console.log('🎨 Генерируем план с мебелью через ControlNet...');
      console.log('Изображение:', imagePath);
      console.log('Промпт:', prompt);

      // Создаем эскиз из изображения
      const sketchPath = await this.createSketchFromImage(imagePath);
      
      // Генерируем изображение через ControlNet
      const resultPath = await this.runControlNetGeneration(sketchPath, prompt);
      
      // Читаем результат
      const resultBuffer = fs.readFileSync(resultPath);
      
      // Очищаем временные файлы
      fs.unlinkSync(sketchPath);
      fs.unlinkSync(resultPath);
      
      console.log('✅ План с мебелью сгенерирован успешно');
      return resultBuffer;

    } catch (error) {
      console.error('❌ Ошибка генерации плана с мебелью:', error);
      throw error;
    }
  }

  /**
   * Создает эскиз из изображения для ControlNet
   * @param {string} imagePath - Путь к изображению
   * @returns {Promise<string>} Путь к эскизу
   */
  async createSketchFromImage(imagePath) {
    try {
      const outputPath = imagePath.replace(/\.[^/.]+$/, '_sketch.png');
      
      // Создаем эскиз используя Sharp
      await sharp(imagePath)
        .greyscale()
        .normalize()
        .sharpen({ sigma: 1.0, m1: 0.5, m2: 3.0, x1: 2, y2: 10 })
        .threshold(128)
        .png()
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Ошибка создания эскиза:', error);
      throw error;
    }
  }

  /**
   * Запускает генерацию через ControlNet
   * @param {string} sketchPath - Путь к эскизу
   * @param {string} prompt - Промпт
   * @returns {Promise<string>} Путь к результату
   */
  async runControlNetGeneration(sketchPath, prompt) {
    try {
      const pythonScript = `
import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
from PIL import Image
import sys
import os

def generate_image(sketch_path, prompt, output_path):
    try:
        # Загружаем модель
        controlnet = ControlNetModel.from_pretrained(
            "lllyasviel/sd-controlnet-scribble",
            torch_dtype=torch.float16
        )
        
        pipe = StableDiffusionControlNetPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            controlnet=controlnet,
            torch_dtype=torch.float16
        )
        
        if torch.cuda.is_available():
            pipe = pipe.to("cuda")
        else:
            pipe = pipe.to("cpu")
        
        # Загружаем эскиз
        image = Image.open(sketch_path)
        
        # Генерируем изображение
        result = pipe(
            prompt=prompt,
            image=image,
            num_inference_steps=20,
            guidance_scale=7.5,
            controlnet_conditioning_scale=1.0
        ).images[0]
        
        # Сохраняем результат
        result.save(output_path)
        print(f"Изображение сохранено: {output_path}")
        return True
        
    except Exception as e:
        print(f"Ошибка генерации: {e}")
        return False

if __name__ == "__main__":
    sketch_path = sys.argv[1]
    prompt = sys.argv[2]
    output_path = sys.argv[3]
    
    generate_image(sketch_path, prompt, output_path)
`;

      const scriptPath = path.join(process.cwd(), 'generate_controlnet.py');
      const outputPath = path.join(process.cwd(), `generated_${Date.now()}.png`);
      
      fs.writeFileSync(scriptPath, pythonScript);

      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const pythonCmd = this.pythonPath || 'python3';
      await execAsync(`${pythonCmd} ${scriptPath} "${sketchPath}" "${prompt}" "${outputPath}"`);

      // Удаляем временный скрипт
      fs.unlinkSync(scriptPath);

      return outputPath;

    } catch (error) {
      console.error('❌ Ошибка генерации через ControlNet:', error);
      throw error;
    }
  }

  /**
   * Генерирует промпт для плана с мебелью
   * @param {string} imagePath - Путь к изображению
   * @returns {string} Промпт
   */
  generateFurniturePrompt(imagePath) {
    return `a detailed architectural floor plan with furniture, perfectly centered on a clean white background. The floor plan should show room layouts with walls, doors, windows, and appropriate furniture placement. Professional architectural drawing style with black lines on white background. Include furniture like beds, sofas, tables, chairs, wardrobes, and other home items in logical positions. The plan must be centered and clearly visible.`;
  }
}

// Экспортируем экземпляр
export const controlNetGenerator = new ControlNetGenerator();
