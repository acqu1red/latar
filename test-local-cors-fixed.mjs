#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// CORS конфигурация
app.use(cors({
  origin: [
    'https://acqu1red.github.io',
    'https://acqu1red.github.io/latar',
    'https://competitive-camellia-latar-a11ca532.koyeb.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  console.log('🏥 Health check запрос');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🧪 Тестовый сервер запущен на порту ${PORT}`);
  console.log('🌐 Тестируйте CORS на http://localhost:3001/healthz');
});
