import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeImageWithGPT } from './gptVisionAnalyzer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSvgFromImage(imagePath) {
  try {
    // Читаем данные мебели
    const furnitureData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'furniture.json'), 'utf8')
    );

    // Анализируем изображение с помощью GPT Vision
    const svgContent = await analyzeImageWithGPT(imagePath, furnitureData);
    
    return svgContent;
  } catch (error) {
    console.error('Ошибка генерации SVG:', error);
    throw error;
  }
}

