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
      <h1>FlatMap AI - Главная страница</h1>
      <p>Добро пожаловать на главную страницу!</p>
      <button onClick={handleAuthRedirect}>
        Перейти к входу
      </button>
      <button onClick={() => navigate('/texscheme')}>
        Перейти к генерации планов
      </button>
    </div>
  );
};

export default HomePage;