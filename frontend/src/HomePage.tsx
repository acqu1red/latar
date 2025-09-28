import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleTexSchemeRedirect = () => {
    navigate('/texscheme');
  };

  return (
    <div className="homepage">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="animated-grid"></div>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Основной контент */}
      <div className={`homepage-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Навигация */}
        <nav className="main-navbar">
          <div className="nav-brand">
            <span className="brand-icon">🏗️</span>
            <span className="brand-text">FlatMap AI</span>
          </div>
        </nav>

        {/* Герой-секция */}
        <main className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Превратите идеи</span>
              <span className="title-line highlight">в идеальные планы</span>
              <span className="title-line">с помощью ИИ</span>
            </h1>
            <p className="hero-description">
              Используйте передовую AI-технологию для мгновенного создания точных и детализированных архитектурных чертежей.
              От концепции до готового плана — всего за несколько секунд. Инновации, доступные каждому.
            </p>
            <div className="hero-cta">
              <button className="cta-button primary large" onClick={handleTexSchemeRedirect}>
                <span>AI по техническому плану</span>
                <span className="cta-icon">→</span>
              </button>
            </div>
          </div>
          
          {/* 3D элемент - Абстрактная архитектурная модель */}
          <div className="hero-visual" style={{
            transform: `perspective(2000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.03}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.015}deg)`
          }}>
            <div className="abstract-model">
              <div className="model-floor"></div>
              <div className="model-wall wall-1"></div>
              <div className="model-wall wall-2"></div>
              <div className="model-wall wall-3"></div>
              <div className="model-wall wall-4"></div>
              <div className="model-furniture furniture-1"></div>
              <div className="model-furniture furniture-2"></div>
            </div>
          </div>
        </main>

        {/* Футер */}
        <footer className="main-footer">
          <p>&copy; 2025 FlatMap AI. Все права защищены.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
