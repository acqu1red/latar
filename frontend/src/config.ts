// Конфигурация API
// Жестко прописываем URL для production
export const API_BASE_URL = 'http://localhost:3001';

// Отладочная информация
console.log('🌐 API_BASE_URL установлен как:', API_BASE_URL);
console.log('🔧 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔧 MODE:', import.meta.env.MODE);
