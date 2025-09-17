import React, { useState } from 'react';
import './App.css';
import { API_BASE_URL } from './config';

interface FurnitureItem {
  name: string;
  icon: string;
  width: number;
  height: number;
  color: string;
}

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);

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

      const response = await fetch(`${API_BASE_URL}/api/generate-plan`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const svgContent = await response.text();
        setGeneratedSvg(svgContent);
      } else {
        console.error('Ошибка генерации плана');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Генератор планов квартир</h1>
        
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
          <div className="option-item">
            <input type="radio" id="no-furniture" name="furniture" value="no" defaultChecked />
            <label htmlFor="no-furniture">Без мебели</label>
          </div>
        </div>

        <button 
          className="generate-btn" 
          onClick={handleGenerate}
          disabled={!selectedImage || isGenerating}
        >
          {isGenerating ? 'Генерация...' : 'Сгенерировать'}
        </button>

        {generatedSvg && (
          <div className="result-section">
            <h2>Результат</h2>
            <div 
              className="svg-container"
              dangerouslySetInnerHTML={{ __html: generatedSvg }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
