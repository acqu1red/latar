import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Удаляем import useNavigate
// import { useAuth } from './AuthContext'; // Импорт AuthContext
// import { supabase } from './supabaseClient'; // Импорт клиента Supabase
import './TexSchemePage.css';
import { API_BASE_URL } from './config';

const TexSchemePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  // const [planTitle, setPlanTitle] = useState(''); // Новое состояние для названия плана
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // const navigate = useNavigate(); // Удаляем объявление navigate
  // const { user, loading } = useAuth(); // Получаем пользователя и состояние загрузки из AuthContext

  useEffect(() => {
    // if (!loading && !user) {
    //   navigate('/login'); // Перенаправить на страницу входа, если не авторизован и загрузка завершена
    //   return;
    // }

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [/* user, loading, navigate */]); // Зависимости обновлены

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return; // Больше не проверяем пользователя

    setIsGenerating(true);
    setGeneratedPlan(null); // Сбрасываем предыдущий план

    try {
      // 1. Отправка изображения на бэкенд для генерации
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/generate-floor-plan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка генерации:', errorData.error);
        alert(`Ошибка: ${errorData.error}`);
        return;
      }

      const planBlob = await response.blob();
      const imageUrl = URL.createObjectURL(planBlob); // Создаем URL для Blob

      console.log('План успешно сгенерирован!', { imageUrl });
      setGeneratedPlan(imageUrl); // Отображаем сгенерированный план

    } catch (error) {
      console.error('Произошла общая ошибка при генерации:', error);
      alert('Произошла ошибка при генерации плана');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedPlan(null);
    // setPlanTitle(''); // Больше нет названия плана
  };

  // const goToDashboard = () => {
  //   navigate('/dashboard'); // Эта функция больше не нужна
  // };

  return (
    <div className="texscheme-page">
      {/* Современный анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Основной контент (3D-сцена) */}
      <div className={`texscheme-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="dashboard-3d-scene" style={{
          transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.03}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.015}deg)`
        }}>
          {/* Центральный анимированный шар */}
          <div className="scene-center-orb"></div>

          {/* Анимированные линии, соединяющие шар с панелями */}
          <div className="scene-line line-1"></div>
          <div className="scene-line line-2"></div>
          <div className="scene-line line-3"></div>

          {/* Основные панели - теперь для генерации плана */}
          <div className="dashboard-panel panel-left">
            <div className="panel-content">
              <h2 className="panel-title">Создание Технического Плана</h2>
              <p className="panel-description">Загрузите изображение и сгенерируйте точный архитектурный план.</p>

              {/* Секция загрузки */}
              <div className="upload-section">
                <div className="upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} alt="Предпросмотр" className="preview-image" />
                        <div className="preview-overlay">
                          <div className="overlay-content">
                            <div className="overlay-icon">🔄</div>
                            <span className="overlay-text">Нажмите для изменения</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">
                          <div className="icon-main">📷</div>
                          <div className="icon-particles">
                            <span className="particle">✨</span>
                            <span className="particle">⭐</span>
                            <span className="particle">💫</span>
                          </div>
                        </div>
                        <h3 className="upload-title">Загрузите план помещения</h3>
                        <p className="upload-description">
                          Перетащите изображение сюда или нажмите для выбора файла
                        </p>
                        <div className="upload-features">
                          <span className="feature-tag">JPG, PNG, WEBP</span>
                          <span className="feature-tag">До 10MB</span>
                          <span className="feature-tag">Высокое качество</span>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Кнопка генерации */}
              <div className="generate-section">
                <button
                  className={`generate-btn ${isGenerating ? 'generating' : ''}`}
                  onClick={handleGenerate}
                  disabled={!selectedImage || isGenerating}
                >
                  <div className="btn-content">
                    <span className="btn-icon">
                      {isGenerating ? '🎨' : '⚡'}
                    </span>
                    <span className="btn-text">
                      {isGenerating ? 'Генерация...' : 'Сгенерировать план'}
                    </span>
                  </div>
                  {isGenerating && (
                    <div className="loading-animation">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  )}
                  <div className="btn-glow"></div>
                  <div className="btn-ripple"></div>
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-panel panel-right">
            <div className="panel-content">
              <h2 className="panel-title">Результат Генерации</h2>
              <p className="panel-description">Здесь отобразится ваш готовый технический план.</p>

              {generatedPlan ? (
                <div className="result-display-card">
                  <img src={generatedPlan} alt="Сгенерированный план" className="generated-plan-image" />
                  <a href={generatedPlan} download="technical-plan.png" className="download-button-3d">
                    <span>Скачать План</span>
                    <span className="download-icon">↓</span>
                  </a>
                  <button onClick={resetApp} className="reset-button-3d">
                    <span>Новый План</span>
                    <span className="reset-icon">🔄</span>
                  </button>
                </div>
              ) : (
                <div className="no-plan-placeholder">
                  <span className="placeholder-icon">⏳</span>
                  <p>Ожидание генерации плана...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TexSchemePage;
