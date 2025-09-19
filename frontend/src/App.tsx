import React, { useState } from 'react';
import './App.css';
import { API_BASE_URL } from './config.js';

// interface FurnitureItem {
//   name: string;
//   icon: string;
//   width: number;
//   height: number;
//   color: string;
// }

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);

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

      const response = await fetch(`${API_BASE_URL}/api/generate-photo`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const photoBlob = await response.blob();
        const photoUrl = URL.createObjectURL(photoBlob);
        setGeneratedPhoto(photoUrl);
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


  return (
    <div className="app">
      <div className="container">
        <h1>AI Генератор планов квартир</h1>
        <p className="app-description">
          Загрузите фотографию плана квартиры и получите профессионально нарисованный план с помощью ИИ
        </p>
        
        <div className="upload-section">
          <div className="upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="image-upload"
              className="file-input"
            />
            <label htmlFor="image-upload" className="upload-label">
              {imagePreview ? (
                <img src={imagePreview} alt="Предпросмотр" className="preview-image" />
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <p>Загрузите фотографию плана квартиры</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <h3>🎯 Что делает ИИ:</h3>
            <ul>
              <li>Анализирует ваш план квартиры</li>
              <li>Создает профессиональный архитектурный чертеж</li>
              <li>Размещает план строго по центру</li>
              <li>Сохраняет все детали и пропорции</li>
            </ul>
          </div>
        </div>

        <button 
          className="generate-btn" 
          onClick={handleGenerate}
          disabled={!selectedImage || isGenerating}
        >
          {isGenerating ? 'Генерация...' : 'Сгенерировать'}
        </button>

        {generatedPhoto && (
          <div className="result-section">
            <h2>Результат</h2>
            <div className="photo-info">
              <p>🎨 Профессионально нарисованный план квартиры</p>
              <p>📐 Точное воспроизведение всех деталей и пропорций</p>
              <p>🎯 План размещен строго по центру</p>
            </div>
            <div className="photo-container">
              <img 
                src={generatedPhoto} 
                alt="Сгенерированный план квартиры" 
                className="generated-photo"
              />
              <div className="photo-actions">
                <a 
                  href={generatedPhoto} 
                  download="floor-plan.png"
                  className="download-btn"
                >
                  💾 Скачать план
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
