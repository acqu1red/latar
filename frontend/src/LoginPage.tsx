import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { authService } from '../lib/supabase';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Временная заглушка для сборки
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (username === 'admin' && password === 'password') {
        console.log('Login successful');
        navigate('/dashboard');
      } else {
        setError('Неверное имя пользователя или пароль');
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <div className="icon-glow"></div>
            🔐
          </div>
          <h2 className="login-title">Добро пожаловать обратно</h2>
          <p className="login-subtitle">Войдите в свой аккаунт, чтобы продолжить</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Имя пользователя</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Введите имя пользователя"
                className="form-input"
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Пароль</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Введите пароль"
                className="form-input"
              />
              <div className="input-glow"></div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            <span className="button-text">
              {isLoading ? 'Вход...' : 'Войти'}
            </span>
            <div className="button-glow"></div>
            <div className="button-ripple"></div>
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Ещё нет аккаунта? <Link to="/register" className="link">Зарегистрироваться</Link>
          </p>
          <Link to="/" className="back-link">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
