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
const envContent = `# Scribble Diffusion API Configuration
# Получите API ключ у вашего провайдера Scribble Diffusion
SCRIBBLE_DIFFUSION_API_KEY=YOUR_SCRIBBLE_DIFFUSION_API_KEY_HERE

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration (опционально)
# CORS_ORIGIN=https://your-frontend-domain.com

# Замените YOUR_SCRIBBLE_DIFFUSION_API_KEY_HERE на ваш реальный API ключ
# Пример: SCRIBBLE_DIFFUSION_API_KEY=sk-abc123def456...
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Файл .env создан успешно!');
  console.log('📝 Теперь отредактируйте файл .env и добавьте ваш Scribble Diffusion API ключ');
  console.log('🔗 Получите ключ у вашего провайдера Scribble Diffusion API');
} catch (error) {
  console.error('❌ Ошибка создания файла .env:', error.message);
  process.exit(1);
}
