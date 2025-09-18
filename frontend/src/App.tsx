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
  const [generationType, setGenerationType] = useState<'photo' | 'furniture'>('photo');

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
      if (generationType === 'furniture') {
        endpoint = '/api/generate-with-furniture';
      } else {
        endpoint = '/api/generate-photo';
      }

      console.log('📤 Отправляем запрос на:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Получен ответ:', response.status, response.statusText);
      console.log('📥 Content-Type:', response.headers.get('content-type'));

      if (response.ok) {
        console.log('✅ Ответ успешный, обрабатываем изображение...');
        const photoBlob = await response.blob();
        console.log('📷 Размер изображения:', photoBlob.size, 'байт');
        const photoUrl = URL.createObjectURL(photoBlob);
        setGeneratedPhoto(photoUrl);
        console.log('✅ Изображение установлено в состояние');
      } else {
        console.error('❌ Ошибка ответа:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('❌ Детали ошибки:', errorData);
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
        <h1>Генератор планов квартир с AI</h1>
        <p className="app-description">
          Загрузите фотографию плана квартиры и получите профессиональный план с помощью нейросети
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
                  id="photo-generation" 
                  name="generation-type" 
                  value="photo"
                  checked={generationType === 'photo'}
                  onChange={(e) => setGenerationType(e.target.value as 'photo' | 'furniture')}
                />
                <label htmlFor="photo-generation">Фотография (AI)</label>
              </div>
              <div className="option-item">
                <input 
                  type="radio" 
                  id="furniture-generation" 
                  name="generation-type" 
                  value="furniture"
                  checked={generationType === 'furniture'}
                  onChange={(e) => setGenerationType(e.target.value as 'photo' | 'furniture')}
                />
                <label htmlFor="furniture-generation">План с мебелью (AI)</label>
              </div>
            </div>
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
            <div className="photo-container">
              <img 
                src={generatedPhoto} 
                alt="Сгенерированный план" 
                className="generated-photo"
              />
              <div className="photo-actions">
                <a 
                  href={generatedPhoto} 
                  download="generated-plan.png"
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


