import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext'; // Импортируем useAuth
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Используем хук useAuth

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        alert('Ошибка при выходе из аккаунта: ' + error.message);
      } else {
        console.log('Logged out successfully');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Error logging out:', err);
      alert('Произошла ошибка при выходе из аккаунта.');
    }
  };

  const handleGeneratePlan = () => {
    navigate('/texscheme');
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <nav className="dashboard-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏗️</span>
          <span className="brand-text">FlatMap AI</span>
        </div>
        <div className="nav-user">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">Выйти</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Добро пожаловать в личный кабинет!</h1>
          <p className="welcome-subtitle">
            Здесь вы можете управлять своими проектами и создавать новые технические планы.
          </p>
          <button className="generate-button" onClick={handleGeneratePlan}>
            <span className="button-icon">✨</span>
            Создать новый технический план
            <span className="button-arrow">→</span>
          </button>
        </div>

        {/* Секция проектов */}
        <div className="projects-section">
          <h2 className="projects-title">Мои проекты</h2>
          <div className="project-list">
            <div className="empty-projects">
              <div className="empty-icon">📋</div>
              <h3>У вас пока нет проектов</h3>
              <p>Нажмите кнопку выше, чтобы создать первый технический план!</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>0</h3>
              <p>Проектов создано</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>0</h3>
              <p>Планов сгенерировано</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>99.9%</h3>
              <p>Точность AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
