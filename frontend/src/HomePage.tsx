import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import HeroDiagonal from "./hero_diagonal";
import {
  ArrowRight,
  Shield,
  Eraser,
  Wand2,
  Ruler,
  LogOut,
  Menu,
  X,
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

const Title = ({ kicker, children, sub, center = false }: { kicker?: string; children: React.ReactNode; sub?: string; center?: boolean }) => (
  <div className={center ? "text-center" : "text-left"}>
    {kicker && (
      <div className="mb-3 inline-flex items-center gap-2 uppercase tracking-[0.2em] text-xs text-zinc-500">
        <span className="inline-block h-[1px] w-6 bg-zinc-500/60" />
        {kicker}
      </div>
    )}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-zinc-50">
      {children}
    </h2>
    {sub && <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">{sub}</p>}
  </div>
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
const DemoHero = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [currentStep, setCurrentStep] = React.useState(0); // 0: initial, 1: mode selection, 2: sub-mode selection, 3: processing, 4: result
  const [selectedMode, setSelectedMode] = React.useState('');
  const [selectedSubMode, setSelectedSubMode] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isBlurred, setIsBlurred] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [progressPercentage, setProgressPercentage] = React.useState(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

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
    <div 
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Diagonal background with mouse interaction */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.03]" />
      
      
      {/* Animated floating elements */}
      <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5 blur-xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white/5 blur-lg animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white/5 blur-md animate-pulse delay-500" />
      
      {/* Mouse-following elements */}
      <div 
        className="absolute w-32 h-32 rounded-full bg-white/5 blur-2xl transition-all duration-500 pointer-events-none"
        style={{
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
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
      
      {/* Bottom diagonal cut */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};



/* =============================
   Contact form (dummy)
   ============================= */
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      <input
        required
        value={name}
        onChange={(e)=> setName(e.target.value)}
        placeholder="Имя"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholder="Email"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
      />
      <button className="rounded-md border border-white/20 bg-zinc-100 text-zinc-950 px-4 py-3 text-sm font-medium hover:opacity-90 transition">
        Запросить пилот <ArrowRight className="inline h-4 w-4 ml-1 align-middle" />
      </button>
      <textarea
        value={message}
        onChange={(e)=> setMessage(e.target.value)}
        placeholder="Коротко о задачах и объёмах…"
        className="md:col-span-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 min-h-[120px]"
      />
      {sent && (
        <div className="md:col-span-3 text-sm text-zinc-300">Спасибо! Мы свяжемся с вами — форма в демо не отправляет данные.</div>
      )}
    </form>
  );
}

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

  const handleTexSchemeRedirect = () => {
    navigate('/new');
  };

  const handleConstructorRedirect = () => {
    navigate('/constructor');
  };

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


  return (
    <main className="relative min-h-screen bg-black text-zinc-100 antialiased selection:bg-zinc-300 selection:text-zinc-900 pt-16">
      {/* Background effects */}
      {/* <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(black_1px,transparent_1px)] [background-size:6px_6px]" /> */}
      <div className="pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-white/10 to-white/0" />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-zinc-950/95 border-b border-white/10 shadow-2xl' 
          : 'backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60 border-b border-white/5'
      }`}>
        <Container className="flex h-16 items-center justify-between">
          <a href="#" className="group inline-flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-zinc-100 text-zinc-900 grid place-content-center text-[10px] font-bold">FM</div>
            <span className="font-medium text-zinc-200 group-hover:text-white transition">Plan 2D</span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a className="hover:text-zinc-100 transition" href="#demo">Демо</a>
            <a className="hover:text-zinc-100 transition" href="#features">Возможности</a>
            <a className="hover:text-zinc-100 transition" href="#how">Как это работает</a>
            <a className="hover:text-zinc-100 transition" href="#examples">Примеры</a>
            <a className="hover:text-zinc-100 transition" href="#contact">Сотрудничество</a>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-zinc-300">Привет, {user.name}</span>
                  <button onClick={logout} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                    <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Выйти</span>
                    <LogOut className="h-4 w-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                    <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Войти</span>
                  </button>
                  <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition">
                    Запустить
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-zinc-300" />
              ) : (
                <Menu className="h-5 w-5 text-zinc-300" />
              )}
            </button>
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
            <Container className="py-4">
              <nav className="flex flex-col space-y-4">
                <a 
                  className="text-zinc-400 hover:text-zinc-100 transition py-2" 
                  href="#demo"
                  onClick={closeMobileMenu}
                >
                  Демо
                </a>
                <a 
                  className="text-zinc-400 hover:text-zinc-100 transition py-2" 
                  href="#features"
                  onClick={closeMobileMenu}
                >
                  Возможности
                </a>
                <a 
                  className="text-zinc-400 hover:text-zinc-100 transition py-2" 
                  href="#how"
                  onClick={closeMobileMenu}
                >
                  Как это работает
                </a>
                <a 
                  className="text-zinc-400 hover:text-zinc-100 transition py-2" 
                  href="#examples"
                  onClick={closeMobileMenu}
                >
                  Примеры
                </a>
                <a 
                  className="text-zinc-400 hover:text-zinc-100 transition py-2" 
                  href="#contact"
                  onClick={closeMobileMenu}
                >
                  Сотрудничество
                </a>
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-white/10">
                  {user ? (
                    <div className="flex flex-col space-y-3">
                      <span className="text-sm text-zinc-300">Привет, {user.name}</span>
                      <button 
                        onClick={() => { logout(); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Выйти</span>
                        <LogOut className="h-4 w-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <button 
                        onClick={() => { navigate('/login'); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Войти</span>
                      </button>
                      <button 
                        onClick={() => { navigate('/register'); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                      >
                        Запустить
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
      <Section id="clients" className="py-8 md:py-12">
        <Container>
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Работаем с лучшими командами
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                От стартапов до крупных предприятий — Plan AI помогает создавать идеальные планировки
              </p>
            </FadeIn>
          </div>

          <div className="relative group">
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
                    <div className={`text-2xl md:text-3xl text-white/60 group-hover:text-white/30 transition-all duration-500 group-hover:blur-sm ${client.fontStyle}`}>
                      {client.logo}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Central "Подробнее" button - appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <button 
                onClick={() => setShowClientModal(true)}
                className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 transition-colors duration-200"
              >
                <span className="text-white text-xs font-medium">Подробнее</span>
                <ArrowRight className="h-3 w-3 text-white" />
              </button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Demo Hero Section */}
      <Section id="demo" className="py-0">
        <DemoHero />
      </Section>




      {/* Enhanced Features */}
      <Section id="features" className="py-12 md:py-16">
        <Container>
          <Title
            center
            kicker="Возможности"
            sub="Три ключевых инструмента: AI-план, очистка фото и конструктор с ИИ."
          >
            Всё, что необходимо
          </Title>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: <Ruler className="h-6 w-6" />, 
                title: "AI 2D-план", 
                desc: "Перерисовка техплана: чёткий, читаемый результат, с мебелью или без.",
                features: ["Автоматическое распознавание", "Экспорт в PNG/SVG", "Высокая точность"],
                gradient: "from-blue-500/10 to-purple-500/10"
              },
              { 
                icon: <Eraser className="h-6 w-6" />, 
                title: "Очистка фото", 
                desc: "Убираем мебель, гарнитуры и мусор. Оставляем стены и декор.",
                features: ["Умное удаление объектов", "Сохранение архитектуры", "Реалистичный результат"],
                gradient: "from-green-500/10 to-emerald-500/10"
              },
              { 
                icon: <Wand2 className="h-6 w-6" />, 
                title: "Конструктор + ИИ", 
                desc: "Соберите план в конструкторе, добавьте фото — ИИ расставит мебель.",
                features: ["Интуитивный интерфейс", "AI-расстановка мебели", "3D превью"],
                gradient: "from-orange-500/10 to-red-500/10"
              },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                       style={{ background: `linear-gradient(135deg, ${f.gradient.split(' ')[0].replace('from-', '').replace('/10', '')}20, transparent)` }} />
                  
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-zinc-200 group-hover:bg-white/20 transition-colors duration-300">
                    {f.icon}
                      <span className="font-medium">Модуль</span>
                  </div>
                    
                    <h3 className="text-2xl font-semibold text-zinc-100 mb-3 group-hover:text-white transition-colors duration-300">
                      {f.title}
                    </h3>
                    
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                      {f.desc}
                    </p>
                    
                    <div className="space-y-3">
                      {f.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 group-hover:bg-white transition-colors duration-300" />
                          {feature}
                  </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="pointer-events-none absolute -inset-px rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 [mask-image:radial-gradient(80%_120%_at_50%_0%,_black,_transparent)] bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Interactive How it works */}
      <Section id="how" className="py-12 md:py-16">
        <Container>
          <Title kicker="Как это работает" center sub="Три режима под разные задачи агентств: 2D-план, очистка фото и конструктор с ИИ.">
            Простые шаги для каждой функции
          </Title>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. AI создание 2D плана */}
            <FadeIn delay={0.1}>
              <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-zinc-200 group-hover:bg-white/20 transition-colors duration-300">
                    <Ruler className="h-4 w-4" /> 
                    <span className="font-medium">2D-план</span>
            </div>
                  
                  <h3 className="mt-6 text-2xl font-semibold text-zinc-100 group-hover:text-white transition-colors duration-300">
                    AI создание 2D плана
                  </h3>
                  
                  <div className="mt-6 space-y-4">
                    {[
                      "Загрузите фото техплана (в том числе сделанное на телефон)",
                      "Выберите: с мебелью или без мебели",
                      "Получите аккуратный 2D-план (PNG/SVG) и экспортируйте"
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white text-sm font-medium flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                          {idx + 1}
                        </div>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 2. Очистка */}
            <FadeIn delay={0.2}>
              <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-zinc-200 group-hover:bg-white/20 transition-colors duration-300">
                    <Eraser className="h-4 w-4" /> 
                    <span className="font-medium">Очистка фото</span>
            </div>
                  
                  <h3 className="mt-6 text-2xl font-semibold text-zinc-100 group-hover:text-white transition-colors duration-300">
                    Очистка ненужных объектов
                  </h3>
                  
                  <div className="mt-6 space-y-4">
                    {[
                      "Загрузите фото помещения/комнаты",
                      "Plan AI удалит мебель, гарнитуры и мусор; стены и декор сохранятся",
                      "Скачайте чистое изображение помещения"
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white text-sm font-medium flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                          {idx + 1}
                        </div>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 3. Конструктор с ИИ */}
            <FadeIn delay={0.3}>
              <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-zinc-200 group-hover:bg-white/20 transition-colors duration-300">
                    <Wand2 className="h-4 w-4" /> 
                    <span className="font-medium">Конструктор + ИИ</span>
            </div>
                  
                  <h3 className="mt-6 text-2xl font-semibold text-zinc-100 group-hover:text-white transition-colors duration-300">
                    Конструктор с встроенным AI
                  </h3>
                  
                  <div className="mt-6 space-y-4">
                    {[
                      "Соберите 2D-план из простых блоков",
                      "Загрузите фото для каждой комнаты и отредактируйте мебель",
                      "Сгенерируйте финальный план и экспортируйте"
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white text-sm font-medium flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                          {idx + 1}
                        </div>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>



      {/* Interactive Testimonial */}
      <Section id="testimonial" className="py-12 md:py-16">
        <Container>
          <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.02] to-white/[0.01] p-8 md:p-12 hover:bg-white/[0.04] transition-all duration-500">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
            <FadeIn>
                <div className="flex items-center gap-3 text-zinc-400 text-sm mb-6">
                  <div className="p-2 rounded-full border border-white/20 bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="group-hover:text-zinc-300 transition-colors duration-300">
                    Агенства по всей России ускоряют свою работу с Plan AI
                  </span>
              </div>
            </FadeIn>
              
              <FadeIn delay={0.1}>
                <blockquote className="text-3xl md:text-4xl leading-relaxed text-zinc-100 group-hover:text-white transition-colors duration-300 font-medium">
                  «Каждый сэкономленный цент - это заработанный цент. 
                  <span className="block mt-2 text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300">
                    Зарабатывай быстро - вместе с Plan AI».
                  </span>
              </blockquote>
            </FadeIn>
              
              <FadeIn delay={0.2}>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors duration-300">ИА</span>
                  </div>
                <div>
                    <div className="text-zinc-200 font-semibold text-lg group-hover:text-white transition-colors duration-300">
                      Илья Андреевич Белоусов
                    </div>
                    <div className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors duration-300">
                      CEO, Маркетолог, Инвестор
                    </div>
      </div>
    </div>
            </FadeIn>
            </div>
          </div>
        </Container>
      </Section>

      {/* Interactive FAQ */}
      <Section id="faq" className="py-12 md:py-16">
        <Container>
          <Title center kicker="FAQ" sub="О внедрении в агентства и кастомизации под ваши процессы.">
            Частые вопросы
          </Title>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                q: "Какая стоимость для организаций?", 
                a: "Стоимость расчитывается индивидуально для каждой организации с учетом объемов и сложности задач.",
                icon: "💰"
              },
              { 
                q: "Нужна ли подписка?", 
                a: "Нет. Сайт и продукт ориентированы на корпоративное внедрение и пилоты, без публичных тарифов.",
                icon: "🚫"
              },
              { 
                q: "Как перенести стиль в бренд агентства?", 
                a: "Пресеты: логотип, шрифты и цвет акцентов — применяются к экспортам.",
                icon: "🎨"
              },
              { 
                q: "Можно ли обучить модели под наши планы?", 
                a: "Да, поддерживаем дообучение на ваших данных и типовых планировках.",
                icon: "🤖"
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors duration-300 mb-3">
                          {item.q}
                        </h3>
                        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="pointer-events-none absolute -inset-px rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 [mask-image:radial-gradient(80%_120%_at_50%_0%,_black,_transparent)] bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA & Contact */}
      <Section id="contact" className="py-8 md:py-14">
        <Container>
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-10 md:p-14">
            <Glow className="-top-10" />
            <FadeIn>
              <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">Готовы к пилоту?</div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h3 className="mt-2 text-3xl md:text-4xl font-semibold text-zinc-50">Запустим Plan AI в вашем агентстве</h3>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-2 text-zinc-400 max-w-2xl">Оставьте контакты — подготовим демо на ваших данных и обсудим интеграцию.</p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <ContactForm />
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10">
        <Container className="py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-zinc-400">
            <div className="h-6 w-6 rounded-lg bg-zinc-100 text-zinc-900 grid place-content-center text-[10px] font-bold">FM</div>
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl p-8 max-h-[80vh] overflow-y-auto"
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
    </main>
  );
};

export default HomePage;