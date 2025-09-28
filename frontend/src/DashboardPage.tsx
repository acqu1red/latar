import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Здесь будет логика выхода из аккаунта
    console.log('Logged out');
    navigate('/login');
  };

  const handleGeneratePlan = () => {
    navigate('/texscheme');
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏗️</span>
          <span className="brand-text">FlatMap AI</span>
        </div>
        <button onClick={handleLogout} className="logout-button">Выйти</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Добро пожаловать в личный кабинет!</h1>
          <p className="welcome-subtitle">Здесь вы можете управлять своими проектами и создавать новые технические планы.</p>
          <button className="generate-button" onClick={handleGeneratePlan}>
            Создать новый технический план
          </button>
        </div>

        {/* Здесь будут отображаться проекты пользователя */}
        <div className="projects-section">
          <h2 className="projects-title">Мои проекты</h2>
          <div className="project-list">
            <div className="empty-projects">
              <p>У вас пока нет проектов.</p>
              <p>Нажмите кнопку выше, чтобы создать первый!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
