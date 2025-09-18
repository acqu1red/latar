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
  const [generationType, setGenerationType] = useState<'plan' | 'furniture'>('plan');

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

      const endpoint = generationType === 'furniture' 
        ? '/api/generate-with-furniture' 
        : '/api/generate-photo';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

        <div className="options-section">
          <div className="generation-type">
            <h3>Тип генерации:</h3>
            <div className="option-group">
              <div className="option-item">
                <input 
                  type="radio" 
                  id="plan-generation" 
                  name="generation-type" 
                  value="plan" 
                  checked={generationType === 'plan'}
                  onChange={(e) => setGenerationType(e.target.value as 'plan' | 'furniture')}
                />
                <label htmlFor="plan-generation">Простой план</label>
              </div>
              <div className="option-item">
                <input 
                  type="radio" 
                  id="furniture-generation" 
                  name="generation-type" 
                  value="furniture"
                  checked={generationType === 'furniture'}
                  onChange={(e) => setGenerationType(e.target.value as 'plan' | 'furniture')}
                />
                <label htmlFor="furniture-generation">С мебелью</label>
              </div>
            </div>
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
              {generationType === 'furniture' && (
                <>
                  <li>Определяет тип помещения (спальня, кухня, ванная)</li>
                  <li>Добавляет подходящую мебель в нужных местах</li>
                  <li>Создает реалистичный план с обстановкой</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <button 
          className="generate-btn" 
          onClick={handleGenerate}
          disabled={!selectedImage || isGenerating}
        >
          {isGenerating ? 'Генерация...' : (generationType === 'furniture' ? 'Сгенерировать с мебелью' : 'Сгенерировать план')}
        </button>

        {generatedPhoto && (
          <div className="result-section">
            <h2>Результат</h2>
            <div className="photo-info">
              <p>🎨 Профессионально нарисованный план квартиры</p>
              <p>📐 Точное воспроизведение всех деталей и пропорций</p>
              <p>🎯 План размещен строго по центру</p>
              {generationType === 'furniture' && (
                <p>🪑 Добавлена подходящая мебель в логичных местах</p>
              )}
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
