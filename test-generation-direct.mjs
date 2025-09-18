#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE_URL = 'https://competitive-camellia-latar-a11ca532.koyeb.app';

async function testGenerationDirect() {
    console.log('🧪 Тестируем генерацию напрямую...');
    
    try {
        // Создаем простое тестовое изображение
        const testImagePath = '/tmp/test-image.png';
        
        // Создаем простое PNG изображение (1x1 пиксель)
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
            0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // compressed data
            0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, // more data
            0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
            0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        fs.writeFileSync(testImagePath, pngData);
        console.log('✅ Тестовое изображение создано');
        
        // Тест генерации
        console.log('\n🎨 Тестируем генерацию...');
        const formData = new FormData();
        const imageBuffer = fs.readFileSync(testImagePath);
        const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
        formData.append('image', imageBlob, 'test.png');
        
        const response = await fetch(`${API_BASE_URL}/api/generate-photo`, {
            method: 'POST',
            body: formData,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('📥 Статус ответа:', response.status);
        console.log('📥 Заголовки ответа:');
        for (const [key, value] of response.headers.entries()) {
            if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('content-type')) {
                console.log(`  - ${key}: ${value}`);
            }
        }
        
        if (response.ok) {
            const buffer = await response.buffer();
            console.log('✅ Генерация успешна! Размер:', buffer.length, 'байт');
            
            // Сохраняем результат
            fs.writeFileSync('/tmp/generated-image.png', buffer);
            console.log('✅ Результат сохранен в /tmp/generated-image.png');
        } else {
            const errorText = await response.text();
            console.log('❌ Ошибка генерации:', errorText);
        }
        
        // Удаляем тестовое изображение
        fs.unlinkSync(testImagePath);
        
    } catch (error) {
        console.error('❌ Ошибка тестирования генерации:', error.message);
    }
}

testGenerationDirect();
