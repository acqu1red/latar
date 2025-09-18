#!/usr/bin/env node

import express from 'express';

const app = express();
const PORT = 3001;

// Middleware для установки CORS заголовков во всех ответах
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://acqu1red.github.io',
    'https://acqu1red.github.io/latar',
    'https://competitive-camellia-latar-a11ca532.koyeb.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  console.log('🌐 CORS Middleware - Method:', req.method, 'URL:', req.url, 'Origin:', origin);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log('✅ CORS разрешен для:', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('⚠️ CORS с wildcard для:', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  console.log('🌐 CORS заголовки установлены:', {
    'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
    'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers')
  });
  
  next();
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  console.log('🏥 Health check запрос');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработка preflight запросов
app.options('*', (req, res) => {
  console.log('🔄 Preflight запрос:', req.method, req.url);
  console.log('🔄 Origin:', req.headers.origin);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🧪 Тестовый сервер запущен на порту ${PORT}`);
  console.log('🌐 Тестируйте CORS на http://localhost:3001/healthz');
});
