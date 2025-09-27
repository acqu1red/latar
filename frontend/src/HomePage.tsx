import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* 3D Модель создания помещения */}
      <div className="room-creation-model">
        <div className="room-container">
          {/* Пол */}
          <div className="room-floor"></div>
          
          {/* Сетка пола */}
          <div className="room-grid">
            <div className="grid-line horizontal"></div>
            <div className="grid-line horizontal"></div>
            <div className="grid-line horizontal"></div>
            <div className="grid-line vertical"></div>
            <div className="grid-line vertical"></div>
            <div className="grid-line vertical"></div>
          </div>
          
          {/* Стены */}
          <div className="room-wall wall-back"></div>
          <div className="room-wall wall-left"></div>
          <div className="room-wall wall-right"></div>
          
          {/* Детали стен */}
          <div className="room-detail-line detail-1"></div>
          <div className="room-detail-line detail-2"></div>
          <div className="room-detail-line detail-3"></div>
          
          {/* Мебель (заглушки) */}
          <div className="room-furniture-placeholder furniture-1"></div>
          <div className="room-furniture-placeholder furniture-2"></div>
          <div className="room-furniture-placeholder furniture-3"></div>
        </div>
      </div>

      <div className="content">
        <div className="hero-section">
          <h1 className="hero-title">
            <span className="title-line">Создавайте</span>
            <span className="title-line">технические планы</span>
            <span className="title-line highlight">с помощью ИИ</span>
          </h1>
          
          <p className="hero-subtitle">
            Превратите ваши идеи в профессиональные технические планы за считанные минуты. 
            Наша ИИ-технология анализирует изображения и создает детальные планы помещений.
          </p>
          
          <div className="hero-buttons">
            <Link to="/register" className="cta-button primary">
              <span className="button-text">Начать создание</span>
              <span className="button-icon">✨</span>
            </Link>
            <Link to="/login" className="cta-button secondary">
              <span className="button-text">Войти в аккаунт</span>
              <span className="button-icon">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;