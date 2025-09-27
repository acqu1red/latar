import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { supabase } from './supabaseClient'; // Удаляем, так как используется AuthContext
import { API_BASE_URL } from './config';
import { useAuth } from './AuthContext'; // Импортируем useAuth
import './TexSchemePage.css';

const TexSchemePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Используем хук useAuth

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login'); // Если AuthContext загрузился и пользователь не авторизован, перенаправляем на логин
    }
  }, [isLoading, user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`${API_BASE_URL}/generate-plan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации плана');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при генерации плана');
    } finally {
      setIsGenerating(false);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading || !user) { // Показываем загрузку, пока AuthContext загружается или если нет пользователя
    return (
      <div className="texscheme-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="texscheme-page">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="dashboard-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏗️</span>
          <span className="brand-text">FlatMap AI</span>
        </div>
        <button onClick={goToDashboard} className="back-button">
          ← Назад в кабинет
        </button>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Генерация технического плана</h1>
          <p className="page-subtitle">
            Загрузите изображение помещения и получите профессиональный технический план
          </p>
        </div>

        <div className="upload-section">
          <div className="upload-area">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-upload" className="upload-label">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                {selectedFile ? selectedFile.name : 'Выберите изображение'}
              </div>
              <div className="upload-hint">Нажмите для выбора файла</div>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedFile || isGenerating}
            className="generate-button"
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner"></div>
                Генерация...
              </>
            ) : (
              <>
                <span className="button-icon">✨</span>
                Сгенерировать план
              </>
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {generatedImage && (
          <div className="result-section">
            <h2 className="result-title">Результат генерации</h2>
            <div className="result-image-container">
              <img
                src={generatedImage}
                alt="Сгенерированный технический план"
                className="result-image"
              />
            </div>
            <div className="result-actions">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = 'technical-plan.png';
                  link.click();
                }}
                className="download-button"
              >
                📥 Скачать план
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TexSchemePage;
