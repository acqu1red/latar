// Простой тест API
const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  try {
    console.log('Тестируем подключение к API...');
    
    // Тест health check
    const healthResponse = await fetch(`${API_BASE_URL}/healthz`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Тест generate-technical-plan (без изображений)
    const formData = new FormData();
    formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg');
    formData.append('mode', 'withFurniture');
    
    const techPlanResponse = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
      method: 'POST',
      body: formData
    });
    
    console.log('✅ Technical plan endpoint status:', techPlanResponse.status);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testAPI();
