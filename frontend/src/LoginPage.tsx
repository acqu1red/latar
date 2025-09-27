import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext'; // Импортируем useAuth
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false); // Изменено имя во избежание конфликтов
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Используем хук useAuth

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard'); // Если пользователь уже авторизован, перенаправляем на дашборд
    }
  }, [isLoading, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAuth(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Login successful');
        // Перенаправление будет обработано useEffect после обновления состояния AuthContext
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при входе');
      console.error(err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  if (isLoading || (user && !isLoadingAuth)) { // Показываем загрузку, если AuthContext загружается или пользователь уже есть
    return (
      <div className="login-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <h2 className="login-title">Вход</h2>
          <p className="login-subtitle">Добро пожаловать обратно!</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@example.com"
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={isLoadingAuth}>
            {isLoadingAuth ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="register-link">
            Ещё нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
          <Link to="/" className="back-link">← На главную</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
