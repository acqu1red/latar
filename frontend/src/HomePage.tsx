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
      {/* Анимированный фон */}
      <div className="background-animation">
        {/* <div className="gradient-orb"></div> */}
        {/* <div className="floating-shapes"> */}
          {/* <div className="shape shape-1"></div> */}
          {/* <div className="shape shape-2"></div> */}
          {/* <div className="shape shape-3"></div> */}
          {/* <div className="shape shape-4"></div> */}
        {/* </div> */}
      </div>

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
            <span className="gradient-text"> профессиональные</span>
            <br />
            технические планы помещений
          </h1>
          <p className="hero-subtitle">
            Передовая AI-технология создает точные, детализированные архитектурные чертежи с безупречным качеством за считанные секунды.
          </p>
          <button className="hero-cta" onClick={handleAuthRedirect}>
            Начать создание планов
            <span className="cta-arrow">→</span>
          </button>
        </div>

        <div className="hero-visual">
          <div className="galactic-builder-3d">
            <div className="galaxy-plane galaxy-base"></div>
            <div className="galaxy-plane galaxy-shard shard-1"></div>
            <div className="galaxy-plane galaxy-shard shard-2"></div>
            <div className="galaxy-plane galaxy-shard shard-3"></div>
            <div className="galaxy-plane galaxy-shard shard-4"></div>
            <div className="galaxy-beam beam-1"></div>
            <div className="galaxy-beam beam-2"></div>
            <div className="galaxy-beam beam-3"></div>
            <div className="galactic-object object-sphere-1"></div>
            <div className="galactic-object object-sphere-2"></div>
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