import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createTestImage() {
  try {
    console.log('🖼️ Создаем тестовое изображение...');
    
    // Создаем простое изображение с текстом
    const testImageBuffer = await sharp({
      create: {
        width: 600,
        height: 400,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .png()
    .composite([
      {
        input: Buffer.from(`
          <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="50" width="500" height="300" fill="none" stroke="#000" stroke-width="2"/>
            <line x1="300" y1="50" x2="300" y2="200" stroke="#000" stroke-width="2"/>
            <line x1="50" y1="200" x2="300" y2="200" stroke="#000" stroke-width="2"/>
            <text x="150" y="100" font-family="Arial" font-size="16" fill="#000">Гостиная</text>
            <text x="400" y="100" font-family="Arial" font-size="16" fill="#000">Спальня</text>
            <text x="300" y="30" font-family="Arial" font-size="14" fill="#666">Тестовый план квартиры</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .toBuffer();
    
    const testImagePath = path.join(__dirname, 'test-plan.png');
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log('✅ Тестовое изображение создано:', testImagePath);
    
    return testImagePath;
    
  } catch (error) {
    console.error('❌ Ошибка создания тестового изображения:', error);
    throw error;
  }
}

createTestImage();
