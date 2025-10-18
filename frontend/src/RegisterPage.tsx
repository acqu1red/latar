import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!dataConsent) {
      setError('Необходимо дать согласие на обработку персональных данных');
      return;
    }
    
    setLoading(true);
    
    // Симуляция отправки заявки
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-300 selection:text-zinc-900">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(black_1px,transparent_1px)] [background-size:6px_6px]" />
      <div className="pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-white/10 to-white/0" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 border-b border-white/5">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="group inline-flex items-center gap-1.5">
              <img src="/latar/logo.svg" alt="Логотип" className="h-7 w-7" />
              <span className="text-[1.375rem] font-medium text-zinc-200 group-hover:text-white transition">Arcplan</span>
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
          <div className="max-w-lg mx-auto">
            {!success ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-semibold text-zinc-50 mb-2">Оставить заявку</h1>
                  <p className="text-zinc-400 mb-4">Заполните форму, и мы свяжемся с вами в ближайшее время</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-zinc-200 mb-2">
                          Компания <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="company"
                          type="text"
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 transition-all"
                          placeholder="Название вашей компании"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-200 mb-2">
                          Рабочая почта <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 transition-all"
                          placeholder="example@company.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-zinc-200 mb-2">
                          Телефон <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 transition-all"
                          placeholder="+7 (___) ___-__-__"
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-zinc-200 mb-2">
                          Город <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="city"
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 transition-all"
                          placeholder="Москва, Санкт-Петербург..."
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contactMethod" className="block text-sm font-medium text-zinc-200 mb-2">
                        Предпочтительный способ связи
                      </label>
                      <input
                        id="contactMethod"
                        type="text"
                        value={contactMethod}
                        onChange={(e) => setContactMethod(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 text-zinc-100 placeholder-zinc-500 transition-all"
                        placeholder="Email, Телефон, Telegram..."
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <input
                        type="checkbox"
                        id="dataConsent"
                        checked={dataConsent}
                        onChange={(e) => setDataConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-white/10 bg-white/5 text-zinc-100 focus:ring-2 focus:ring-white/10 cursor-pointer"
                      />
                      <label htmlFor="dataConsent" className="text-sm text-zinc-300 cursor-pointer leading-relaxed">
                        Я даю согласие на обработку персональных данных и соглашаюсь с{' '}
                        <a href="/privacy" className="text-zinc-100 hover:underline">
                          политикой конфиденциальности
                        </a>{' '}
                        <span className="text-red-400">*</span>
                      </label>
                    </div>

                    {error && (
                      <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-100 text-zinc-950 px-6 py-3.5 text-sm font-medium hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Отправка...
                        </>
                      ) : (
                        'Отправить заявку'
                      )}
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
              </>
            ) : (
              <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/20 mb-6">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-50 mb-3">
                  Заявка успешно отправлена!
                </h2>
                <p className="text-zinc-400 mb-6">
                  Спасибо за интерес к нашему сервису. Мы свяжемся с вами в ближайшее время.
                </p>
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-sm text-zinc-200 hover:text-white transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Вернуться на главную
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
