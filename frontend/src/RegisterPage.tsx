import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowLeft } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Состояние для псевдонима
  const [telegramUsername, setTelegramUsername] = useState(''); // Переименованное состояние для Telegram
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Добавлено состояние для показа пароля
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    // Передаем username вместо email
    const success = await register(name, username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Ошибка регистрации. Попробуйте еще раз');
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-300 selection:text-zinc-900">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(black_1px,transparent_1px)] [background-size:6px_6px]" />
      <div className="pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-white/10 to-white/0" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 border-b border-white/5">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="group inline-flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-zinc-100 text-zinc-900 grid place-content-center text-[10px] font-bold">FM</div>
              <span className="font-medium text-zinc-200 group-hover:text-white transition">Plan 2D</span>
            </Link>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold text-zinc-50 mb-2">Запустить ARCPLAN</h1>
              <p className="text-zinc-400 mb-4">Начнем работу с Вашей организацией по созданию планировок с AI</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-200 mb-2">
                    Название организации
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500"
                    placeholder="Как называется Ваша организация?"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-200 mb-2">
                    Псевдоним для входа
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500"
                    placeholder="Введите псевдоним"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-200 mb-2">
                    Пароль для входа
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-4 flex items-center text-zinc-400 hover:text-zinc-100 transition"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M10.61 10.61A4.705 4.705 0 0 0 12 17a5 5 0 0 1-5-5c0-.47-.1-.92-.28-1.34L2 12s3-7 10-7c1.5 0 2.97.42 4.23 1.18l-1.34 1.34z"/><path d="M21 12s-3 7-10 7c-.75 0-1.47-.14-2.16-.43l-1.97 1.97"/><path d="M15.46 15.46L19 19"/><path d="M4.77 4.77 2 2"/><path d="M22 2 15.24 8.76"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-200 mb-2">
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-4 flex items-center text-zinc-400 hover:text-zinc-100 transition"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M10.61 10.61A4.705 4.705 0 0 0 12 17a5 5 0 0 1-5-5c0-.47-.1-.92-.28-1.34L2 12s3-7 10-7c1.5 0 2.97.42 4.23 1.18l-1.34 1.34z"/><path d="M21 12s-3 7-10 7c-.75 0-1.47-.14-2.16-.43l-1.97 1.97"/><path d="M15.46 15.46L19 19"/><path d="M4.77 4.77 2 2"/><path d="M22 2 15.24 8.76"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="telegram_username" className="block text-sm font-medium text-zinc-200 mb-2">
                    Telegram для связи
                  </label>
                  <input
                    id="telegram_username"
                    type="text"
                    required
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500"
                    placeholder="@example"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Запуск...' : 'Запустить ARCPLAN'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-400">
                  Уже работаете с нами?{' '}
                  <Link to="/login" className="text-zinc-200 hover:text-white transition">
                    Войти в систему
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
