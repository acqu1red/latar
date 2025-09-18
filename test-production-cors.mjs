#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'https://competitive-camellia-latar-a11ca532.koyeb.app';

async function testProductionCORS() {
    console.log('🧪 Тестируем продакшн CORS...');
    
    try {
        // Тест 1: Health check
        console.log('\n1️⃣ Тестируем health check...');
        const healthResponse = await fetch(`${API_BASE_URL}/healthz`, {
            method: 'GET',
            headers: {
                'Origin': 'https://acqu1red.github.io',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('📥 Health check статус:', healthResponse.status);
        console.log('📥 CORS заголовки:');
        for (const [key, value] of healthResponse.headers.entries()) {
            if (key.toLowerCase().includes('access-control')) {
                console.log(`  - ${key}: ${value}`);
            }
        }
        
        if (healthResponse.ok) {
            const data = await healthResponse.json();
            console.log('✅ Health check успешен:', data);
        } else {
            console.log('❌ Health check неудачен');
        }
        
        // Тест 2: Preflight запрос
        console.log('\n2️⃣ Тестируем preflight запрос...');
        const preflightResponse = await fetch(`${API_BASE_URL}/api/generate-photo`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://acqu1red.github.io',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('📥 Preflight статус:', preflightResponse.status);
        console.log('📥 CORS заголовки:');
        for (const [key, value] of preflightResponse.headers.entries()) {
            if (key.toLowerCase().includes('access-control')) {
                console.log(`  - ${key}: ${value}`);
            }
        }
        
        if (preflightResponse.status === 200) {
            console.log('✅ Preflight запрос успешен');
        } else {
            console.log('❌ Preflight запрос неудачен');
        }
        
    } catch (error) {
        console.error('❌ Ошибка тестирования CORS:', error.message);
    }
}

testProductionCORS();
