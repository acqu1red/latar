#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Проверяем, существует ли уже .env файл
if (fs.existsSync(envPath)) {
  console.log('📁 Файл .env уже существует');
  process.exit(0);
}

// Создаем .env файл
const envContent = `# OpenAI API Configuration
# Получите API ключ на https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Замените 'your_openai_api_key_here' на ваш реальный API ключ OpenAI
# Пример: OPENAI_API_KEY=sk-proj-abc123def456...
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Файл .env создан успешно!');
  console.log('📝 Теперь отредактируйте файл .env и добавьте ваш OpenAI API ключ');
  console.log('🔗 Получите ключ на: https://platform.openai.com/api-keys');
} catch (error) {
  console.error('❌ Ошибка создания файла .env:', error.message);
  process.exit(1);
}
