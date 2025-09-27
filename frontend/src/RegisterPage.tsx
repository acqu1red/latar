import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Изменяем путь импорта
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [login, setLogin] = useState(''); // Изменяем email на login
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    // Генерируем фиктивный email из логина для Supabase
    const fakeEmail = `${login}@example.com`;

    try {
      const { error } = await supabase.auth.signUp({
        email: fakeEmail, // Используем сгенерированный фиктивный email
        password: password,
        options: {
          data: { // Добавляем метаданные для хранения логина
            username: login,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        // После успешной регистрации, также пытаемся войти, чтобы создать сессию
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fakeEmail, // Используем сгенерированный фиктивный email
          password: password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          console.log('Registration and login successful');
          navigate('/dashboard'); // Перенаправление в личный кабинет
        }
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
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

      <div className="register-content">
        <div className="register-container">
          <h2 className="register-title">Регистрация</h2>
          <p className="register-subtitle">Создайте свой аккаунт, чтобы начать!</p>
          <form onSubmit={handleRegister} className="register-form">
            <div className="input-group">
              <label htmlFor="login">Логин</label> {/* Изменяем label на Логин */}
              <input
                type="text" // Изменяем type на text
                id="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                placeholder="ваш_логин"
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
            <div className="input-group">
              <label htmlFor="confirmPassword">Повторите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="register-button" disabled={isLoading}>
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="login-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
