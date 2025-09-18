#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// CORS конфигурация
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://acqu1red.github.io',
      'https://acqu1red.github.io/latar',
      'https://competitive-camellia-latar-a11ca532.koyeb.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    console.log('🌐 CORS Origin:', origin);
    
    // Разрешаем запросы без origin (например, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS разрешен для:', origin);
      return callback(null, true);
    } else {
      console.log('❌ CORS заблокирован для:', origin);
      return callback(new Error('CORS не разрешен для этого origin'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// Дополнительный middleware для принудительной установки CORS заголовков
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://acqu1red.github.io',
    'https://acqu1red.github.io/latar',
    'https://competitive-camellia-latar-a11ca532.koyeb.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  console.log('🔧 Дополнительный CORS middleware - Origin:', origin);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log('✅ Дополнительный CORS разрешен для:', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('⚠️ Дополнительный CORS с wildcard для:', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  next();
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  console.log('🏥 Health check запрос');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🧪 Тестовый сервер запущен на порту ${PORT}`);
  console.log('🌐 Тестируйте CORS на http://localhost:3001/healthz');
});
