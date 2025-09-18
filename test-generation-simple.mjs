#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';
import sharp from 'sharp';

const API_BASE_URL = 'https://competitive-camellia-latar-a11ca532.koyeb.app';

async function testGenerationSimple() {
    console.log('🧪 Тестируем генерацию с простым изображением...');
    
    try {
        // Создаем простое тестовое изображение с помощью Sharp
        const testImagePath = '/tmp/test-simple.png';
        
        // Создаем простое изображение 200x200 с черными линиями на белом фоне
        await sharp({
            create: {
                width: 200,
                height: 200,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        })
        .composite([
            {
                input: Buffer.from(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/>
                        <line x1="20" y1="100" x2="180" y2="100" stroke="black" stroke-width="2"/>
                        <line x1="100" y1="20" x2="100" y2="180" stroke="black" stroke-width="2"/>
                    </svg>
                `),
                top: 0,
                left: 0
            }
        ])
        .png()
        .toFile(testImagePath);
        
        console.log('✅ Тестовое изображение создано');
        
        // Тест генерации
        console.log('\n🎨 Тестируем генерацию...');
        const formData = new FormData();
        const imageBuffer = fs.readFileSync(testImagePath);
        const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
        formData.append('image', imageBlob, 'test-simple.png');
        
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
            fs.writeFileSync('/tmp/generated-simple.png', buffer);
            console.log('✅ Результат сохранен в /tmp/generated-simple.png');
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

testGenerationSimple();
