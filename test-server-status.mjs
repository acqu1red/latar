#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'https://competitive-camellia-latar-a11ca532.koyeb.app';

async function testServerStatus() {
    console.log('🧪 Проверяем статус сервера...');
    
    try {
        // Тест 1: Health check
        console.log('\n1️⃣ Тестируем health check...');
        const healthResponse = await fetch(`${API_BASE_URL}/healthz`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('📥 Health check статус:', healthResponse.status);
        console.log('📥 Все заголовки ответа:');
        for (const [key, value] of healthResponse.headers.entries()) {
            console.log(`  - ${key}: ${value}`);
        }
        
        if (healthResponse.ok) {
            const data = await healthResponse.json();
            console.log('✅ Health check успешен:', data);
        } else {
            console.log('❌ Health check неудачен');
        }
        
        // Тест 2: Проверяем, есть ли CORS заголовки
        console.log('\n2️⃣ Проверяем CORS заголовки...');
        const corsResponse = await fetch(`${API_BASE_URL}/healthz`, {
            method: 'GET',
            headers: {
                'Origin': 'https://acqu1red.github.io',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('📥 CORS тест статус:', corsResponse.status);
        console.log('📥 CORS заголовки:');
        for (const [key, value] of corsResponse.headers.entries()) {
            if (key.toLowerCase().includes('access-control')) {
                console.log(`  - ${key}: ${value}`);
            }
        }
        
        if (corsResponse.headers.get('access-control-allow-origin')) {
            console.log('✅ CORS заголовки присутствуют');
        } else {
            console.log('❌ CORS заголовки отсутствуют');
        }
        
    } catch (error) {
        console.error('❌ Ошибка тестирования сервера:', error.message);
    }
}

testServerStatus();
