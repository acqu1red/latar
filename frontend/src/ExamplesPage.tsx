import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Eraser, Box, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

type ServiceType = 'plan' | 'cleaning' | 'constructor';

interface Example {
  before: string;
  after: string;
  title: string;
  description: string;
}

const Container = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const ExamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedService, setSelectedService] = useState<ServiceType>('plan');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      id: 'plan' as ServiceType,
      title: 'Создание плана по фото',
      shortTitle: 'План по фото',
      icon: Image,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      activeGradient: 'from-blue-500/30 to-cyan-500/30',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'cleaning' as ServiceType,
      title: 'Очистка фото',
      shortTitle: 'Очистка',
      icon: Eraser,
      gradient: 'from-purple-500/20 to-pink-500/20',
      activeGradient: 'from-purple-500/30 to-pink-500/30',
      borderColor: 'border-purple-500/30',
    },
    {
      id: 'constructor' as ServiceType,
      title: 'AI Конструктор',
      shortTitle: 'Конструктор',
      icon: Box,
      gradient: 'from-orange-500/20 to-red-500/20',
      activeGradient: 'from-orange-500/30 to-red-500/30',
      borderColor: 'border-orange-500/30',
    },
  ];

  const examples: Record<string, Example[]> = {
    plan: [
      {
        before: '/latar/past_testplan.jpg',
        after: '/latar/rdy_testplan.jpg',
        title: 'Жилая комната',
        description: 'Создание плана комнаты из фотографии с точными размерами',
      },
      {
        before: '/latar/past_testplanmeb.jpg',
        after: '/latar/rdy_testplanmeb.jpg',
        title: 'Помещение с мебелью',
        description: 'План помещения с расстановкой мебели',
      },
    ],
    cleaning: [
      {
        before: '/latar/past_deleteobjects.jpg',
        after: '/latar/rdy_deleteobjects.jpg',
        title: 'Удаление объектов',
        description: 'Очистка помещения от лишних предметов',
      },
    ],
    constructor: [
      {
        before: '/latar/uploads/hero1.webp',
        after: '/latar/uploads/hero2_cropped.webp',
        title: 'Интерактивное создание плана',
        description: 'Создание плана помещения с помощью AI конструктора',
      },
    ],
  };

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
            <button onClick={() => navigate('/')} className="group inline-flex items-center gap-1.5">
              <img src="/latar/logo.svg" alt="Логотип" className="h-7 w-7" />
              <span className="text-[1.375rem] font-medium text-zinc-200 group-hover:text-white transition">Arcplan</span>
            </button>
          </div>
          
          {/* Center section - Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
              <div className="relative group">
                <button onClick={() => navigate('/features')} className="hover:text-zinc-100 transition cursor-pointer">
                  Возможности
                  <svg className="inline-block ml-1 w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Hover bridge to prevent flicker between trigger and menu */}
                <div className="absolute left-0 right-0 top-full h-2"></div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-[280px] rounded-md border border-white/10 bg-zinc-900/95 backdrop-blur-sm shadow-xl overflow-hidden">
                    <div className="p-1">
                      <button onClick={() => navigate('/features/ai-plan')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Создание плана по фото</span>
                      </button>
                      
                      <button onClick={() => navigate('/features/constructor')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span>AI конструктор планов</span>
                      </button>
                      
                      <button onClick={() => navigate('/features/photo-cleaning')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span>Очистка фото</span>
                      </button>
                      
                      <button onClick={() => navigate('/features/automation')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Автоматизация бизнес-процессов</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/pricing')} className="hover:text-zinc-100 transition">Тарифы</button>
              <button onClick={() => navigate('/examples')} className="text-zinc-100 transition">Примеры работ</button>
              <button onClick={() => navigate('/contacts')} className="hover:text-zinc-100 transition">Контакты</button>
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
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 text-zinc-300" />
              ) : (
                <Menu className="h-4 w-4 text-zinc-300" />
              )}
            </button>
          </div>
        </div>
        </Container>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-md absolute top-full left-0 right-0"
          >
            <Container className="py-3">
              <nav className="flex flex-col space-y-3">
                <button 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm text-left" 
                  onClick={() => { navigate('/features'); closeMobileMenu(); }}
                >
                  Возможности
                </button>
                <button 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm text-left" 
                  onClick={() => { navigate('/pricing'); closeMobileMenu(); }}
                >
                  Тарифы
                </button>
                <button 
                  className="text-zinc-100 transition py-1.5 text-sm text-left" 
                  onClick={closeMobileMenu}
                >
                  Примеры работ
                </button>
                <button 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm text-left" 
                  onClick={() => { navigate('/'); closeMobileMenu(); }}
                >
                  Контакты
                </button>
                
                {/* Mobile Auth Buttons */}
                <div className="pt-3 border-t border-white/10">
                  {user ? (
                    <div className="flex flex-col space-y-2">
                      <span className="text-xs text-zinc-300">Привет, {user.name}</span>
                      <button 
                        onClick={() => { logout(); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Выйти</span>
                        <LogOut className="h-3.5 w-3.5 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => { navigate('/login'); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Войти</span>
                      </button>
                      <button 
                        onClick={() => { navigate('/register'); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-100 text-zinc-950 px-3 py-1.5 text-xs font-medium hover:opacity-90 transition"
                      >
                        Оставить заявку
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </Container>
          </motion.div>
        )}
      </header>

      {/* Main content */}
      <div className="relative">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-50 mb-4">
              Примеры работ
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Выберите услугу, чтобы посмотреть примеры выполненных работ
            </p>
          </div>

          {/* Compact Service Tabs */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-3 gap-0 rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isActive = selectedService === service.id;
                const isLast = index === services.length - 1;
                
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`relative py-6 px-4 transition-all duration-300 ${
                      !isLast ? 'border-r border-white/10' : ''
                    } ${
                      isActive ? 'bg-white/5' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-br ${service.activeGradient}`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="relative flex flex-col items-center gap-3">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                        isActive ? 'bg-white/10' : 'bg-white/5'
                      }`}>
                        <Icon className={`h-6 w-6 transition-colors ${
                          isActive ? 'text-zinc-100' : 'text-zinc-400'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isActive ? 'text-zinc-50' : 'text-zinc-400'
                      }`}>
                        {service.shortTitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Examples Content */}
          <AnimatePresence mode="wait">
            {examples[selectedService] && (
              <motion.div
                key={selectedService}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl mx-auto"
              >
                {/* Service Description */}
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-semibold text-zinc-50 mb-2">
                    {services.find(s => s.id === selectedService)?.title}
                  </h2>
                </div>

                {/* Examples Grid */}
                <div className="space-y-8">
                  {examples[selectedService].map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
                    >
                      <h3 className="text-xl font-semibold text-zinc-50 mb-2">
                        {example.title}
                      </h3>
                      <p className="text-zinc-400 mb-6">
                        {example.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Before */}
                        <div className="space-y-3">
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                            <span className="text-sm font-medium text-red-300">До</span>
                          </div>
                          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3]">
                            <img 
                              src={example.before} 
                              alt="До" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* After */}
                        <div className="space-y-3">
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                            <span className="text-sm font-medium text-green-300">После</span>
                          </div>
                          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3]">
                            <img 
                              src={example.after} 
                              alt="После" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default ExamplesPage;

