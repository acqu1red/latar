import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Кастомные стили для скроллбара
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarStyles;
  if (!document.head.querySelector('style[data-custom-scrollbar-homepage]')) {
    styleElement.setAttribute('data-custom-scrollbar-homepage', 'true');
    document.head.appendChild(styleElement);
  }
}
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import HeroDiagonal from "./hero_diagonal";
import { ConstructorPreview } from "./components/ConstructorPreview";
import {
  ArrowRight,
  Shield,
  LogOut,
  Menu,
  X,
  Upload,
  Sparkles,
  Download,
  Grid3x3,
  Layers,
  Zap,
  Paperclip,
  Check,
} from "lucide-react";
// import { cn } from "@/lib/utils"; // Удален неверный импорт


/* =============================
   Helpers & effects
   ============================= */
const Section = ({ id, className = "", children }: { id: string; className?: string; children: React.ReactNode }) => (
  <section id={id} className={`relative w-full ${className}`}>{children}</section>
);

const Container = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);


const FadeIn = ({ delay = 0, children, className = "", isReturning = false }: { delay?: number; children: React.ReactNode; className?: string; isReturning?: boolean }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={isReturning ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
    viewport={isReturning ? { once: false, amount: 0 } : { once: true, amount: 0.3 }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const SlideInFromLeft = ({ delay = 0, children, className = "" }: { delay?: number; children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, x: -100, filter: "blur(20px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    transition={{ 
      duration: 1.2, 
      delay,
      ease: [0.16, 1, 0.3, 1] 
    }}
  >
    {children}
  </motion.div>
);

const Glow = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-white/10 to-white/0 ${className}`} />
);

/* =============================
   Old FoldingHero component removed - replaced with HeroDiagonal
   ============================= */

/* =============================
   Demo Hero with Diagonal Design
   ============================= */
/* =============================
   InlineDemoHero - для встроенной демонстрации в секции "Всё необходимое"
   ============================= */
const InlineDemoHero = ({ mode, onBack }: { mode: string; onBack: () => void }) => {
  const [currentStep, setCurrentStep] = React.useState(1); // Начинаем сразу с выбора подрежима (для ai-plan) или обработки (для photo-cleanup)
  const [selectedMode, setSelectedMode] = React.useState(mode === 'ai-plan' ? 'Создание техплана' : 'Удаление объектов');
  const [selectedSubMode, setSelectedSubMode] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isBlurred, setIsBlurred] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [progressPercentage, setProgressPercentage] = React.useState(0);

  React.useEffect(() => {
    // Для режима photo-cleanup сразу начинаем обработку
    if (mode === 'photo-cleanup') {
      setCurrentStep(2);
      setTimeout(() => {
        startProcessing();
      }, 300);
    } else {
      // Для ai-plan показываем выбор подрежима
      setCurrentStep(1);
    }
  }, [mode]);

  const handleSubModeSelect = (subMode: string) => {
    setSelectedSubMode(subMode);
    setCurrentStep(2);
    setTimeout(() => {
      startProcessing();
    }, 300);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setIsBlurred(true);
    setCountdown(6);
    setProgressPercentage(0);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 6000) * 100, 100);
      setProgressPercentage(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 50);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsBlurred(false);
      setCurrentStep(3);
      setProgressPercentage(100);
    }, 6000);
  };

  const getBeforeImage = () => {
    if (selectedMode === 'Удаление объектов') return '/latar/past_deleteobjects.jpg';
    if (selectedSubMode === 'С мебелью') return '/latar/past_testplanmeb.jpg';
    if (selectedSubMode === 'Без мебели') return '/latar/past_testplan.jpg';
    return '/latar/past_testplan.jpg';
  };

  const getAfterImage = () => {
    if (selectedMode === 'Удаление объектов') return '/latar/rdy_deleteobjects.jpg';
    if (selectedSubMode === 'С мебелью') return '/latar/rdy_testplanmeb.jpg';
    if (selectedSubMode === 'Без мебели') return '/latar/rdy_testplan.jpg';
    return '/latar/rdy_testplan.jpg';
  };

  const getTitle = () => {
    if (mode === 'ai-plan') return 'AI 2D-план';
    if (mode === 'photo-cleanup') return 'Очистка фото';
    return '';
  };

  return (
    <div className="relative">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{getTitle()}</h2>
      </motion.div>

      {/* Шаги с анимацией */}
      <AnimatePresence mode="wait">
      {/* Step 1: Sub-mode selection (только для ai-plan) */}
      {currentStep === 1 && mode === 'ai-plan' && (
        <motion.div
          key="step-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleSubModeSelect('С мебелью')}
              className="group relative overflow-hidden p-6 rounded-md border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="font-bold text-white text-lg uppercase tracking-wider">С МЕБЕЛЬЮ</div>
              </div>
            </button>
            
            <button
              onClick={() => handleSubModeSelect('Без мебели')}
              className="group relative overflow-hidden p-6 rounded-md border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="font-bold text-white text-lg uppercase tracking-wider">БЕЗ МЕБЕЛИ</div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Processing */}
      {currentStep === 2 && (
        <motion.div
          key="step-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/50 backdrop-blur-sm p-8">
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }} />
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-2">СТАТУС ОБРАБОТКИ</div>
                <div className="font-bold text-white text-2xl mb-2 uppercase tracking-wider">
                  {isProcessing ? 'ОБРАБОТКА...' : 'ЗАВЕРШЕНО'}
                </div>
                <div className="text-sm text-zinc-400 font-mono">
                  {isProcessing ? `Осталось: ${countdown}с | Время: 6.0с` : 'Время выполнения: 6.0с'}
                </div>
              </div>

              <div className="mb-8">
                <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-white to-zinc-300 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                  <span>0%</span>
                  <span className="text-white font-bold">
                    {isProcessing ? `${Math.round(progressPercentage)}%` : '100%'}
                  </span>
                </div>
              </div>

              {/* Processing steps - сокращенная версия для компактности */}
              <div className="flex items-center justify-between relative">
                {[
                  { icon: '↑', label: 'ЗАГРУЗКА', threshold: 0 },
                  { icon: '⚙', label: 'АНАЛИЗ', threshold: 20 },
                  { icon: '⚡', label: 'ГЕНЕРАЦИЯ', threshold: 40 },
                  { icon: '💡', label: 'ОПТИМИЗАЦИЯ', threshold: 60 },
                  { icon: '↓', label: 'ЭКСПОРТ', threshold: 80 }
                ].map((step, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-2"></div>}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-md border-2 shadow-2xl flex items-center justify-center transition-all duration-1000 ${
                        progressPercentage >= step.threshold 
                          ? 'border-white/80 bg-gradient-to-br from-white/20 to-white/5 shadow-white/30' 
                          : 'border-white/10 bg-gradient-to-br from-white/5 to-black/20'
                      }`}>
                        <span className={`text-lg transition-all duration-1000 ${
                          progressPercentage >= step.threshold ? 'opacity-100' : 'opacity-30'
                        }`}>{step.icon}</span>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-bold uppercase tracking-wider transition-all duration-1000 ${
                          progressPercentage >= step.threshold ? 'text-white' : 'text-white/40'
                        }`}>{step.label}</div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Result */}
      {currentStep === 3 && (
        <motion.div
          key="step-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before image */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/30 backdrop-blur-sm p-4">
                <div className="text-center mb-4">
                  <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider">ИСХОДНОЕ ИЗОБРАЖЕНИЕ</div>
                </div>
                <img 
                  src={getBeforeImage()} 
                  alt="Before" 
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>

            {/* After image */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/30 backdrop-blur-sm p-4">
                <div className="text-center mb-4">
                  <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider">РЕЗУЛЬТАТ ОБРАБОТКИ</div>
                </div>
                <img 
                  src={getAfterImage()} 
                  alt="After" 
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={onBack}
              className="group relative overflow-hidden px-6 py-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 text-white font-medium flex items-center gap-2">
                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
                Вернуться назад
              </span>
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

const DemoHero = () => {
  const [currentStep, setCurrentStep] = React.useState(0); // 0: initial, 1: mode selection, 2: sub-mode selection, 3: processing, 4: result
  const [selectedMode, setSelectedMode] = React.useState('');
  const [selectedSubMode, setSelectedSubMode] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isBlurred, setIsBlurred] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [progressPercentage, setProgressPercentage] = React.useState(0);

  const handleTryDemo = () => {
    setCurrentStep(1);
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    if (mode === 'Удаление объектов') {
      setCurrentStep(3);
      startProcessing();
    } else {
      setCurrentStep(2);
    }
  };

  const handleSubModeSelect = (subMode: string) => {
    setSelectedSubMode(subMode);
    setCurrentStep(3);
    startProcessing();
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setIsBlurred(true);
    setCountdown(6); // Устанавливаем 6 секунд
    setProgressPercentage(0);
    
    // Обратный отсчет
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Анимация процента - привязанная к времени
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 6000) * 100, 100); // 6 секунд = 100%
      setProgressPercentage(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 50); // Обновляем каждые 50мс для плавности
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsBlurred(false);
      setCurrentStep(4);
      setProgressPercentage(100);
    }, 6000); // 6 секунд
  };

  const handleGoBack = () => {
    setCurrentStep(0);
    setSelectedMode('');
    setSelectedSubMode('');
    setIsProcessing(false);
    setIsBlurred(false);
    setCountdown(0);
    setProgressPercentage(0);
  };

  const getBeforeImage = () => {
    if (selectedMode === 'Удаление объектов') return '/latar/past_deleteobjects.jpg';
    if (selectedSubMode === 'С мебелью') return '/latar/past_testplanmeb.jpg';
    if (selectedSubMode === 'Без мебели') return '/latar/past_testplan.jpg';
    return '/latar/past_testplan.jpg';
  };

  const getAfterImage = () => {
    if (selectedMode === 'Удаление объектов') return '/latar/rdy_deleteobjects.jpg';
    if (selectedSubMode === 'С мебелью') return '/latar/rdy_testplanmeb.jpg';
    if (selectedSubMode === 'Без мебели') return '/latar/rdy_testplan.jpg';
    return '/latar/rdy_testplan.jpg';
  };
  
  return (
    <div className="relative overflow-hidden bg-black">
      {/* Main content */}
      <div className="relative z-10 py-16 md:py-24">
        <Container>
          <div className="max-w-6xl mx-auto text-center">
            {/* Title that stays in place */}
            <FadeIn delay={0.2}>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Магия Plan AI
                <span className="block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                в действии
                </span>
              </h2>
            </FadeIn>
            
            {/* Step 0: Initial state */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FadeIn delay={0.1}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm text-zinc-300 mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Демонстрация Plan AI
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.3}>
                  <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Загрузите фото → выберите режим → получите результат за секунды. 
                    Никаких сложных настроек, только результат.
                  </p>
                </FadeIn>
                
                <FadeIn delay={0.4}>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button 
                      onClick={handleTryDemo}
                      className="group relative overflow-hidden px-8 py-4 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 text-white font-medium flex items-center gap-2">
                        <span>Попробовать демо-версию</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                    
                    <div className="flex items-center gap-3 text-zinc-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-200"></div>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-400"></div>
                      </div>
                      <span className="text-sm font-medium">Без регистрации • Мгновенный результат</span>
                    </div>
                  </div>
                </FadeIn>
              </motion.div>
            )}
            
            {/* Step 1: Mode selection */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleModeSelect('Создание техплана')}
                    className="group relative overflow-hidden p-6 rounded-md border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-2">МОДУЛЬ</div>
                      <div className="font-bold text-white text-lg mb-2 uppercase tracking-wider">СОЗДАНИЕ ТЕХПЛАНА</div>
                      <div className="text-sm text-zinc-400 font-mono">Генерация планов помещений</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleModeSelect('Удаление объектов')}
                    className="group relative overflow-hidden p-6 rounded-md border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-2">МОДУЛЬ</div>
                      <div className="font-bold text-white text-lg mb-2 uppercase tracking-wider">УДАЛЕНИЕ ОБЪЕКТОВ</div>
                      <div className="text-sm text-zinc-400 font-mono">Очистка изображений</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Sub-mode selection for tech plan */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSubModeSelect('С мебелью')}
                    className="group relative overflow-hidden p-6 rounded-md border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-2">РЕЖИМ</div>
                      <div className="font-bold text-white text-lg mb-2 uppercase tracking-wider">С МЕБЕЛЬЮ</div>
                      <div className="text-sm text-zinc-400 font-mono">Включая мебель и объекты</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleSubModeSelect('Без мебели')}
                    className="group relative overflow-hidden p-6 rounded-md border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-2">РЕЖИМ</div>
                      <div className="font-bold text-white text-lg mb-2 uppercase tracking-wider">БЕЗ МЕБЕЛИ</div>
                      <div className="text-sm text-zinc-400 font-mono">Только архитектура</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/50 backdrop-blur-sm p-8">
                  {/* Professional grid background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="h-full w-full" style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }} />
                  </div>
                  
                  <div className="relative z-10">
                    {/* Processing status */}
                    <div className="text-center mb-8">
                      <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-2">СТАТУС ОБРАБОТКИ</div>
                      <div className="font-bold text-white text-2xl mb-2 uppercase tracking-wider">
                        {isProcessing ? 'ОБРАБОТКА...' : 'ЗАВЕРШЕНО'}
                      </div>
                      <div className="text-sm text-zinc-400 font-mono">
                        {isProcessing ? `Осталось: ${countdown}с | Время: 6.0с` : 'Время выполнения: 6.0с'}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                      <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-white to-zinc-300 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.1, ease: "linear" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                        <span>0%</span>
                        <span className="text-white font-bold">
                          {isProcessing ? `${Math.round(progressPercentage)}%` : '100%'}
                        </span>
                      </div>
                    </div>

                    {/* Processing steps */}
                    <div className="flex items-center justify-between relative">
                      {/* Step 1: Upload */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-md border-2 shadow-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${
                          progressPercentage >= 0 
                            ? 'border-white/80 bg-gradient-to-br from-white/20 to-white/5 shadow-white/30' 
                            : 'border-white/10 bg-gradient-to-br from-white/5 to-black/20'
                        }`}>
                          {/* Плавный блюр эффект */}
                          {progressPercentage >= 0 && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                              initial={{ opacity: 0, x: '-100%' }}
                              animate={{ opacity: 1, x: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          <svg className={`w-6 h-6 transition-all duration-1000 ${
                            progressPercentage >= 0 ? 'text-white drop-shadow-2xl' : 'text-white/30'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className={`text-xs font-bold uppercase tracking-wider transition-all duration-1000 ${
                            progressPercentage >= 0 ? 'text-white' : 'text-white/40'
                          }`}>ЗАГРУЗКА</div>
                          <div className={`text-xs font-mono transition-all duration-1000 ${
                            progressPercentage >= 0 ? 'text-white/80' : 'text-white/20'
                          }`}>IMAGE.PNG</div>
                        </div>
                      </div>

                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-4"></div>

                      {/* Step 2: AI Processing */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-md border-2 shadow-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${
                          progressPercentage >= 20 
                            ? 'border-white/80 bg-gradient-to-br from-white/20 to-white/5 shadow-white/30' 
                            : 'border-white/10 bg-gradient-to-br from-white/5 to-black/20'
                        }`}>
                          {/* Плавный блюр эффект */}
                          {progressPercentage >= 20 && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                              initial={{ opacity: 0, x: '-100%' }}
                              animate={{ opacity: 1, x: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className={`w-6 h-6 transition-all duration-1000 ${
                              progressPercentage >= 20 ? 'text-white drop-shadow-2xl' : 'text-white/30'
                            }`}
                          >
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full" strokeWidth={2}>
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xs font-bold uppercase tracking-wider transition-all duration-1000 ${
                            progressPercentage >= 20 ? 'text-white' : 'text-white/40'
                          }`}>АНАЛИЗ</div>
                          <div className={`text-xs font-mono transition-all duration-1000 ${
                            progressPercentage >= 20 ? 'text-white/80' : 'text-white/20'
                          }`}>AI.PROCESSING</div>
                        </div>
                      </div>

                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-4"></div>

                      {/* Step 3: Generation */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-md border-2 shadow-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${
                          progressPercentage >= 40 
                            ? 'border-white/80 bg-gradient-to-br from-white/20 to-white/5 shadow-white/30' 
                            : 'border-white/10 bg-gradient-to-br from-white/5 to-black/20'
                        }`}>
                          {/* Плавный блюр эффект */}
                          {progressPercentage >= 40 && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                              initial={{ opacity: 0, x: '-100%' }}
                              animate={{ opacity: 1, x: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-6 h-6 transition-all duration-1000 ${
                              progressPercentage >= 40 ? 'text-white drop-shadow-2xl' : 'text-white/30'
                            }`}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xs font-bold uppercase tracking-wider transition-all duration-1000 ${
                            progressPercentage >= 40 ? 'text-white' : 'text-white/40'
                          }`}>ГЕНЕРАЦИЯ</div>
                          <div className={`text-xs font-mono transition-all duration-1000 ${
                            progressPercentage >= 40 ? 'text-white/80' : 'text-white/20'
                          }`}>PLAN.CREATE</div>
                        </div>
                      </div>

                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-4"></div>

                      {/* Step 4: Optimization */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-md border-2 shadow-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${
                          progressPercentage >= 60 
                            ? 'border-white/80 bg-gradient-to-br from-white/20 to-white/5 shadow-white/30' 
                            : 'border-white/10 bg-gradient-to-br from-white/5 to-black/20'
                        }`}>
                          {/* Плавный блюр эффект */}
                          {progressPercentage >= 60 && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                              initial={{ opacity: 0, x: '-100%' }}
                              animate={{ opacity: 1, x: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          <motion.div
                            animate={{ rotate: [0, 2, -2, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-6 h-6 transition-all duration-1000 ${
                              progressPercentage >= 60 ? 'text-white drop-shadow-2xl' : 'text-white/30'
                            }`}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </motion.div>
                    </div>
                        <div className="text-center">
                          <div className={`text-xs font-bold uppercase tracking-wider transition-all duration-1000 ${
                            progressPercentage >= 60 ? 'text-white' : 'text-white/40'
                          }`}>ОПТИМИЗАЦИЯ</div>
                          <div className={`text-xs font-mono transition-all duration-1000 ${
                            progressPercentage >= 60 ? 'text-white/80' : 'text-white/20'
                          }`}>FINALIZE</div>
                        </div>
                      </div>

                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-4"></div>

                      {/* Step 5: Export */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-md border-2 shadow-2xl flex items-center justify-center transition-all duration-1000 relative overflow-hidden ${
                          progressPercentage >= 80 
                            ? 'border-white/80 bg-gradient-to-br from-white/20 to-white/5 shadow-white/30' 
                            : 'border-white/10 bg-gradient-to-br from-white/5 to-black/20'
                        }`}>
                          {/* Плавный блюр эффект */}
                          {progressPercentage >= 80 && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                              initial={{ opacity: 0, x: '-100%' }}
                              animate={{ opacity: 1, x: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          <motion.div
                            animate={{ y: [0, -1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-6 h-6 transition-all duration-1000 ${
                              progressPercentage >= 80 ? 'text-white drop-shadow-2xl' : 'text-white/30'
                            }`}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xs font-bold uppercase tracking-wider transition-all duration-1000 ${
                            progressPercentage >= 80 ? 'text-white' : 'text-white/40'
                          }`}>ЭКСПОРТ</div>
                          <div className={`text-xs font-mono transition-all duration-1000 ${
                            progressPercentage >= 80 ? 'text-white/80' : 'text-white/20'
                          }`}>FILES.READY</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Result */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-6xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Before image */}
                  <div className="group relative">
                    <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/30 backdrop-blur-sm p-4">
                      <div className="text-center mb-4">
                        <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider">ИСХОДНОЕ ИЗОБРАЖЕНИЕ</div>
                      </div>
                      <img 
                        src={getBeforeImage()} 
                        alt="Before" 
                        className="w-full h-auto rounded-md group-hover:blur-sm transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="px-4 py-2 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 text-white font-medium text-sm">
                          Начать создание
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* After image */}
                  <div className="group relative">
                    <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/30 backdrop-blur-sm p-4">
                      <div className="text-center mb-4">
                        <div className="text-sm font-mono text-zinc-400 uppercase tracking-wider">РЕЗУЛЬТАТ ОБРАБОТКИ</div>
                      </div>
                      <div className="relative">
                      <img 
                        src={getAfterImage()} 
                        alt="After" 
                          className={`w-full h-auto rounded-md transition-all duration-500 ${
                            isBlurred ? 'blur-md scale-105' : 'blur-0 scale-100'
                          }`}
                        />
                        
                        {/* Крутой оверлей с обратным отсчетом */}
                        {isBlurred && (
                          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/60 to-black/80 backdrop-blur-sm flex items-center justify-center rounded-md">
                            <div className="text-center">
                              <div className="relative">
                                {/* Анимированный круг обратного отсчета */}
                                <div className="w-32 h-32 mx-auto mb-6 relative">
                                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke="rgba(255,255,255,0.1)"
                                      strokeWidth="8"
                                    />
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke="url(#gradient)"
                                      strokeWidth="8"
                                      strokeLinecap="round"
                                      strokeDasharray={`${2 * Math.PI * 45}`}
                                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (6 - countdown) / 6)}`}
                                      className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="50%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white font-mono">
                                      {countdown}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Стильный текст */}
                                <div className="space-y-2">
                                  <div className="text-2xl font-bold text-white font-mono tracking-wider">
                                    ГЕНЕРАЦИЯ
                                  </div>
                                  <div className="text-lg text-purple-300 font-mono">
                                    {countdown > 0 ? 'ОБРАБОТКА...' : 'ЗАВЕРШЕНО'}
                                  </div>
                                  <div className="text-sm text-zinc-400 font-mono">
                                    {countdown > 0 ? `Прогресс: ${Math.round(progressPercentage)}%` : 'Результат готов!'}
                                  </div>
                                </div>
                                
                                {/* Анимированные точки */}
                                {countdown > 0 && (
                                  <div className="flex justify-center space-x-1 mt-4">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="px-4 py-2 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 text-white font-medium text-sm">
                          Начать создание
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back button */}
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={handleGoBack}
                    className="group relative overflow-hidden px-6 py-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 text-white font-medium flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
                      Вернуться назад
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};



/* =============================
   Modal Component
   ============================= */
const Modal = ({ isOpen, onClose, title, content, stats }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  stats?: { value: string; label: string }[];
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border border-white/20 rounded-lg custom-scrollbar"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
      </div>
        
          <div className="space-y-6">
            {content}
            
            {stats && (
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
        </div>
                ))}
        </div>
            )}
        </div>
      </div>
      </motion.div>
    </div>
  );
};

/* =============================
   Contact form (dummy)
   ============================= */
function ContactForm() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [dataConsent, setDataConsent] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => { 
        e.preventDefault(); 
        if (!dataConsent) {
          alert("Пожалуйста, дайте согласие на обработку персональных данных");
          return;
        }
        setSent(true); 
      }}
      className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <input
        required
        type="text"
        value={company}
        onChange={(e)=> setCompany(e.target.value)}
        placeholder="Компания"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 transition-all"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholder="Рабочая почта"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 transition-all"
      />
      <input
        required
        type="tel"
        value={phone}
        onChange={(e)=> setPhone(e.target.value)}
        placeholder="Телефон"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 transition-all"
      />
      <input
        required
        type="text"
        value={city}
        onChange={(e)=> setCity(e.target.value)}
        placeholder="Город"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 transition-all"
      />
      <select
        value={contactMethod}
        onChange={(e)=> setContactMethod(e.target.value)}
        className="md:col-span-2 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 transition-all text-zinc-400"
      >
        <option value="">Предпочтительный способ связи (необязательно)</option>
        <option value="email">Email</option>
        <option value="phone">Телефон</option>
        <option value="telegram">Telegram</option>
        <option value="whatsapp">WhatsApp</option>
      </select>
      <div className="md:col-span-2 flex items-start gap-3">
        <input
          required
          type="checkbox"
          id="dataConsent"
          checked={dataConsent}
          onChange={(e)=> setDataConsent(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-zinc-100 focus:ring-2 focus:ring-white/10 cursor-pointer"
        />
        <label htmlFor="dataConsent" className="text-sm text-zinc-300 cursor-pointer">
          Я даю согласие на обработку персональных данных и соглашаюсь с{" "}
          <a href="/privacy" className="text-zinc-100 hover:underline">политикой конфиденциальности</a>
        </label>
      </div>
      <button 
        type="submit"
        className="md:col-span-2 rounded-md border border-white/20 bg-zinc-100 text-zinc-950 px-6 py-3 text-sm font-medium hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Запросить пилот <ArrowRight className="inline h-4 w-4 ml-1 align-middle" />
      </button>
      {sent && (
        <div className="md:col-span-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-md px-4 py-3">
          ✓ Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.
        </div>
      )}
    </form>
  );
}

