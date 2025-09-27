import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      {/* Enhanced Background Animation */}
      <div className="background-animation">
        <div className="gradient-orb orb-1" style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}></div>
        <div className="gradient-orb orb-2" style={{
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.01}px)`
        }}></div>
        <div className="gradient-orb orb-3" style={{
          transform: `translate(${mousePosition.x * 0.008}px, ${mousePosition.y * 0.012}px)`
        }}></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        <div className="particle-field">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className={`homepage-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Enhanced Navigation */}
        <nav className="main-navbar">
          <div className="nav-brand">
            <div className="brand-icon">
              <div className="icon-glow"></div>
              🏗️
            </div>
            <div className="brand-text">
              <span className="brand-name">FlatMap AI</span>
              <span className="brand-subtitle">Powered by AI</span>
            </div>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-button secondary">
              <span className="button-text">Войти</span>
              <div className="button-underline"></div>
            </Link>
            <Link to="/register" className="nav-button primary">
              <span className="button-text">Регистрация</span>
              <div className="button-glow"></div>
            </Link>
          </div>
        </nav>

        {/* Enhanced Hero Section */}
        <main className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">Новое поколение AI</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Превратите ваши идеи в</span>
              <span className="title-line title-accent">
                <span className="accent-text">профессиональные</span>
                <div className="accent-glow"></div>
              </span>
              <span className="title-line">технические планы помещений</span>
            </h1>
            
            <p className="hero-description">
              Передовая AI-технология создает точные, детализированные архитектурные чертежи с безупречным качеством за считанные секунды
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Точность</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5 сек</div>
                <div className="stat-label">Скорость</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Проектов</div>
              </div>
            </div>
            
            <div className="hero-cta">
              <button className="cta-button primary large" onClick={() => handleAuthRedirect('/register')}>
                <span className="button-text">Начать бесплатно</span>
                <span className="cta-icon">→</span>
                <div className="button-glow"></div>
                <div className="button-ripple"></div>
              </button>
              <button className="cta-button secondary" onClick={() => handleAuthRedirect('/login')}>
                <span className="button-text">Уже есть аккаунт?</span>
                <div className="button-underline"></div>
              </button>
            </div>
          </div>
          
          {/* Enhanced 3D Visual */}
          <div className="hero-visual" style={{
            transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.05}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.02}deg)`
          }}>
            <div className="hero-3d-model">
              <div className="model-cube">
                <div className="model-face front"></div>
                <div className="model-face back"></div>
                <div className="model-face left"></div>
                <div className="model-face right"></div>
                <div className="model-face top"></div>
                <div className="model-face bottom"></div>
              </div>
              <div className="model-glow"></div>
              <div className="model-particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="model-particle" style={{
                    animationDelay: `${i * 0.3}s`
                  }}></div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-icon">🏗️</span>
              <span className="footer-text">FlatMap AI</span>
            </div>
            <p className="footer-copyright">&copy; 2024 FlatMap AI. Все права защищены.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
