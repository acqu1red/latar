/**
 * Тестирование API endpoints
 * Запуск: node test-api.mjs
 */

import fetch from 'node-fetch';
import fs from 'fs';
import sharp from 'sharp';
import FormData from 'form-data';

const API_BASE_URL = 'https://competitive-camellia-latar-a11ca532.koyeb.app';

async function testAPI() {
  console.log('🧪 Тестирование API endpoints\n');

  // 1. Проверяем health check
  console.log('1. Проверка health check...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/healthz`);
    const healthData = await healthResponse.json();
    console.log('   ✅ Health check:', healthData);
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
    return;
  }
  console.log('');

  // 2. Создаем тестовое изображение
  console.log('2. Создание тестового изображения...');
  const testImagePath = await createTestImage();
  console.log('   ✅ Тестовое изображение создано:', testImagePath);
  console.log('');

  // 3. Тестируем генерацию без мебели
  console.log('3. Тестирование генерации без мебели...');
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-plan.png',
      contentType: 'image/png'
    });

    const response = await fetch(`${API_BASE_URL}/api/generate-photo`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (response.ok) {
      const resultBuffer = await response.buffer();
      fs.writeFileSync('./test-api-result.png', resultBuffer);
      console.log('   ✅ Генерация без мебели успешна, размер:', resultBuffer.length, 'байт');
    } else {
      const errorData = await response.json();
      console.log('   ❌ Ошибка генерации:', errorData);
    }
  } catch (error) {
    console.log('   ❌ Ошибка запроса:', error.message);
  }
  console.log('');

  // 4. Тестируем генерацию с мебелью
  console.log('4. Тестирование генерации с мебелью...');
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-plan.png',
      contentType: 'image/png'
    });

    const response = await fetch(`${API_BASE_URL}/api/generate-with-furniture`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (response.ok) {
      const resultBuffer = await response.buffer();
      fs.writeFileSync('./test-api-furniture-result.png', resultBuffer);
      console.log('   ✅ Генерация с мебелью успешна, размер:', resultBuffer.length, 'байт');
    } else {
      const errorData = await response.json();
      console.log('   ❌ Ошибка генерации:', errorData);
    }
  } catch (error) {
    console.log('   ❌ Ошибка запроса:', error.message);
  }
  console.log('');

  // 5. Очистка
  console.log('5. Очистка...');
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
  console.log('   - test-api-result.png (план без мебели)');
  console.log('   - test-api-furniture-result.png (план с мебелью)');
}

/**
 * Создает тестовое изображение
 * @returns {Promise<string>} Путь к тестовому изображению
 */
async function createTestImage() {
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
  
  const testImagePath = './test-api-plan.png';
  await sharp(Buffer.from(svg))
    .png()
    .toFile(testImagePath);
  
  return testImagePath;
}

// Запускаем тест
testAPI().catch(console.error);
