import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { LogOut } from "lucide-react";

const Container = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const FadeIn = ({ delay = 0, children, className = "" }: { delay?: number; children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const steps = [
    "Вы выбираете нужное количество планов или очисток изображений.",
    "Мы формируем для вас персональное предложение с фиксированной стоимостью за пакет.",
    "Если результат генерации не устраивает — план можно перегенерировать без дополнительной оплаты."
  ];

  return (
    <main className="relative min-h-screen bg-black text-zinc-100 antialiased selection:bg-zinc-300 selection:text-zinc-900 pt-14">
      {/* Background effects */}
      <div className="pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-white/10 to-white/0" />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-zinc-950/95 border-b border-white/10 shadow-2xl' 
          : 'backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60 border-b border-white/5'
      }`}>
        <Container className="flex h-14 items-center">
          {/* Left section - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a onClick={() => navigate('/')} className="group inline-flex items-center gap-1.5 cursor-pointer">
              <img src="/latar/logo.svg" alt="Логотип" className="h-7 w-7" />
              <span className="text-[1.375rem] font-medium text-zinc-200 group-hover:text-white transition">Arcplan</span>
            </a>
          </div>
          
          {/* Center section - Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
              <div className="relative group">
                <a className="hover:text-zinc-100 transition cursor-pointer" onClick={() => navigate('/features')}>
                  Возможности
                  <svg className="inline-block ml-1 w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                {/* Hover bridge to prevent flicker between trigger and menu */}
                <div className="absolute left-0 right-0 top-full h-2"></div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-[280px] rounded-md border border-white/10 bg-zinc-900/95 backdrop-blur-sm shadow-xl overflow-hidden">
                    <div className="p-1">
                      <a onClick={() => navigate('/features/ai-plan')} className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition cursor-pointer">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Создание плана по фото</span>
                      </a>
                      
                      <a onClick={() => navigate('/features/constructor')} className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition cursor-pointer">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span>AI конструктор планов</span>
                      </a>
                      
                      <a onClick={() => navigate('/features/photo-cleaning')} className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition cursor-pointer">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span>Очистка фото</span>
                      </a>
                      
                      <a onClick={() => navigate('/features/automation')} className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition cursor-pointer">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Автоматизация бизнес-процессов</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <a className="hover:text-zinc-100 transition text-zinc-100 font-medium cursor-pointer">Тарифы</a>
              <button onClick={() => navigate('/examples')} className="hover:text-zinc-100 transition">Примеры работ</button>
              <a className="hover:text-zinc-100 transition cursor-pointer" onClick={() => navigate('/contacts')}>Контакты</a>
            </nav>
          </div>
          
          {/* Right section - Auth buttons */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-2">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-xs text-zinc-300">Привет, {user.name}</span>
                  <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                    <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Выйти</span>
                    <LogOut className="h-3.5 w-3.5 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                    <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Войти</span>
                  </button>
                  <button onClick={() => navigate('/register')} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-100 text-zinc-950 px-3 py-1.5 text-xs font-medium hover:opacity-90 transition">
                    Оставить заявку
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
            </div>
          </div>
        </Container>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="space-y-1 px-4 py-3">
              <a onClick={() => { navigate('/features'); closeMobileMenu(); }} className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition cursor-pointer">
                Возможности
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-zinc-100 font-medium bg-white/5 cursor-pointer">
                Тарифы
              </a>
              <button onClick={() => { navigate('/examples'); closeMobileMenu(); }} className="w-full text-left block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition">
                Примеры работ
              </button>
              <a onClick={() => { navigate('/contacts'); closeMobileMenu(); }} className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition cursor-pointer">
                Контакты
              </a>
              <div className="border-t border-white/10 mt-2 pt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-xs text-zinc-300">Привет, {user.name}</div>
                    <button onClick={() => { logout(); closeMobileMenu(); }} className="w-full text-left block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition">
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate('/login'); closeMobileMenu(); }} className="w-full text-left block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition">
                      Войти
                    </button>
                    <button onClick={() => { navigate('/register'); closeMobileMenu(); }} className="w-full text-left block rounded-md px-3 py-2 text-sm bg-zinc-100 text-zinc-950 hover:opacity-90 transition">
                      Оставить заявку
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <div className="relative z-10">
        <Container className="py-16 sm:py-24">
          {/* Hero Section */}
          <FadeIn>
            <div className="text-center mb-12">
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Тарифы
              </motion.h1>
              <motion.p 
                className="text-lg sm:text-xl text-zinc-300 max-w-4xl mx-auto leading-relaxed mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Мы работаем по принципу индивидуальных договорённостей — без шаблонных тарифов и скрытых условий. Каждое агентство недвижимости получает собственный пакет, исходя из объёмов и задач.
              </motion.p>
            </div>
          </FadeIn>

          {/* How it works */}
          <FadeIn delay={0.4}>
            <div className="max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-8">Как это работает:</h2>
              <div className="space-y-6">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-medium text-zinc-100">
                      {idx + 1}
                    </span>
                    <p className="text-base sm:text-lg text-zinc-300 pt-1">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Final text */}
          <FadeIn delay={0.8}>
            <div className="max-w-4xl mx-auto">
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed text-center">
                Такой подход позволяет учитывать особенности каждого партнёра — от небольших агентств до крупных сетей — и обеспечить максимальную выгоду при стабильном качестве.
              </p>
            </div>
          </FadeIn>
        </Container>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-24">
        <Container className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/latar/logo.svg" alt="Логотип" className="h-6 w-6" />
              <span className="text-sm text-zinc-400">© 2024 Arcplan. Все права защищены.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <a onClick={() => navigate('/')} className="hover:text-zinc-100 transition cursor-pointer">Главная</a>
              <a onClick={() => navigate('/examples')} className="hover:text-zinc-100 transition cursor-pointer">Примеры</a>
              <a onClick={() => navigate('/contacts')} className="hover:text-zinc-100 transition cursor-pointer">Контакты</a>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
};

export default PricingPage;

