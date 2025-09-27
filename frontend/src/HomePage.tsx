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

  const handleStartPlan = () => {
    navigate('/texscheme');
  };

  return (
    <div className="homepage">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
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
          <div className="nav-actions">
            {/* Кнопки Войти/Регистрация удалены */}
          </div>
        </nav>

        {/* Герой-секция */}
        <main className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Ваш ПРОЕКТ</span>
              <span className="title-line highlight">Наша ТОЧНОСТЬ</span>
            </h1>
            <p className="hero-description">
              Превратите идеи в архитектурные планы с помощью передового ИИ. Быстро, точно, профессионально.
            </p>
            <div className="hero-cta">
              <button className="cta-button primary large" onClick={handleStartPlan}>
                <span>Начать бесплатно</span>
                <span className="cta-icon">→</span>
              </button>
            </div>
          </div>
          
          {/* 3D элемент - Advanced Architectural Grid */}
          <div className="hero-visual" style={{
            transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.03}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.015}deg)`
          }}>
            <div className="architectural-grid">
              <div className="grid-layer layer-1"></div>
              <div className="grid-layer layer-2"></div>
              <div className="grid-layer layer-3"></div>
              <div className="grid-core"></div>
              <div className="grid-glow-inner"></div>
              <div className="grid-glow-outer"></div>
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
