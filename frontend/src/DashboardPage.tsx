import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Импорт AuthContext
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth(); // Получаем пользователя и функцию выхода из контекста
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!user) {
      navigate('/login');
    }

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
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(); // Выход из аккаунта через AuthContext
    console.log('Logged out');
    navigate('/login');
  };

  const handleGeneratePlan = () => {
    navigate('/texscheme');
  };

  if (!user) { // Пока пользователь не загрузится, ничего не показываем
    return null;
  }

  const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'Пользователь';

  return (
    <div className="dashboard-page">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <div className={`dashboard-content-wrapper ${isLoaded ? 'loaded' : ''}`}>
        <nav className="dashboard-navbar">
          <div className="nav-brand">
            <span className="brand-icon">🏗️</span>
            <span className="brand-text">FlatMap AI</span>
          </div>
          <button onClick={handleLogout} className="logout-button">Выйти</button>
        </nav>

        <div className="dashboard-3d-scene" style={{
          transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.005}deg)`
        }}>
          <div className="scene-center-orb"></div>
          <div className="scene-line line-1"></div>
          <div className="scene-line line-2"></div>
          <div className="scene-line line-3"></div>
          <div className="scene-line line-4"></div>
          
          <div className="dashboard-panel panel-left">
            <h2 className="panel-title">Статистика</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <span className="stat-value">12</span>
                <span className="stat-label">Проектов</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🚀</span>
                <span className="stat-value">99.9%</span>
                <span className="stat-label">Точность</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">5 сек</span>
                <span className="stat-label">Скорость</span>
              </div>
            </div>
          </div>

          <div className="dashboard-panel panel-right">
            <h2 className="panel-title">Быстрый доступ</h2>
            <div className="quick-access-grid">
              <button className="quick-access-btn" onClick={handleGeneratePlan}>
                <span className="btn-icon">➕</span>
                <span className="btn-text">Новый план</span>
              </button>
              <button className="quick-access-btn">
                <span className="btn-icon">📁</span>
                <span className="btn-text">Мои файлы</span>
              </button>
              <button className="quick-access-btn">
                <span className="btn-icon">⚙️</span>
                <span className="btn-text">Настройки</span>
              </button>
            </div>
          </div>

          <div className="dashboard-card welcome-card-3d">
            <h1 className="card-title">Добро пожаловать, {userName}!</h1>
            <p className="card-subtitle">Ваш персональный центр управления проектами.</p>
            <button className="generate-button-3d" onClick={handleGeneratePlan}>
              Создать новый план
            </button>
          </div>

          <div className="dashboard-card projects-card-3d">
            <h2 className="card-title">Мои последние проекты</h2>
            <div className="project-list-3d">
              <div className="empty-projects-3d">
                <p>У вас пока нет проектов.</p>
                <p>Начните свой первый проект прямо сейчас!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
