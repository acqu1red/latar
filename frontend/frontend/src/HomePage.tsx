import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Глобальный фон с более сложной анимацией */}
      <div className="background-animation"></div>

      {/* Главная навигация */}
      <nav className="main-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏗️</span>
          <span className="brand-text">FlatMap AI</span>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/login')} className="nav-link">
            Войти
          </button>
          <button onClick={() => navigate('/register')} className="nav-link primary">
            Регистрация
          </button>
        </div>
      </nav>

      {/* Главная секция */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Превратите ваши идеи в
            <span className="gradient-text"> точные</span>
            <br />
            технические планы
          </h1>
          <p className="hero-subtitle">
            Передовая AI-технология создает детализированные архитектурные чертежи с уникальной точностью и космической скоростью.
          </p>
          <button className="hero-cta" onClick={handleAuthRedirect}>
            Начать создание планов
            <span className="cta-arrow">→</span>
          </button>
        </div>

        <div className="hero-visual">
          <div className="room-builder-3d">
            <div className="room-glow-effect"></div> {/* Голографическое свечение */}
            <div className="room-plane room-floor"></div>
            <div className="room-grid"></div> {/* Сетка на полу */}

            {/* Стены с анимацией появления */}
            <div className="room-plane room-wall room-wall-back"></div>
            <div className="room-plane room-wall room-wall-left"></div>
            <div className="room-plane room-wall room-wall-right"></div>
            <div className="room-plane room-wall room-wall-front"></div>

            {/* Детализированные линии построения */}
            <div className="room-detail-line line-h-1"></div>
            <div className="room-detail-line line-v-1"></div>

            {/* Мебель-плейсхолдеры */}
            <div className="room-furniture-placeholder furniture-bed"></div>
            <div className="room-furniture-placeholder furniture-table"></div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="main-footer">
        <div className="footer-content">
          <p>&copy; 2024 FlatMap AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;