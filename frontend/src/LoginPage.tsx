import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Изменяем путь импорта
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Изменяем обратно на email
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Удаляем логику генерации фиктивного email

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email, // Используем введенный email
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Login successful');
        navigate('/dashboard'); // Перенаправление в личный кабинет
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

      <div className="login-content">
        <div className="login-container">
          <h2 className="login-title">Вход</h2>
          <p className="login-subtitle">Добро пожаловать обратно!</p>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label> {/* Изменяем label обратно на Email */}
              <input
                type="email" // Изменяем type обратно на email
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@example.com" // Обновленный placeholder
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
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <p className="register-link">
            Ещё нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
