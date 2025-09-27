import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext'; // Импортируем useAuth
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false); // Изменено имя во избежание конфликтов
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Используем хук useAuth

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard'); // Если пользователь уже авторизован, перенаправляем на дашборд
    }
  }, [isLoading, user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingAuth(true);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoadingAuth(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Registration successful');
        alert('Регистрация успешна! Проверьте свою почту для подтверждения.');
        navigate('/login'); // Перенаправить на страницу входа после успешной регистрации
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при регистрации');
      console.error(err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  if (isLoading || (user && !isLoadingAuth)) { // Показываем загрузку, если AuthContext загружается или пользователь уже есть
    return (
      <div className="register-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      {/* Анимированный фон */}
      <div className="background-animation">
        <div className="gradient-orb"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="register-container">
        <div className="register-header">
          <h2 className="register-title">Регистрация</h2>
          <p className="register-subtitle">Создайте свой аккаунт, чтобы начать!</p>
        </div>
        
        <form onSubmit={handleRegister} className="register-form">
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
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Повторите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="register-button" disabled={isLoadingAuth}>
            {isLoadingAuth ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="register-footer">
          <p className="login-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
          <Link to="/" className="back-link">← На главную</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
