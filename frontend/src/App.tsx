import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { API_BASE_URL } from './config.js';

interface MouseInput {
  left: boolean;
  middle: boolean;
  right: boolean;
  x: number;
  y: number;
}

interface InteractiveState {
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  mousePosition: { x: number; y: number };
  clickCount: number;
}

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
  
  // Состояние для интерактивности
  const [mouseInput, setMouseInput] = useState<MouseInput>({
    left: false,
    middle: false,
    right: false,
    x: 0,
    y: 0
  });
  
  const [interactiveState, setInteractiveState] = useState<InteractiveState>({
    isDragging: false,
    dragStart: null,
    mousePosition: { x: 0, y: 0 },
    clickCount: 0
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Обработчики событий мыши
  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMouseInput(prev => ({
      ...prev,
      left: event.button === 0,
      middle: event.button === 1,
      right: event.button === 2,
      x,
      y
    }));

    if (event.button === 0) {
      setInteractiveState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x, y },
        clickCount: prev.clickCount + 1
      }));
    }
  };

  const handleMouseUp = () => {
    setMouseInput(prev => ({
      ...prev,
      left: false,
      middle: false,
      right: false
    }));

    setInteractiveState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null
    }));
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMouseInput(prev => ({ ...prev, x, y }));
    setInteractiveState(prev => ({ ...prev, mousePosition: { x, y } }));
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    // Дополнительная логика для правой кнопки мыши
  };

  // Эффект для отслеживания глобальных событий мыши
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setMouseInput(prev => ({
        ...prev,
        left: false,
        middle: false,
        right: false
      }));
      setInteractiveState(prev => ({
        ...prev,
        isDragging: false,
        dragStart: null
      }));
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
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
      <div 
        ref={containerRef}
        className={`container ${interactiveState.isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
      >
        <h1>AI Генератор планов квартир</h1>
        <p className="app-description">
          Загрузите фотографию плана квартиры и получите профессионально нарисованный план с помощью ИИ
        </p>
        
        {/* Индикатор мыши */}
        <div className="mouse-indicator">
          <div className="mouse-info">
            <span>🖱️ X: {Math.round(mouseInput.x)} Y: {Math.round(mouseInput.y)}</span>
            {mouseInput.left && <span className="mouse-button left">ЛКМ</span>}
            {mouseInput.middle && <span className="mouse-button middle">СКМ</span>}
            {mouseInput.right && <span className="mouse-button right">ПКМ</span>}
            {interactiveState.isDragging && <span className="drag-indicator">Перетаскивание</span>}
          </div>
          <div className="click-counter">
            Кликов: {interactiveState.clickCount}
          </div>
        </div>
        
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
