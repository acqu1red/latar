import { createEnhancedSketch, generateLocalImage } from './backend/src/localImageGenerator.mjs';
import { createSketchFromImage, generatePhotoFromSketch } from './backend/src/scribbleDiffusionGenerator.mjs';
import fs from 'fs';
import sharp from 'sharp';

/**
 * Тестирует локальную генерацию изображений
 */
async function testLocalGeneration() {
  try {
    console.log('🧪 Тестируем локальную генерацию изображений...');
    
    // Создаем тестовое изображение
    const testImagePath = await createTestImage();
    console.log('✅ Тестовое изображение создано:', testImagePath);
    
    // Создаем эскиз
    const sketchPath = await createSketchFromImage(testImagePath);
    console.log('✅ Эскиз создан:', sketchPath);
    
    // Тестируем разные промпты
    const prompts = [
      'a modern living room with large windows and natural lighting',
      'a beautiful sunset over the ocean',
      'a cozy forest cabin in the woods',
      'a minimalist bedroom with clean lines'
    ];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`\n🎨 Тестируем промпт ${i + 1}: "${prompt}"`);
      
      // Генерируем изображение
      const imageBuffer = await generateLocalImage(sketchPath, prompt);
      
      // Сохраняем результат
      const outputPath = `test-local-output-${i + 1}.png`;
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`✅ Результат сохранен: ${outputPath}`);
    }
    
    // Очищаем временные файлы
    fs.unlinkSync(testImagePath);
    fs.unlinkSync(sketchPath);
    
    console.log('\n🎉 Тест локальной генерации завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

/**
 * Создает простое тестовое изображение
 */
async function createTestImage() {
  const outputPath = 'test-image-local.png';
  
  // Создаем простое изображение с прямоугольником
  await sharp({
    create: {
      width: 400,
      height: 300,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="400" height="300">
          <rect x="50" y="50" width="300" height="200" 
                fill="none" stroke="black" stroke-width="3"/>
          <rect x="100" y="100" width="200" height="100" 
                fill="lightblue" stroke="black" stroke-width="2"/>
          <circle cx="200" cy="150" r="30" 
                  fill="yellow" stroke="black" stroke-width="2"/>
          <line x1="150" y1="120" x2="250" y2="180" 
                stroke="red" stroke-width="2"/>
        </svg>
      `),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toFile(outputPath);
  
  return outputPath;
}

// Запускаем тест
testLocalGeneration();
