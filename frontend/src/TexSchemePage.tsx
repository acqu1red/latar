import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TexSchemePage.css';
import { API_BASE_URL } from './config';

const TexSchemePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

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
    if (!selectedImage) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/generate-floor-plan`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const planBlob = await response.blob();
        const planUrl = URL.createObjectURL(planBlob);
        setGeneratedPlan(planUrl);
      } else {
        const errorData = await response.json();
        console.error('Ошибка генерации:', errorData.error);
        alert(`Ошибка: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedPlan(null);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="texscheme-page">
      {/* Современный анимированный фон */}
      <div className="background-animation">
        <div className="animated-grid"></div>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Основной контент */}
      <div className={`texscheme-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Навигация */}
        <nav className="main-navbar">
          <div className="nav-content">
            <button className="back-button" onClick={goHome}>
              <span className="back-icon">←</span>
              <span>На главную</span>
            </button>
            <div className="nav-title">
              <div className="title-icon">📐</div>
              <div className="title-text">
                <span className="title-main">AI Генератор</span>
                <span className="title-sub">Технических Планов</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Основной контент */}
        <div className="main-content">
          <div className="page-header">
            <div className="header-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">AI-Powered Generation</span>
            </div>
            
            <h1 className="page-title">
              <span className="title-highlight">AI Генерация</span>
              <span className="title-normal">технических планов</span>
            </h1>
            
            <p className="page-description">
              Загрузите фотографию технического плана помещения и получите профессиональную 
              архитектурную схему с точными пропорциями и деталями за считанные секунды
            </p>
          </div>

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
                    <div className="upload-icon">📷</div>
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

          {/* Результат */}
          {generatedPlan && (
            <div className="result-section">
              <div className="result-header">
                <div className="result-title">
                  <div className="title-icon">✅</div>
                  <div className="title-text">
                    <h2>Результат генерации</h2>
                    <p>Ваш технический план готов к скачиванию</p>
                  </div>
                </div>
                <div className="result-actions">
                  <button 
                    onClick={resetApp}
                    className="action-btn"
                  >
                    <span className="btn-icon">🔄</span>
                    <span>Новый план</span>
                  </button>
                </div>
              </div>

              <div className="result-content">
                <div className="plan-info">
                  <div className="info-card">
                    <div className="info-icon">🎯</div>
                    <div className="info-content">
                      <h4>Точность</h4>
                      <p>Сохранены все пропорции и размеры</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">🎨</div>
                    <div className="info-content">
                      <h4>Качество</h4>
                      <p>Профессиональный архитектурный стандарт</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">⚡</div>
                    <div className="info-content">
                      <h4>Скорость</h4>
                      <p>Результат за несколько секунд</p>
                    </div>
                  </div>
                </div>

                <div className="plan-container">
                  <div className="plan-wrapper">
                    <img 
                      src={generatedPlan} 
                      alt="Сгенерированный технический план" 
                      className="generated-plan"
                    />
                    <div className="plan-overlay">
                      <a 
                        href={generatedPlan} 
                        download="technical-plan.png"
                        className="download-btn"
                      >
                        <span className="btn-icon">💾</span>
                        <span>Скачать план</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TexSchemePage;
