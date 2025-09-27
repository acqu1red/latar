import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// Импортируем изображения для карусели
import image1 from './assets/carousel/image1.jpg'; // Замените на ваши пути
import image2 from './assets/carousel/image2.jpg';
import image3 from './assets/carousel/image3.jpg';
import image4 from './assets/carousel/image4.jpg';

const images = [image1, image2, image3, image4];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFinalImage, setIsFinalImage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => {
        if (prevIndex === images.length - 1) {
          setIsFinalImage(true);
          clearInterval(interval);
          return prevIndex;
        } else {
          return prevIndex + 1;
        }
      });
    }, 3000); // Смена изображения каждые 3 секунды

    return () => clearInterval(interval);
  }, []);

  const handleAuthRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Глобальный фон с более сложной анимацией */}
      <div className="background-animation"></div>

      {/* Контейнер для анимации фотографий */}
      <div className="image-carousel-container">
        {images.map((imgSrc, index) => (
          <img
            key={index}
            src={imgSrc}
            alt={`Interior ${index + 1}`}
            className={`carousel-image ${index === currentImageIndex ? 'active' : ''} ${isFinalImage && index === images.length - 1 ? 'final-stretch' : ''}`}
          />
        ))}
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