/* =============================
   Contact Form Section Component
   ============================= */
function ContactFormSection() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [dataConsent, setDataConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!dataConsent) {
      setError("Необходимо дать согласие на обработку персональных данных");
      return;
    }
    
    setLoading(true);
    
    // Симуляция отправки заявки
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/20 mb-6">
          <Check className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-semibold text-zinc-50 mb-3">
          Заявка успешно отправлена!
        </h3>
        <p className="text-zinc-400 mb-6">
          Спасибо за интерес к нашему сервису. Мы свяжемся с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
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
            id="dataConsentMain"
            checked={dataConsent}
            onChange={(e) => setDataConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/10 bg-white/5 text-zinc-100 focus:ring-2 focus:ring-white/10 cursor-pointer"
          />
          <label htmlFor="dataConsentMain" className="text-sm text-zinc-300 cursor-pointer leading-relaxed">
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
    </div>
  );
}

/* =============================
   Photo Cleanup Interactive Demo Component
   ============================= */

const PhotoCleanupDemo: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [statusText, setStatusText] = useState('Очистка фотографий от архитектурного мусора');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileImages = {
    'kitchen.jpg': '/latar/do1.jpg',
    'living_room.jpg': '/latar/do2.jpg',
    'bedroom_interior.jpg': '/latar/do3.jpg'
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    setShowResults(false);
    setStatusText('Загрузка данных');
    
    // Симулируем загрузку
    setTimeout(() => {
      setStatusText('Обработка изображений');
    }, 1000);

    // Симулируем обработку
    setTimeout(() => {
      setStatusText('Применение AI-фильтров');
    }, 2200);

    setTimeout(() => {
      setStatusText('Финализация результатов');
    }, 3400);

    setTimeout(() => {
      setStatusText('Экспорт');
    }, 4400);
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
      setStatusText('Очистка фотографий от архитектурного мусора');
      setResults([1, 2, 3]); // 3 результата
    }, 5000);
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Attached Files Preview - Above the search bar */}
      <div className="flex flex-wrap gap-3 mb-4 w-[90%] mx-auto">
        <button 
          onClick={() => setSelectedImage(fileImages['kitchen.jpg'])}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/[0.15] transition-all duration-300 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-white/90 font-medium">kitchen.jpg</span>
            <span className="text-xs text-white/50">2.4 MB</span>
          </div>
        </button>
        <button 
          onClick={() => setSelectedImage(fileImages['living_room.jpg'])}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/[0.15] transition-all duration-300 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-white/90 font-medium">living_room.jpg</span>
            <span className="text-xs text-white/50">3.1 MB</span>
          </div>
        </button>
        <button 
          onClick={() => setSelectedImage(fileImages['bedroom_interior.jpg'])}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/[0.15] transition-all duration-300 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-white/90 font-medium">bedroom_interior.jpg</span>
            <span className="text-xs text-white/50">2.8 MB</span>
          </div>
        </button>
      </div>

      {/* Search Bar Container - Более угловатая и серая */}
      <div className="relative bg-zinc-800/60 rounded-lg border border-zinc-700/50 backdrop-blur-sm overflow-hidden w-[90%] mx-auto">
        <div className="flex items-center gap-3 p-3">
          {/* Paperclip Attach Button */}
          <button 
            className="flex-shrink-0 p-2.5 rounded-md bg-transparent cursor-default"
            disabled
          >
            <Paperclip className="h-5 w-5 text-zinc-400" />
          </button>

          {/* Centered Status Text */}
          <div className="flex-1 text-center py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={statusText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-zinc-300 text-sm md:text-base font-medium"
              >
                {statusText}
                {isProcessing && (
                  <span className="inline-block">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse delay-75">.</span>
                    <span className="animate-pulse delay-150">.</span>
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-white/20"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="group relative"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300">
                    {/* Placeholder Image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="inline-block px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                          <span className="text-white/60 font-mono text-xs">ОЧИЩЕНО</span>
                        </div>
                        <div className="text-white/40 text-xs">Вариант {idx + 1}</div>
                      </div>
                    </div>
                    
                    {/* AI Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30">
                        <span className="text-white/90 font-mono text-xs">AI</span>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <button className="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
                        <Download className="h-3 w-3" />
                        Скачать
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal - Rendered via Portal to avoid parent effects */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 cursor-pointer"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-3xl max-h-[70vh] p-4"
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-[65vh] rounded-lg border border-white/20 shadow-2xl object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

/* =============================
   Business Process Modal Component
   ============================= */

interface BusinessProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessProcessModal: React.FC<BusinessProcessModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    phone: '',
    city: '',
    contactMethod: '',
    description: '',
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Имитация отправки данных
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Закрываем модальное окно через 2 секунды после успеха
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({
        company: '',
        email: '',
        phone: '',
        city: '',
        contactMethod: '',
        description: '',
        agreeToTerms: false
      });
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-zinc-900 to-black border border-white/20 cursor-default overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Content */}
          <div className="overflow-y-auto max-h-[90vh] custom-scrollbar p-8">
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Спасибо за обращение!</h3>
                <p className="text-white/70 text-center">Мы свяжемся с вами в ближайшее время</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Обсудим детали проекта
                  </h2>
                  <p className="text-white/70">
                    Заполните форму, и мы свяжемся с вами для обсуждения вашего бизнес-процесса
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Компания */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white/90 mb-2">
                      Компания <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Название компании"
                    />
                  </div>

                  {/* Рабочая почта */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Рабочая почта <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="email@company.com"
                    />
                  </div>

                  {/* Телефон */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">
                      Телефон <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  {/* Город */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-white/90 mb-2">
                      Город <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Москва"
                    />
                  </div>

                  {/* Предпочтительный способ связи */}
                  <div>
                    <label htmlFor="contactMethod" className="block text-sm font-medium text-white/90 mb-2">
                      Предпочтительный способ связи <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="contactMethod"
                      name="contactMethod"
                      value={formData.contactMethod}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Телефон, Email, Telegram, WhatsApp..."
                    />
                  </div>

                  {/* Краткое описание бизнес-процесса */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-2">
                      Краткое описание бизнес-процесса <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors resize-none"
                      placeholder="Опишите процесс, который хотите автоматизировать..."
                    />
                  </div>

                  {/* Согласие на обработку персональных данных */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      className="mt-1 w-4 h-4 bg-white/5 border border-white/20 text-white focus:ring-white/40"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-white/70 leading-relaxed">
                      Я соглашаюсь на обработку персональных данных и соглашаюсь с{' '}
                      <a href="#" className="text-white/90 underline hover:text-white transition-colors">
                        политикой конфиденциальности
                      </a>
                    </label>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.agreeToTerms}
                    className="w-full mt-6 bg-white/10 text-white px-8 py-4 font-bold hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        Отправить заявку
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

/* =============================
   Main HomePage Component
   ============================= */

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);
  const [featuresMousePosition, setFeaturesMousePosition] = useState({ x: 0, y: 0 });
  const [activeDemoMode, setActiveDemoMode] = useState<string | null>(null);
  const [showBusinessProcessModal, setShowBusinessProcessModal] = useState(false);

  const handleTexSchemeRedirect = () => {
    navigate('/new');
  };

  const toggleFaqItem = (index: number) => {
    setOpenFaqItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const handleConstructorRedirect = () => {
    navigate('/constructor');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleFeaturesMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFeaturesMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <main className="relative min-h-screen bg-black text-zinc-100 antialiased selection:bg-zinc-300 selection:text-zinc-900 pt-14">
      {/* Background effects */}
      {/* <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(black_1px,transparent_1px)] [background-size:6px_6px]" /> */}
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
            <a href="#" className="group inline-flex items-center gap-1.5">
              <img src="/latar/logo.svg" alt="Логотип" className="h-7 w-7" />
              <span className="text-[1.375rem] font-medium text-zinc-200 group-hover:text-white transition">Arcplan</span>
            </a>
          </div>
          
          {/* Center section - Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
              <div className="relative group">
                <a className="hover:text-zinc-100 transition cursor-pointer" href="#features">
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
              <button onClick={() => navigate('/pricing')} className="hover:text-zinc-100 transition">Тарифы</button>
              <button onClick={() => navigate('/examples')} className="hover:text-zinc-100 transition">Примеры работ</button>
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
                <a 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm" 
                  href="#features"
                  onClick={closeMobileMenu}
                >
                  Возможности
                </a>
                <button 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm text-left" 
                  onClick={() => { navigate('/pricing'); closeMobileMenu(); }}
                >
                  Тарифы
                </button>
                <button 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm text-left" 
                  onClick={() => { navigate('/examples'); closeMobileMenu(); }}
                >
                  Примеры работ
                </button>
                <button 
                  className="text-zinc-400 hover:text-zinc-100 transition py-1.5 text-sm" 
                  onClick={() => { navigate('/contacts'); closeMobileMenu(); }}
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

      {/* Hero */}
      <Section id="hero" className="overflow-hidden">
        <div className="relative">
          <Glow />
          <Container className="pt-10 pb-14 md:pt-14 md:pb-18">

            <SlideInFromLeft delay={0.2}>
              <h1 className="mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight" style={{ fontFamily: 'New York, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Plan AI превращает фотографии в<br />
                идеальные планировки за секунды
            </h1>
            </SlideInFromLeft>

            <SlideInFromLeft delay={0.6}>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Система создания планировки и очистки помещений.<br />
              Оптимизация задач и надежность результата.
              </p>
            </SlideInFromLeft>

            <SlideInFromLeft delay={1.0}>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button onClick={handleTexSchemeRedirect} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition">
                Начать создание
              </button>
                <button onClick={handleConstructorRedirect} className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                  <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Попробовать демо</span>
                  <ArrowRight className="h-4 w-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
              </button>
            </div>
            </SlideInFromLeft>

            {/* Diagonal Hero visual */}
            <motion.div style={{ y }} className="mt-8 md:mt-12">
            <HeroDiagonal
              images={{
                hero1: "/latar/uploads/hero1.webp",
                hero2: "/latar/uploads/hero2_cropped.webp",
                hero3: "/latar/uploads/hero3_cropped.webp",
                hero4: "/latar/uploads/hero4_cropped.webp",
                hero5: "/latar/uploads/hero5_cropped.webp",
                hero6: "/latar/uploads/hero6.webp",
                debug_struct_full: "/latar/uploads/debug_struct_full.webp",
                debug_plan_roi: "/latar/uploads/debug_plan_roi.webp",
              }}
              className="h-[520px] md:h-720px]"
              />
            </motion.div>

          </Container>
        </div>
      </Section>

      {/* Client Logos Section */}
      <Section id="clients" className="py-4 md:py-6 pb-16 md:pb-20">
        <Container>
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Инструменты для организаций любого масштаба
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                От стартапов до крупных предприятий — Arcplan поможет создать идеальные планировки
              </p>
            </FadeIn>
          </div>

          <div className="relative">
            {/* Client logos grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 items-center justify-items-center">
              {[
                { name: "1", logo: "-", fontStyle: "font-serif font-bold tracking-wide " },
                { name: "АЛАТАРЦЕВ", logo: "АЛАТАРЦЕВ", fontStyle: "font-mono font-extrabold tracking-wider" },
                { name: "3", logo: "-", fontStyle: "font-sans font-black uppercase tracking-tight" },
                { name: "4", logo: "-", fontStyle: "font-sans font-light italic" },
                { name: "5", logo: "-", fontStyle: "font-sans font-medium lowercase" },
                { name: "6", logo: "-", fontStyle: "font-sans font-semibold tracking-wide" }
              ].map((client, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="relative">
                    <div className={`text-2xl md:text-3xl text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300 ${client.fontStyle}`}>
                      {client.logo}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

          </div>
        </Container>
      </Section>

      {/* Enhanced Features - Linear Style */}
      <Section id="features" className="py-0">
        <div className="relative overflow-hidden" onMouseMove={handleFeaturesMouseMove}>
          {/* Diagonal background with mouse interaction */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.05]" />
          
          {/* Animated floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5 blur-xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-lg animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white/5 blur-md animate-pulse delay-500" />
          
          {/* Mouse-following elements */}
          <div 
            className="absolute w-32 h-32 rounded-full bg-white/5 blur-2xl transition-all duration-500 pointer-events-none"
            style={{
              left: `${featuresMousePosition.x * 100}%`,
              top: `${featuresMousePosition.y * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          
          {/* Edge fade to black - Top */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black via-black/30 via-black/10 to-transparent pointer-events-none z-20" />
          
          {/* Edge fade to black - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/30 via-black/10 to-transparent pointer-events-none z-20" />
          
          <div className="relative z-10 py-20 md:py-28">
            <Container>
              <div className="max-w-6xl mx-auto">
            {/* Header - Linear style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
              {/* Left - Title */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Всё необходимое для современной работы
                </h2>
                      </div>

              {/* Right - Description */}
              <div className="text-left">
                <p className="text-lg text-white/80 leading-relaxed">
                  Три мощных инструмента: AI-план, очистка фото и конструктор с ИИ. 
                  Быстрая обработка, точные результаты, профессиональное качество. 
                  Сделайте переход к новому уровню работы с планировками.{" "}
                  <button 
                    onClick={handleTexSchemeRedirect}
                    className="text-white font-semibold hover:text-white/80 transition-colors duration-300 underline decoration-white/60 hover:decoration-white inline-flex items-center gap-2 group"
                  >
                    Начать
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 animate-pulse" />
                  </button>
                </p>
                        </div>
                      </div>

            {/* Показываем либо InlineDemoHero, либо карточки */}
            <AnimatePresence mode="wait">
            {activeDemoMode ? (
              <motion.div 
                key="demo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <InlineDemoHero 
                  mode={activeDemoMode} 
                  onBack={() => setActiveDemoMode(null)} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
            {/* Three feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: 'ai-plan',
                  title: 'AI 2D-план',
                  image: '/latar/rdy_testplan.jpg',
                  description: 'Автоматическое создание точных 2D-планов из фотографий техпланов',
                  hasDemo: true,
                  stats: [
                    { value: '99.2%', label: 'Точность распознавания' },
                    { value: '2.3s', label: 'Среднее время обработки' }
                  ],
                  content: (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Основные возможности</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Автоматическое распознавание стен и объектов
                          </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Экспорт в PNG, SVG, PDF форматы
                          </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Высокая точность воспроизведения
                        </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Работа с любыми фотографиями
                        </div>
                      </div>
                          </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Технические характеристики</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Разрешение входа:</span>
                              <span className="text-white">до 4K</span>
                          </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Поддерживаемые форматы:</span>
                              <span className="text-white">JPG, PNG, WEBP</span>
                        </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Максимальный размер:</span>
                              <span className="text-white">50MB</span>
                        </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">API лимит:</span>
                              <span className="text-white">1000/месяц</span>
                      </div>
                    </div>
                      </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-2">Как это работает</h4>
                        <p className="text-white/80 text-sm leading-relaxed">
                          Загрузите фото техплана (в том числе сделанное на телефон), выберите режим 
                          с мебелью или без мебели, получите аккуратный 2D-план в формате PNG/SVG.
                          Наш ИИ анализирует изображение и создает точную векторную схему помещения.
                        </p>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'photo-cleanup',
                  title: 'Очистка фото',
                  image: '/latar/past_deleteobjects.jpg',
                  description: 'Умное удаление мебели и объектов с сохранением архитектуры',
                  hasDemo: true,
                  stats: [
                    { value: '95%', label: 'Качество очистки' },
                    { value: '1.8s', label: 'Время обработки' }
                  ],
                  content: (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Возможности очистки</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Умное удаление мебели и объектов
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Сохранение архитектуры и стен
                          </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Реалистичное восстановление фона
                          </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Сохранение освещения и теней
                          </div>
                        </div>
                      </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Технические параметры</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Скорость обработки:</span>
                              <span className="text-white">1.8 секунды</span>
                </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Качество очистки:</span>
                              <span className="text-white">95%</span>
              </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Поддержка форматов:</span>
                              <span className="text-white">JPG, PNG, WEBP</span>
            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Максимальное разрешение:</span>
                              <span className="text-white">8K</span>
          </div>
                  </div>
                  </div>
                </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-2">Применение</h4>
                        <p className="text-white/80 text-sm leading-relaxed">
                          Идеально для подготовки помещений к продаже, создания чистых планировок, 
                          удаления временных объектов. Сохраняет оригинальную архитектуру и освещение.
                        </p>
          </div>
                    </div>
                  )
                },
                {
                  id: 'constructor-ai',
                  title: 'Конструктор + ИИ',
                  image: '/latar/rdy_testplanmeb.jpg',
                  description: 'Создание планов в конструкторе с AI-расстановкой мебели',
                  hasDemo: false,
                  stats: [
                    { value: '3D', label: 'Превью в реальном времени' },
                    { value: '10+', label: 'Типов мебели' },
                    { value: '1000+', label: 'Элементов в библиотеке' }
                  ],
                  content: (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Функции конструктора</h3>
                    <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Интуитивный drag-and-drop интерфейс
                  </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              AI-расстановка мебели по комнатам
                    </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              3D превью результата в реальном времени
                  </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                              Библиотека из 1000+ элементов мебели
                </div>
          </div>
            </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-4">Технические возможности</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Типы мебели:</span>
                              <span className="text-white">10+ категорий</span>
                        </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">3D превью:</span>
                              <span className="text-white">В реальном времени</span>
                      </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Экспорт форматов:</span>
                              <span className="text-white">PNG, SVG, PDF, DWG</span>
                  </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Совместная работа:</span>
                              <span className="text-white">До 5 пользователей</span>
                </div>
              </div>
            </div>
                        </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-2">Рабочий процесс</h4>
                        <p className="text-white/80 text-sm leading-relaxed">
                          Соберите 2D-план из простых блоков, загрузите фото для каждой комнаты 
                          и отредактируйте мебель. AI автоматически предложит оптимальную расстановку, 
                          а 3D превью покажет результат. Сгенерируйте финальный план и экспортируйте.
                        </p>
                      </div>
                  </div>
                  )
                }
              ].map((feature, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="group relative overflow-hidden rounded-lg bg-white/5 border border-gray-800/30 hover:bg-white/10 transition-all duration-500">
                    {/* Professional Graphics */}
                    <div className="aspect-video p-8 flex items-center justify-center">
                      {i === 0 && (
                        // AI 2D-план - Professional status display
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-32 h-20">
                              {/* Status bar */}
                              <div className="absolute top-0 left-0 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-white/60 to-white/40 rounded-full animate-pulse"></div>
                </div>
                  
                              {/* Main status text */}
                              <div className="absolute top-4 left-0 w-full text-center">
                                <div className="text-white font-mono text-sm tracking-wider">AI.PROCESSING</div>
                                <div className="text-white/60 font-mono text-xs mt-1">2D_PLAN_GENERATION</div>
            </div>
                  
                              {/* Progress indicators */}
                              <div className="absolute bottom-0 left-0 w-full flex justify-between">
                                <div className="text-white/40 font-mono text-xs">LOADING</div>
                                <div className="text-white/40 font-mono text-xs">ANALYZING</div>
                                <div className="text-white/40 font-mono text-xs">GENERATING</div>
                        </div>
                      </div>
                  </div>
                </div>
                      )}
                      
                      {i === 1 && (
                        // Очистка фото - Speed processing display
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-32 h-20">
                              {/* Speed indicator */}
                              <div className="absolute top-0 left-0 w-full text-center">
                                <div className="text-white font-mono text-2xl font-bold">50ms</div>
                                <div className="text-white/60 font-mono text-xs mt-1">PROCESSING_TIME</div>
                </div>
                
                              {/* Speed lines */}
                              <div className="absolute bottom-0 left-0 w-full h-8 flex items-end justify-center space-x-1">
                                <div className="w-0.5 h-2 bg-white/60 animate-pulse"></div>
                                <div className="w-0.5 h-4 bg-white/60 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-0.5 h-6 bg-white/60 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-0.5 h-4 bg-white/60 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                                <div className="w-0.5 h-2 bg-white/60 animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
                  </div>
                </div>
                      )}
                      
                      {i === 2 && (
                        // Конструктор + ИИ - Grid system display
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-32 h-20">
                              {/* Grid system */}
                              <div className="absolute top-0 left-0 w-full h-full">
                                <div className="absolute top-0 left-0 w-full h-px bg-white/30"></div>
                                <div className="absolute top-1/3 left-0 w-full h-px bg-white/30"></div>
                                <div className="absolute top-2/3 left-0 w-full h-px bg-white/30"></div>
                                <div className="absolute top-0 left-0 w-px h-full bg-white/30"></div>
                                <div className="absolute top-0 left-1/3 w-px h-full bg-white/30"></div>
                                <div className="absolute top-0 left-2/3 w-px h-full bg-white/30"></div>
                                <div className="absolute top-0 left-full w-px h-full bg-white/30"></div>
              </div>
              
                              {/* System status */}
                              <div className="absolute top-2 left-2 text-white font-mono text-xs">GRID_SYSTEM</div>
                              <div className="absolute bottom-2 right-2 text-white/60 font-mono text-xs">ACTIVE</div>
                              
                              {/* Grid points */}
                              <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-white/80"></div>
                              <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-white/80"></div>
                  </div>
                </div>
              </div>
                      )}
            </div>
            
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4 gap-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors duration-300 flex-1">
                          {feature.title}
                        </h3>
                        <button
                          onClick={() => {
                            if (feature.hasDemo) {
                              setActiveDemoMode(feature.id);
                            }
                          }}
                          disabled={!feature.hasDemo}
                          className={`group relative flex items-center justify-end h-10 rounded-md border transition-all duration-300 overflow-hidden ${
                            feature.hasDemo 
                              ? 'w-10 hover:w-28 border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 cursor-pointer text-white shadow-sm hover:shadow-md' 
                              : 'w-10 border-white/10 bg-white/5 opacity-50 cursor-not-allowed text-white/40'
                          }`}
                        >
                          <span className={`text-sm font-medium whitespace-nowrap pr-2 transition-all duration-300 ${
                            feature.hasDemo 
                              ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' 
                              : 'opacity-0'
                          }`}>
                            Демо
                          </span>
                          <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      </div>
            
                      <p className="text-white/60 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
            </div>
              </motion.div>
            )}
            </AnimatePresence>
              </div>
            </Container>
          </div>
        </div>
      </Section>

      {/* Demo Hero Section - Закомментирована, так как функционал перенесен в секцию "Всё необходимое" */}
      {/* <Section id="demo" className="py-0">
        <DemoHero />
      </Section> */}

      {/* AI 2D-план Logic Section */}
      <Section id="ai-logic" className="py-20 md:py-28">
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Как работает AI 2D-план
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                Наша технология искусственного интеллекта анализирует фотографии помещений 
                и автоматически создает точные 2D-планы с правильными размерами и пропорциями. 
                Процесс занимает всего несколько секунд.{" "}
                <button
                  onClick={handleTexSchemeRedirect}
                  className="text-white font-semibold hover:text-white/80 transition-colors duration-300 inline-flex items-center gap-1 group"
                  style={{ verticalAlign: 'baseline' }}
                >
                  Подробнее
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Modular Images */}
              <FadeIn delay={0.1}>
                <div className="relative flex items-center justify-center py-16 px-2" style={{ perspective: '2000px' }}>
                  {/* Контейнер для обоих модулей с 3D наклоном */}
                  <div className="relative flex gap-0" style={{ 
                    transform: 'rotateY(-8deg) rotateX(5deg)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s ease'
                  }}>
                    {/* Модуль 1 - Левая половина (ДО) */}
                    <div className="relative w-[280px] sm:w-[320px] group">
                      <div className="relative aspect-[3/4] bg-black border-l-2 border-t-2 border-b-2 border-white/10 overflow-hidden hover:border-white/30 transition-all duration-300 shadow-2xl">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                          <div className="text-center space-y-4">
                            <div className="text-white/40 font-mono text-base tracking-wider">
                              ИСХОДНОЕ ФОТО
                            </div>
                            <div className="text-white/70 text-2xl font-bold">
                              ДО
                            </div>
                          </div>
                        </div>
                        {/* Split line indicator on right edge */}
                        <div className="absolute top-0 right-0 bottom-0 w-[3px] bg-gradient-to-b from-white/20 via-white/40 to-white/20"></div>
                        {/* Corner indicators */}
                        <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-white/30"></div>
                        <div className="absolute bottom-6 left-6 w-10 h-10 border-l-2 border-b-2 border-white/30"></div>
                      </div>
                    </div>
                    
                    {/* Модуль 2 - Правая половина (ПОСЛЕ, смещен вниз) */}
                    <div className="relative w-[280px] sm:w-[320px] group mt-16">
                      <div className="relative aspect-[3/4] bg-black border-r-2 border-t-2 border-b-2 border-white/10 overflow-hidden hover:border-white/30 transition-all duration-300 shadow-2xl">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                          <div className="text-center space-y-4">
                            <div className="text-white/40 font-mono text-base tracking-wider">
                              AI 2D-ПЛАН
                            </div>
                            <div className="text-white/70 text-2xl font-bold">
                              ПОСЛЕ
                            </div>
                          </div>
                        </div>
                        {/* Split line indicator on left edge */}
                        <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gradient-to-b from-white/20 via-white/40 to-white/20"></div>
                        {/* Corner indicators */}
                        <div className="absolute top-6 right-6 w-10 h-10 border-r-2 border-t-2 border-white/30"></div>
                        <div className="absolute bottom-6 right-6 w-10 h-10 border-r-2 border-b-2 border-white/30"></div>
                        {/* AI badge */}
                        <div className="absolute top-6 left-6 px-3 py-2 bg-white/10 backdrop-blur-sm rounded text-white/70 text-base font-mono">
                          AI
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Right - Process Description */}
              <FadeIn delay={0.2}>
                <div className="space-y-8">
                  {/* Step 1 */}
                  <div className="relative pl-8 border-l-2 border-white/20 hover:border-white/40 transition-colors duration-300">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white/90 ring-4 ring-black"></div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      1. Загрузка фотографий
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      Загрузите несколько фотографий помещения с разных ракурсов. 
                      AI автоматически определит границы стен, окна и двери.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-8 border-l-2 border-white/20 hover:border-white/40 transition-colors duration-300">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white/90 ring-4 ring-black"></div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      2. Анализ пространства
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      Нейросеть анализирует геометрию помещения, определяет масштаб 
                      и вычисляет точные размеры всех элементов планировки.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative pl-8 border-l-2 border-white/20 hover:border-white/40 transition-colors duration-300">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white/90 ring-4 ring-black"></div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      3. Создание 2D-плана
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      За несколько секунд AI генерирует готовый 2D-план с правильными 
                      пропорциями, который можно сразу использовать в работе.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </Container>
      </Section>

      {/* Photo Cleaning Section */}
      <Section id="photo-cleaning" className="py-0">
        <div className="relative overflow-hidden">
          {/* Diagonal background - сероватый фон как в "Всё необходимое" */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.05]" />
          
          {/* Animated floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5 blur-xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-lg animate-pulse delay-1000" />
          
          {/* Edge fade to black - Top */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black via-black/30 via-black/10 to-transparent pointer-events-none z-20" />
          
          {/* Edge fade to black - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/30 via-black/10 to-transparent pointer-events-none z-20" />
          
          <div className="relative z-10 py-20 md:py-28">
            <Container>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Очистка фото
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                Удалите мебель и лишние объекты с фотографий одним кликом. 
                AI восстанавливает фон и стены, создавая чистое изображение для презентаций.{" "}
                <button
                  onClick={handleTexSchemeRedirect}
                  className="text-white font-semibold hover:text-white/80 transition-colors duration-300 inline-flex items-center gap-1 group"
                  style={{ verticalAlign: 'baseline' }}
                >
                  Подробнее
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </p>
            </div>

            {/* Interactive Photo Cleanup Demo */}
            <FadeIn delay={0.4}>
              <PhotoCleanupDemo />
            </FadeIn>
              </div>
            </Container>
          </div>
        </div>
      </Section>

      {/* Constructor + AI Section */}
      <Section id="constructor-ai" className="py-20 md:py-28">
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Конструктор + ИИ
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                Создавайте планировки в визуальном редакторе и дополняйте их силой AI. 
                Перетаскивайте комнаты, формируйте планировку и генерируйте дизайн с помощью ИИ.{" "}
                <button
                  onClick={handleTexSchemeRedirect}
                  className="text-white font-semibold hover:text-white/80 transition-colors duration-300 inline-flex items-center gap-1 group"
                  style={{ verticalAlign: 'baseline' }}
                >
                  Подробнее
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </p>
            </div>

            {/* Interactive Constructor Preview */}
            <FadeIn delay={0.2}>
              <ConstructorPreview />
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Business Process Automation Section */}
      <Section id="automation" className="py-0">
        <div className="relative overflow-hidden">
          {/* Diagonal background - сероватый фон как в "Всё необходимое" */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.05]" />
          
          {/* Animated floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5 blur-xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-lg animate-pulse delay-1000" />
          
          {/* Edge fade to black - Top */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black via-black/30 via-black/10 to-transparent pointer-events-none z-20" />
          
          {/* Edge fade to black - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/30 via-black/10 to-transparent pointer-events-none z-20" />
          
          <div className="relative z-10 py-20 md:py-28">
            <Container>
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                    Автоматизация бизнес-процессов на заказ
                  </h2>
                  <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                    Создаём индивидуальные решения для автоматизации рутинных задач вашего бизнеса. 
                    Интеграции, отчёты, документооборот — освободите до 80% времени команды.
                  </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  {/* Left - Vertical Feature Cards */}
                  <FadeIn delay={0.1}>
                    <div className="space-y-4">
                      {/* Card 1 */}
                      <div className="relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.03] p-6 border border-white/10 hover:border-white/30 transition-all duration-500 group overflow-hidden backdrop-blur-sm">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Accent line left with gradient */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-white/40 via-white/20 to-white/10 group-hover:from-white/60 group-hover:via-white/40 group-hover:to-white/20 transition-all duration-500"></div>
                        
                        {/* Number badge with enhanced style */}
                        <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 border border-white/20 group-hover:border-white/40 bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                          <span className="text-xs font-mono text-white/70 group-hover:text-white font-bold">01</span>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="text-lg font-bold text-white mb-3 pr-12 group-hover:translate-x-1 transition-transform duration-300">
                            Интеграции и API
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                            Соединяем ваши системы в единую экосистему. CRM, ERP, бухгалтерия — всё работает автоматически, без ручного копирования данных.
                          </p>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.03] p-6 border border-white/10 hover:border-white/30 transition-all duration-500 group overflow-hidden backdrop-blur-sm">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Accent line left with gradient */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-white/40 via-white/20 to-white/10 group-hover:from-white/60 group-hover:via-white/40 group-hover:to-white/20 transition-all duration-500"></div>
                        
                        {/* Number badge with enhanced style */}
                        <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 border border-white/20 group-hover:border-white/40 bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                          <span className="text-xs font-mono text-white/70 group-hover:text-white font-bold">02</span>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="text-lg font-bold text-white mb-3 pr-12 group-hover:translate-x-1 transition-transform duration-300">
                            Аналитика и отчёты
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                            Дашборды в реальном времени, автогенерация отчётов и умные уведомления. Данные всегда под рукой в удобном формате.
                          </p>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.03] p-6 border border-white/10 hover:border-white/30 transition-all duration-500 group overflow-hidden backdrop-blur-sm">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Accent line left with gradient */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-white/40 via-white/20 to-white/10 group-hover:from-white/60 group-hover:via-white/40 group-hover:to-white/20 transition-all duration-500"></div>
                        
                        {/* Number badge with enhanced style */}
                        <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 border border-white/20 group-hover:border-white/40 bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                          <span className="text-xs font-mono text-white/70 group-hover:text-white font-bold">03</span>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="text-lg font-bold text-white mb-3 pr-12 group-hover:translate-x-1 transition-transform duration-300">
                            Документооборот
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                            Автоматизация создания, согласования и хранения документов. Больше никаких потерянных договоров и актов.
                          </p>
                        </div>
                      </div>

                      {/* Card 4 */}
                      <div className="relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.03] p-6 border border-white/10 hover:border-white/30 transition-all duration-500 group overflow-hidden backdrop-blur-sm">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Accent line left with gradient */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-white/40 via-white/20 to-white/10 group-hover:from-white/60 group-hover:via-white/40 group-hover:to-white/20 transition-all duration-500"></div>
                        
                        {/* Number badge with enhanced style */}
                        <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 border border-white/20 group-hover:border-white/40 bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                          <span className="text-xs font-mono text-white/70 group-hover:text-white font-bold">04</span>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="text-lg font-bold text-white mb-3 pr-12 group-hover:translate-x-1 transition-transform duration-300">
                            Под ваши процессы
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                            Каждый бизнес уникален. Создаём решения под ваши специфические процессы и требования. От MVP до полноценной системы.
                          </p>
                        </div>
                      </div>
                    </div>
                  </FadeIn>

                  {/* Right - CTA Card */}
                  <FadeIn delay={0.2}>
                    <div className="lg:sticky lg:top-8">
                      <div className="relative bg-white/5 p-8 md:p-10 border border-white/20 hover:border-white/30 transition-colors duration-300">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .15) 25%, rgba(255, 255, 255, .15) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .15) 75%, rgba(255, 255, 255, .15) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .15) 25%, rgba(255, 255, 255, .15) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .15) 75%, rgba(255, 255, 255, .15) 76%, transparent 77%, transparent)',
                            backgroundSize: '50px 50px'
                          }}></div>
                        </div>

                        <div className="relative z-10">
                          {/* CTA Content */}
                          <div className="text-left">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                              Снизим затраты и время на рутину
                            </h3>
                            
                            <p className="text-base text-white/70 mb-8 leading-relaxed">
                              За 1–3 дня найдём узкие места в ваших процессах и предложим архитектуру автоматизации с расчётом ROI.
                            </p>

                            {/* Объединенный блок */}
                            <div className="mb-6 p-5 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border border-white/10">
                              <h4 className="text-base font-bold text-white mb-4">Что делаем</h4>
                              <div className="space-y-2.5 mb-6 text-left">
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Аудит текущих процессов и потерь времени</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Карта узких мест + приоритеты</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Дорожная карта внедрения с оценкой сроков и рисков</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Экономический расчёт: трудозатраты → ROI/Payback</span>
                                </div>
                              </div>

                              <div className="h-px bg-white/10 mb-4"></div>

                              <h4 className="text-base font-bold text-white mb-4">Что вы получите</h4>
                              <div className="space-y-2.5 text-left">
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Понятный план на 1–3 спринта</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Точный прогноз экономии времени и бюджета</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                                  <span className="text-sm">Готовое предложение по архитектуре и стеку</span>
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => setShowBusinessProcessModal(true)}
                              className="group w-full bg-white/10 text-white px-8 py-4 font-bold hover:bg-white/15 transition-all duration-300 inline-flex items-center justify-center gap-3 border border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-white/5"
                            >
                              Обсудить детали
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </Section>

      {/* Professional FAQ */}
      <Section id="faq" className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <FadeIn>
                <div className="text-sm uppercase tracking-wider text-white/60 font-mono mb-4">FAQ</div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Частые вопросы
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  Ответы на популярные вопросы о работе с планами и услугах
                </p>
              </FadeIn>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Сколько времени занимает оцифровка плана квартиры?",
                  a: "Оцифровка происходит автоматически с помощью нейросети. Обработка одного плана занимает от нескольких минут до часа в зависимости от сложности и качества исходного изображения."
                },
                {
                  q: "Можно ли оцифровать план с рукописными пометками?",
                  a: "Да, наша нейросеть распознает планы даже с рукописными надписями, пометками и печатями. Система автоматически фильтрует лишние элементы и выделяет архитектурную структуру помещений."
                },
                {
                  q: "Что делать, если план квартиры нечеткий или старый?",
                  a: "Нейросеть обрабатывает даже старые и нечеткие планы. Система автоматически улучшает качество изображения, восстанавливает контуры стен и убирает шумы. Главное - чтобы основные элементы планировки были различимы."
                },
                {
                  q: "Что входит в услугу \"уборка архитектурного мусора\"?",
                  a: "Нейросеть автоматически удаляет с ваших фотографий все элементы интерьера - мебель, декор, технику. Вы получаете пак обработанных фотографий с чистыми помещениями и голыми стенами, готовых для визуализации ремонта или новой планировки."
                },
                {
                  q: "Что делать, если результат оцифровки не устроил?",
                  a: "Мы предоставляем бесплатную перегенерацию плана и очистки от архитектурного мусора, если результат не соответствует вашим ожиданиям."
                },
                {
                  q: "Как происходит оплата услуг для агентств?",
                  a: "Мы работаем по системе подписки. Агентство заранее приобретает пакет на определенное количество планов и обработок фотографий. Когда ваш сотрудник создает план или применяет очистку, услуга автоматически покрывается подпиской."
                },
                {
                  q: "Какая стоимость для агентств недвижимости?",
                  a: "Стоимость рассчитывается индивидуально для каждого агентства с учетом объемов обработки планировок, количества объектов и сложности задач. Предоставляем гибкие тарифные планы."
                }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                  <div
                    className="group relative overflow-hidden rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-500 cursor-pointer"
                    onClick={() => toggleFaqItem(i)}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors duration-300">
                            {item.q}
                          </h3>
                        </div>
                        <div className="w-5 h-5 rounded-sm border border-white/30 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 flex-shrink-0">
                          <motion.svg
                            className="w-2.5 h-2.5 text-white/60 group-hover:text-white transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: openFaqItems.includes(i) ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </div>
                      </div>

                      <motion.div
                        initial={false}
                        animate={{
                          height: openFaqItems.includes(i) ? "auto" : 0,
                          opacity: openFaqItems.includes(i) ? 1 : 0
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden mt-2"
                      >
                        <p className="text-white/70 leading-relaxed text-sm">
                          {item.a}
                        </p>
                      </motion.div>
                    </div>

                    {/* Professional border effect */}
                    <div className="absolute inset-0 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </FadeIn>
            ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section id="contact" className="py-16 md:py-24 relative overflow-hidden">
        <Container>
          <div className="relative">
            <FadeIn className="text-center mb-12">
              <div className="text-sm uppercase tracking-wider text-white/60 font-mono mb-4">
                СВЯЗАТЬСЯ С НАМИ
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Готовы начать работу?
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Заполните форму, и мы свяжемся с вами в ближайшее время
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="max-w-3xl mx-auto">
              <ContactFormSection />
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10">
        <Container className="py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-zinc-400">
            <img src="/latar/logo.png" alt="Логотип" className="h-10 w-10" />
            <span>© {new Date().getFullYear()} Plan AI</span>
          </div>
          <div className="text-zinc-500 text-sm">Оптимизация на уровне ИИ</div>
        </Container>
      </footer>

      {/* Client Modal */}
      {showClientModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowClientModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl p-8 max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Наши клиенты</h3>
                <button 
                  onClick={() => setShowClientModal(false)}
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    name: "Cursor", 
                    description: "AI-powered code editor",
                    logo: "CURSOR",
                    industry: "Разработка ПО"
                  },
                  { 
                    name: "Brex", 
                    description: "Corporate credit cards",
                    logo: "Brex",
                    industry: "Финтех"
                  },
                  { 
                    name: "Remote", 
                    description: "Global HR platform",
                    logo: "remote",
                    industry: "HR технологии"
                  },
                  { 
                    name: "Automattic", 
                    description: "WordPress.com & WooCommerce",
                    logo: "AUTOMATTIC",
                    industry: "Веб-платформы"
                  },
                  { 
                    name: "Runway", 
                    description: "AI video editing",
                    logo: "runway",
                    industry: "Медиа технологии"
                  },
                  { 
                    name: "Descript", 
                    description: "Audio & video editing",
                    logo: "descript",
                    industry: "Медиа технологии"
                  }
                ].map((client, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-6 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <div className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {client.logo}
                    </div>
                    <div className="text-lg font-semibold text-zinc-200 mb-1">
                      {client.name}
                    </div>
                    <div className="text-sm text-zinc-400 mb-2">
                      {client.description}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {client.industry}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-zinc-400 mb-4">
                  Хотите стать нашим клиентом? Свяжитесь с нами для обсуждения сотрудничества.
                </p>
                <button 
                  onClick={() => setShowClientModal(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300"
                >
                  <span className="text-white font-medium">Связаться с нами</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Client Details Modal */}
      {showClientDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClientDetailsModal(false)}
          />
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border border-white/20 rounded-lg custom-scrollbar"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Работаем с лучшими командами</h2>
                <button
                  onClick={() => setShowClientDetailsModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Наши партнеры</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        Ведущие архитектурные бюро
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        Крупные девелоперские компании
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        Международные консалтинговые агентства
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        Технологические стартапы
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Статистика сотрудничества</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Активных партнеров:</span>
                        <span className="text-white">50+</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Обработано проектов:</span>
                        <span className="text-white">1000+</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Средний рейтинг:</span>
                        <span className="text-white">4.9/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Время интеграции:</span>
                        <span className="text-white">1-2 недели</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">Преимущества партнерства</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Мы работаем с командами любого размера — от стартапов до крупных предприятий. 
                    Наша платформа интегрируется в существующие рабочие процессы, обеспечивая 
                    быструю обработку планировок и повышение эффективности работы.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">50+</div>
                    <div className="text-sm text-white/60">Партнеров</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">1000+</div>
                    <div className="text-sm text-white/60">Проектов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
                    <div className="text-sm text-white/60">Рейтинг</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'ai-plan' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="AI 2D-план"
          stats={[
            { value: '99.2%', label: 'Точность распознавания' },
            { value: '2.3s', label: 'Среднее время обработки' }
          ]}
          content={
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                Загрузите фото техплана (в том числе сделанное на телефон), выберите режим 
                с мебелью или без мебели, получите аккуратный 2D-план в формате PNG/SVG.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Автоматическое распознавание стен и объектов
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Экспорт в PNG, SVG, PDF форматы
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Высокая точность воспроизведения
                </div>
              </div>
            </div>
          }
        />
      )}

      {activeModal === 'photo-cleanup' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Очистка фото"
          stats={[
            { value: '95%', label: 'Качество очистки' },
            { value: '1.8s', label: 'Время обработки' }
          ]}
          content={
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                Загрузите фото помещения, Plan AI удалит мебель, гарнитуры и мусор, 
                сохранив стены и декор. Скачайте чистое изображение помещения.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Умное удаление объектов
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Сохранение архитектуры
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Реалистичный результат
                </div>
              </div>
            </div>
          }
        />
      )}

      {activeModal === 'constructor-ai' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Конструктор + ИИ"
          stats={[
            { value: '3D', label: 'Превью в реальном времени' },
            { value: '10+', label: 'Типов мебели' }
          ]}
          content={
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                Соберите 2D-план из простых блоков, загрузите фото для каждой комнаты 
                и отредактируйте мебель. Сгенерируйте финальный план и экспортируйте.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  Интуитивный интерфейс
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  AI-расстановка мебели
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  3D превью результата
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Business Process Modal */}
      <BusinessProcessModal 
        isOpen={showBusinessProcessModal}
        onClose={() => setShowBusinessProcessModal(false)}
      />
    </main>
  );
};

export default HomePage;