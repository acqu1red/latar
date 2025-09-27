import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Импорт AuthContext
import { supabase } from './supabaseClient'; // Импорт клиента Supabase
import './TexSchemePage.css';
import { API_BASE_URL } from './config';

const TexSchemePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState(''); // Новое состояние для названия плана
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Получаем пользователя и состояние загрузки из AuthContext

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login'); // Перенаправить на страницу входа, если не авторизован и загрузка завершена
      return;
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [user, loading, navigate]);

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
    if (!selectedImage || !user) return; // Проверяем наличие пользователя

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
      const uniqueFileName = `${user.id}/${Date.now()}-${selectedImage.name}`;

      // 2. Загрузка сгенерированного плана в Supabase Storage
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('plans') // Имя вашего бакета в Supabase Storage
        .upload(uniqueFileName, planBlob, { // Используем уникальное имя файла
          contentType: planBlob.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Ошибка загрузки плана в Supabase Storage:', uploadError);
        alert(`Ошибка загрузки: ${uploadError.message}`);
        return;
      }

      // Получаем публичный URL загруженного изображения
      const { data: publicUrlData } = supabase.storage
        .from('plans')
        .getPublicUrl(uniqueFileName);
      
      const publicImageUrl = publicUrlData.publicUrl;

      // 3. Сохранение информации о плане в базе данных Supabase (таблица 'plans')
      const finalPlanTitle = planTitle.trim() || `План от ${new Date().toLocaleString()}`;

      const { error: dbError } = await supabase
        .from('plans')
        .insert([
          {
            user_id: user.id,
            title: finalPlanTitle,
            image_url: publicImageUrl,
          },
        ]);

      if (dbError) {
        console.error('Ошибка сохранения плана в БД Supabase:', dbError);
        alert(`Ошибка сохранения: ${dbError.message}`);
        return;
      }

      console.log('План успешно сгенерирован и сохранен!', { publicImageUrl, finalPlanTitle });
      setGeneratedPlan(publicImageUrl); // Отображаем сгенерированный план
      setPlanTitle(''); // Очищаем поле названия плана

    } catch (error) {
      console.error('Произошла общая ошибка при генерации или сохранении:', error);
      alert('Произошла ошибка при генерации или сохранении плана');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedPlan(null);
    setPlanTitle(''); // Сбрасываем название плана
  };

  const goToDashboard = () => {
    navigate('/dashboard'); // Перенаправляем на личный кабинет
  };

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

      {/* Основной контент */}
      <div className={`texscheme-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Навигация */}
        <nav className="dashboard-navbar">
          <div className="nav-content">
            <button className="back-button" onClick={goToDashboard}>
              <span className="back-icon">←</span>
              <span>В личный кабинет</span>
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
          <div className="container">
            {/* Заголовок страницы */}
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

            {/* Поле для ввода названия плана */}
            <div className="input-group upload-title-input">
              <label htmlFor="planTitle">Название вашего плана (опционально)</label>
              <input
                type="text"
                id="planTitle"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Мой новый архитектурный план"
                className="plan-title-input"
              />
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
                      className="action-btn secondary"
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
    </div>
  );
};

export default TexSchemePage;
