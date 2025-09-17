import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeImageWithGPT, convertImageToSvgDirect } from './gptVisionAnalyzer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSvgFromImage(imagePath, baseUrl = 'http://localhost:3001') {
  try {
    // Читаем данные мебели
    const furnitureData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'furniture.json'), 'utf8')
    );

    // Используем прямое конвертирование в SVG для точного копирования
    console.log('🎯 Используем прямое конвертирование в SVG для точного копирования фотографии');
    const svgContent = await convertImageToSvgDirect(imagePath, furnitureData, baseUrl);
    
    return svgContent;
  } catch (error) {
    console.error('Ошибка генерации SVG:', error);
    throw error;
  }
}

