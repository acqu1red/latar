import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { authService } from '../lib/supabase';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      // Временная заглушка для сборки
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Registration successful:', { username, displayName });
      navigate('/dashboard');
    } catch (err) {
      setError('Произошла ошибка при регистрации');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
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

      <div className="register-container">
        <div className="register-header">
          <div className="register-icon">
            <div className="icon-glow"></div>
            ✨
          </div>
          <h2 className="register-title">Создайте аккаунт</h2>
          <p className="register-subtitle">Присоединяйтесь к сообществу FlatMap AI</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
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
            <label htmlFor="displayName">Отображаемое имя (необязательно)</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Как вас будут видеть другие"
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
                placeholder="Минимум 6 символов"
                className="form-input"
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Повторите пароль"
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

          <button type="submit" className="register-button" disabled={isLoading}>
            <span className="button-text">
              {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
            </span>
            <div className="button-glow"></div>
            <div className="button-ripple"></div>
          </button>
        </form>

        <div className="register-footer">
          <p className="login-link">
            Уже есть аккаунт? <Link to="/login" className="link">Войти</Link>
          </p>
          <Link to="/" className="back-link">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
