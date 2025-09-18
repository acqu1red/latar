/**
 * Тестирование локальной генерации ScribbleDiffusion
 * Запуск: node test-local-generation.mjs
 */

import { generateLocalScribbleDiffusion, checkLocalServices } from './backend/src/localScribbleDiffusion.mjs';
import { createEnhancedSketch } from './backend/src/localImageGenerator.mjs';
import fs from 'fs';
import path from 'path';

async function testLocalGeneration() {
  console.log('🧪 Тестирование локальной генерации ScribbleDiffusion\n');

  // Проверяем доступность сервисов
  console.log('1. Проверка доступности сервисов...');
  const services = await checkLocalServices();
  console.log('   Hugging Face:', services.huggingface ? '✅ Доступен' : '❌ Недоступен');
  console.log('   Ollama:', services.ollama ? '✅ Доступен' : '❌ Недоступен');
  console.log('   Улучшенная генерация:', services.enhanced ? '✅ Доступна' : '❌ Недоступна');
  console.log('');

  // Создаем тестовое изображение
  console.log('2. Создание тестового эскиза...');
  const testImagePath = await createTestImage();
  console.log('   Тестовое изображение создано:', testImagePath);
  console.log('');

  // Тестируем генерацию без мебели
  console.log('3. Тестирование генерации без мебели...');
  try {
    const planPrompt = "professional architectural floor plan, clean white background, black lines, perfectly centered layout, technical drawing style, precise measurements, no furniture, minimalist design, high contrast, detailed room layout, architectural blueprint, floor plan drawing, clean lines, professional CAD drawing style, exact replica of the uploaded plan, centered composition, symmetrical layout, perfectly centered on canvas, symmetrical composition, balanced layout, professional architectural standards, clean white background, high resolution, detailed technical drawing";
    
    const planResult = await generateLocalScribbleDiffusion(testImagePath, planPrompt);
    const planOutputPath = './test-plan-result.png';
    fs.writeFileSync(planOutputPath, planResult);
    console.log('   ✅ План без мебели сгенерирован:', planOutputPath);
  } catch (error) {
    console.log('   ❌ Ошибка генерации плана:', error.message);
  }
  console.log('');

  // Тестируем генерацию с мебелью
  console.log('4. Тестирование генерации с мебелью...');
  try {
    const furniturePrompt = "professional architectural floor plan with furniture, clean white background, black lines, perfectly centered layout, technical drawing style, precise measurements, schematic furniture symbols, high contrast, detailed room layout with furniture placement, architectural blueprint, floor plan drawing, clean lines, professional CAD drawing style, exact replica of the uploaded plan with added furniture, centered composition, furniture symbols in appropriate rooms, bed, sofa, table, chair, wardrobe, kitchen appliances, bathroom fixtures, living room furniture, bedroom furniture, dining room furniture, office furniture, hallway furniture, perfectly centered on canvas, symmetrical composition, balanced layout, professional architectural standards, clean white background, high resolution, detailed technical drawing";
    
    const furnitureResult = await generateLocalScribbleDiffusion(testImagePath, furniturePrompt);
    const furnitureOutputPath = './test-furniture-result.png';
    fs.writeFileSync(furnitureOutputPath, furnitureResult);
    console.log('   ✅ План с мебелью сгенерирован:', furnitureOutputPath);
  } catch (error) {
    console.log('   ❌ Ошибка генерации с мебелью:', error.message);
  }
  console.log('');

  // Очистка
  console.log('5. Очистка тестовых файлов...');
  try {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    console.log('   ✅ Тестовые файлы очищены');
  } catch (error) {
    console.log('   ⚠️ Ошибка очистки:', error.message);
  }

  console.log('\n🎉 Тестирование завершено!');
  console.log('📁 Результаты сохранены в:');
  console.log('   - test-plan-result.png (план без мебели)');
  console.log('   - test-furniture-result.png (план с мебелью)');
}

/**
 * Создает тестовое изображение плана
 * @returns {Promise<string>} Путь к тестовому изображению
 */
async function createTestImage() {
  const sharp = await import('sharp');
  
  // Создаем простое тестовое изображение плана
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="white" stroke="black" stroke-width="2"/>
      
      <!-- Внешние стены -->
      <rect x="20" y="20" width="360" height="260" fill="none" stroke="black" stroke-width="3"/>
      
      <!-- Внутренние стены -->
      <line x1="200" y1="20" x2="200" y2="280" stroke="black" stroke-width="2"/>
      <line x1="20" y1="150" x2="380" y2="150" stroke="black" stroke-width="2"/>
      
      <!-- Двери -->
      <line x1="200" y1="20" x2="200" y2="40" stroke="black" stroke-width="2"/>
      <line x1="200" y1="260" x2="200" y2="280" stroke="black" stroke-width="2"/>
      
      <!-- Окна -->
      <line x1="50" y1="20" x2="150" y2="20" stroke="black" stroke-width="1"/>
      <line x1="250" y1="20" x2="350" y2="20" stroke="black" stroke-width="1"/>
      
      <!-- Комнаты -->
      <text x="100" y="100" font-family="Arial" font-size="16" fill="black">Спальня</text>
      <text x="300" y="100" font-family="Arial" font-size="16" fill="black">Гостиная</text>
      <text x="100" y="200" font-family="Arial" font-size="16" fill="black">Кухня</text>
      <text x="300" y="200" font-family="Arial" font-size="16" fill="black">Ванная</text>
    </svg>
  `;
  
  const testImagePath = './test-plan.svg';
  fs.writeFileSync(testImagePath, svg);
  
  // Конвертируем SVG в PNG
  const pngPath = './test-plan.png';
  await sharp.default(Buffer.from(svg))
    .png()
    .toFile(pngPath);
  
  // Удаляем SVG
  fs.unlinkSync(testImagePath);
  
  return pngPath;
}

// Запускаем тест
testLocalGeneration().catch(console.error);