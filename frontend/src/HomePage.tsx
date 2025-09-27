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

  const handleAuthRedirect = (path: string) => {
    navigate(path);
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
            <button className="nav-button secondary" onClick={() => handleAuthRedirect('/login')}>Войти</button>
            <button className="nav-button primary" onClick={() => handleAuthRedirect('/register')}>Регистрация</button>
          </div>
        </nav>

        {/* Герой-секция */}
        <main className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Создавайте</span>
              <span className="title-line highlight">Технические Планы</span>
              <span className="title-line">с помощью ИИ</span>
            </h1>
            <p className="hero-description">
              Превратите ваши идеи в профессиональные технические планы помещений за считанные секунды.
              Наша передовая AI-технология создает точные, детализированные архитектурные чертежи с безупречным качеством.
            </p>
            <div className="hero-cta">
              <button className="cta-button primary large" onClick={() => handleAuthRedirect('/register')}>
                <span>Начать бесплатно</span>
                <span className="cta-icon">→</span>
              </button>
            </div>
          </div>
          
          {/* 3D элемент */}
          <div className="hero-visual" style={{
            transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.05}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.02}deg)`
          }}>
            <div className="hero-3d-model">
              <div className="model-face front"></div>
              <div className="model-face back"></div>
              <div className="model-face left"></div>
              <div className="model-face right"></div>
              <div className="model-face top"></div>
              <div className="model-face bottom"></div>
              <div className="model-glow"></div>
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
