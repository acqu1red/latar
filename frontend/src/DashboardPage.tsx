import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Импорт AuthContext
import { supabase } from './supabaseClient'; // Импорт клиента Supabase
import './DashboardPage.css';

interface Plan {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [userPlans, setUserPlans] = useState<Plan[]>([]); // Новое состояние для планов
  const [plansLoading, setPlansLoading] = useState(true); // Состояние загрузки планов

  useEffect(() => {
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

  useEffect(() => {
    const fetchPlans = async () => {
      if (user) {
        setPlansLoading(true);
        const { data, error } = await supabase
          .from('plans')
          .select('id, title, image_url, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Ошибка загрузки планов:', error);
        } else {
          setUserPlans(data || []);
        }
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [user]); // Загружаем планы при изменении пользователя

  const handleLogout = async () => {
    await signOut();
    console.log('Logged out');
    navigate('/login');
  };

  const handleGeneratePlan = () => {
    navigate('/texscheme');
  };

  if (!user) {
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
                <span className="stat-value">{userPlans.length}</span> {/* Динамическое количество проектов */}
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
            {plansLoading ? (
              <p className="loading-text">Загрузка планов...</p>
            ) : userPlans.length > 0 ? (
              <div className="project-list-3d">
                {userPlans.map((plan) => (
                  <div key={plan.id} className="plan-card-3d">
                    <img src={plan.image_url} alt={plan.title} className="plan-card-image" />
                    <h3 className="plan-card-title">{plan.title}</h3>
                    <p className="plan-card-date">{new Date(plan.created_at).toLocaleDateString()}</p>
                    <a href={plan.image_url} download={plan.title || `plan_${plan.id}.png`} className="plan-card-download-btn">Скачать</a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-projects-3d">
                <p>У вас пока нет проектов.</p>
                <p>Начните свой первый проект прямо сейчас!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
