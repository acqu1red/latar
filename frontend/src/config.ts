// Конфигурация API
const getApiBaseUrl = () => {
  // Если указана переменная окружения, используем её
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Определяем URL в зависимости от окружения
  if (import.meta.env.PROD) {
    // Production: используем Timeweb URL
    return 'https://acqu1red-latar-4004.twc1.net';
  } else {
    // Development: используем localhost
    return 'http://localhost:3001';
  }
};

export const API_BASE_URL = getApiBaseUrl();
