import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Неверный псевдоним или пароль');
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
              <h1 className="text-3xl font-semibold text-zinc-50 mb-2">Вход в систему</h1>
              <p className="text-zinc-400">Войдите в свой аккаунт для доступа к функциям</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-200 mb-2">
                    Псевдоним
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
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500"
                    placeholder="••••••••"
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
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-400">
                  Нет аккаунта?{' '}
                  <Link to="/register" className="text-zinc-200 hover:text-white transition">
                    Зарегистрироваться
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

export default LoginPage;
