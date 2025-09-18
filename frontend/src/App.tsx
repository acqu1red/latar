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
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<'plan' | 'photo'>('plan');
  const [customPrompt, setCustomPrompt] = useState<string>('');

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

      let endpoint = '';
      if (generationType === 'plan') {
        endpoint = '/api/generate-plan';
      } else {
        endpoint = '/api/generate-photo';
        if (customPrompt.trim()) {
          formData.append('prompt', customPrompt.trim());
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        if (generationType === 'plan') {
          const svgContent = await response.text();
          setGeneratedSvg(svgContent);
          setGeneratedPhoto(null);
        } else {
          const photoBlob = await response.blob();
          const photoUrl = URL.createObjectURL(photoBlob);
          setGeneratedPhoto(photoUrl);
          setGeneratedSvg(null);
        }
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

  const downloadSvg = (svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Конвертер фотографий в SVG</h1>
        <p className="app-description">
          Загрузите фотографию плана квартиры и получите точную копию в формате SVG
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
                  onChange={(e) => setGenerationType(e.target.value as 'plan' | 'photo')}
                />
                <label htmlFor="plan-generation">План квартиры (SVG)</label>
              </div>
              <div className="option-item">
                <input 
                  type="radio" 
                  id="photo-generation" 
                  name="generation-type" 
                  value="photo"
                  checked={generationType === 'photo'}
                  onChange={(e) => setGenerationType(e.target.value as 'plan' | 'photo')}
                />
                <label htmlFor="photo-generation">Фотография (AI)</label>
              </div>
            </div>
          </div>

          {generationType === 'photo' && (
            <div className="prompt-section">
              <h3>Описание желаемого изображения (опционально):</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Например: a modern living room with large windows, comfortable furniture, and natural lighting"
                className="prompt-input"
                rows={3}
              />
              <p className="prompt-hint">
                Оставьте пустым для автоматической генерации описания на основе изображения
              </p>
            </div>
          )}
        </div>

        <button 
          className="generate-btn" 
          onClick={handleGenerate}
          disabled={!selectedImage || isGenerating}
        >
          {isGenerating ? 'Генерация...' : 'Сгенерировать'}
        </button>

        {(generatedSvg || generatedPhoto) && (
          <div className="result-section">
            <h2>Результат</h2>
            {generatedSvg && (
              <>
                <div className="svg-info">
                  <p>📐 Точная копия вашей фотографии в формате SVG</p>
                  <p>🔍 Все детали, линии и пиксели сохранены</p>
                </div>
                <div 
                  className="svg-container"
                  dangerouslySetInnerHTML={{ __html: generatedSvg }}
                />
                <div className="svg-actions">
                  <button 
                    className="download-btn"
                    onClick={() => downloadSvg(generatedSvg)}
                  >
                    💾 Скачать SVG
                  </button>
                </div>
              </>
            )}
            {generatedPhoto && (
              <div className="photo-container">
                <img 
                  src={generatedPhoto} 
                  alt="Сгенерированная фотография" 
                  className="generated-photo"
                />
                <div className="photo-actions">
                  <a 
                    href={generatedPhoto} 
                    download="generated-photo.png"
                    className="download-btn"
                  >
                    Скачать фотографию
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
