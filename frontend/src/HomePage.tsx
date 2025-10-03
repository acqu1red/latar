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
  Building2,
  Layers,
  Share2,
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
  const [showDemo, setShowDemo] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isDemoHiding, setIsDemoHiding] = React.useState(false);
  const [isReturning, setIsReturning] = React.useState(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  const handleTryDemo = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowDemo(true);
      setIsAnimating(false);
    }, 400);
  };

  const handleGoBack = () => {
    setIsReturning(true);
    setIsDemoHiding(true);
    setTimeout(() => {
      setShowDemo(false);
      setIsDemoHiding(false);
      setIsAnimating(true);
    }, 300);
    setTimeout(() => {
      setIsAnimating(false);
      // Не сбрасываем isReturning сразу, даем время на стабилизацию
      setTimeout(() => {
        setIsReturning(false);
      }, 100);
    }, 500);
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
          <div className="max-w-4xl mx-auto text-center">
            {/* Title that stays in place */}
            <FadeIn delay={0.2}>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Попробуйте магию
                <span className="block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  AI в действии
                </span>
              </h2>
            </FadeIn>
            
            {/* Content that fades out and back in */}
            <motion.div
              animate={isAnimating ? {
                opacity: 0,
                ...(isReturning ? {} : { filter: "blur(10px)" })
              } : {
                opacity: 1,
                ...(isReturning ? {} : { filter: "blur(0px)" })
              }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut",
                delay: isAnimating ? 0 : 0
              }}
              className={showDemo ? 'hidden' : ''}
              style={{
                ...(isReturning ? { 
                  filter: 'none !important',
                  WebkitFilter: 'none !important'
                } : {}),
                // Стабилизация после возврата
                ...(showDemo === false && isAnimating === false ? {
                  filter: 'none !important',
                  WebkitFilter: 'none !important'
                } : {})
              }}
            >
              <FadeIn delay={0.1} isReturning={isReturning}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm text-zinc-300 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Живое демо Plan AI
                </div>
              </FadeIn>
              
              <FadeIn delay={0.3} isReturning={isReturning}>
                <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Загрузите фото → выберите режим → получите результат за секунды. 
                  Никаких сложных настроек, только результат.
                </p>
              </FadeIn>
              
              <FadeIn delay={0.4} isReturning={isReturning}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button 
                    onClick={handleTryDemo}
                    className="group relative overflow-hidden px-8 py-4 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            
            {/* Demo interface that appears with blur animation */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={showDemo && !isDemoHiding ? {
                opacity: 1,
                filter: "blur(0px)"
              } : {
                opacity: 0,
                filter: "blur(30px)"
              }}
              transition={{ 
                duration: showDemo && !isDemoHiding ? 0.5 : 0.4, 
                ease: "easeInOut",
                delay: showDemo && !isDemoHiding ? 0.1 : 0 
              }}
              style={{ 
                display: showDemo || isDemoHiding ? 'block' : 'none' 
              }}
            >
              <div className="relative max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.05] backdrop-blur-xl p-8 shadow-2xl">
                  {/* Demo interface content */}
                  <div className="relative z-10">
                    <div className="w-full max-w-4xl mx-auto rounded-2xl backdrop-blur relative border border-white/10 bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                      <div className="p-6">
                        {/* Header with mode selection */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="ml-4 text-sm text-zinc-400">Plan AI Demo</span>
                          </div>
                          <div className="text-xs text-zinc-500">v2.0</div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          {/* Enhanced attach button */}
                          <div className="flex gap-3">
                            <button
                              className="group h-9 w-9 rounded-lg grid place-items-center border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                              title="Прикрепить файл"
                            >
                              <svg className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            </button>
                          </div>

                          {/* Center content area */}
                          <div className="flex w-full items-center gap-2">
                            <button className="rounded-xl px-3 py-2 text-sm border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
                              Полностью
                            </button>
                          </div>

                          {/* Right section with model selection */}
                          <div className="flex shrink-0 items-center gap-2 self-end pb-1 relative">
                            <div className="relative">
                              <button className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
                                <span className="group-hover:scale-105 transition-transform duration-300">Удаление объектов</span>
                                <svg className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white group-hover:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            <button className="group h-8 w-8 rounded-lg grid place-items-center border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300" title="Сгенерировать">
                              <svg className="h-4 w-4 text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Hints */}
                        <div className="mt-4 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-zinc-400">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            Чтобы сгенерировать — прикрепите хотя бы одну фотографию
                          </div>
                        </div>
                      </div>

                      {/* Bottom status */}
                      <div className="flex items-center justify-between px-6 py-4 text-sm border-t border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-zinc-400">Выберите режим удаления</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Модель: Удаление объектов</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-50" />
                </div>
              </div>
              
              {/* Back button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={showDemo && !isDemoHiding ? {
                  opacity: 1
                } : {
                  opacity: 0
                }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut", 
                  delay: showDemo && !isDemoHiding ? 0.6 : 0.1 
                }}
                style={{ 
                  display: showDemo || isDemoHiding ? 'flex' : 'none' 
                }}
                className="mt-8 justify-center"
              >
                <button 
                  onClick={handleGoBack}
                  className="group relative overflow-hidden px-6 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 text-white font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
                    Вернуться назад
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </div>
      
      {/* Bottom diagonal cut */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};

/* =============================
   Enhanced Before/After slider — zero-lag, bound to pointer
   ============================= */
const EnhancedBeforeAfterSlider = ({ 
  before, 
  after, 
  captionBefore = "До", 
  captionAfter = "После",
  description = ""
}: { 
  before: string; 
  after: string; 
  captionBefore?: string; 
  captionAfter?: string;
  description?: string;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [x, setX] = React.useState(0.5);
  const [isDragging, setIsDragging] = React.useState(false);

  const setFromEvent = (e: MouseEvent | TouchEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setX(nx);
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setFromEvent(e.nativeEvent);
    const move = (ev: MouseEvent | TouchEvent) => { ev.preventDefault(); setFromEvent(ev); };
    const up = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
  };

  return (
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-zinc-400 text-center">
          {description}
        </div>
      )}
      
    <div
      ref={ref}
        className="group relative w-full overflow-hidden rounded-2xl ring-1 ring-white/20 shadow-2xl select-none cursor-col-resize hover:ring-white/30 transition-all duration-300"
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
        <img src={before} alt="before" className="absolute inset-0 w-full h-[300px] md:h-[400px] object-cover" />
      <img
        src={after}
        alt="after"
          className="absolute inset-0 h-[300px] md:h-[400px] object-cover"
        style={{ width: "100%", clipPath: `inset(0 0 0 ${x * 100}%)` }}
      />
        
        {/* Enhanced Handle */}
      <div className="absolute inset-y-0" style={{ left: `${x * 100}%` }}>
          <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-white/90 shadow-lg" />
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-zinc-900 grid place-content-center shadow-xl ring-2 ring-white/20 pointer-events-none transition-all duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
            <span className="text-sm font-bold">⇆</span>
        </div>
      </div>
        
        {/* Enhanced Labels */}
        <div className="absolute left-4 bottom-4 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/90 text-sm font-medium shadow-lg">
          {captionBefore}
        </div>
        <div className="absolute right-4 bottom-4 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/90 text-sm font-medium shadow-lg">
          {captionAfter}
        </div>
        
        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white/60 transition-all duration-300"
            style={{ width: `${x * 100}%` }}
          />
        </div>
        
        <div className="relative h-[300px] md:h-[400px]" />
      </div>
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
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholder="Email"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
      />
      <button className="rounded-xl border border-white/20 bg-zinc-100 text-zinc-950 px-4 py-3 text-sm font-medium hover:opacity-90 transition">
        Запросить пилот <ArrowRight className="inline h-4 w-4 ml-1 align-middle" />
      </button>
      <textarea
        value={message}
        onChange={(e)=> setMessage(e.target.value)}
        placeholder="Коротко о задачах и объёмах…"
        className="md:col-span-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 min-h-[120px]"
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
                  <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                    <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Выйти</span>
                    <LogOut className="h-4 w-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                    <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Войти</span>
                  </button>
                  <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition">
                    Запустить
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
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
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Выйти</span>
                        <LogOut className="h-4 w-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <button 
                        onClick={() => { navigate('/login'); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Войти</span>
                      </button>
                      <button 
                        onClick={() => { navigate('/register'); closeMobileMenu(); }} 
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
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
                Plan AI — превращает фотографии в идеальные планировки за секунды
            </h1>
            </SlideInFromLeft>

            <SlideInFromLeft delay={0.6}>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Система создания планировки и очистки помещений. 
              Оптимизация задач и надежность результата.
              </p>
            </SlideInFromLeft>

            <SlideInFromLeft delay={1.0}>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button onClick={handleTexSchemeRedirect} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition">
                Начать создание
              </button>
                <button onClick={handleConstructorRedirect} className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
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

            <FadeIn delay={0.2}>
              <p className="mt-3 text-xs text-zinc-500">
                * Plan AI.
              </p>
            </FadeIn>
          </Container>
        </div>
      </Section>

      {/* Interactive Stats Section */}
      <Section id="stats" className="py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: "50ms", label: "Скорость обработки", desc: "Мгновенная генерация планов" },
              { number: "99.9%", label: "Точность AI", desc: "Профессиональное качество" },
              { number: "24/7", label: "Доступность", desc: "Работает круглосуточно" }
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-lg font-medium text-zinc-200 mb-1">{stat.label}</div>
                  <div className="text-sm text-zinc-400">{stat.desc}</div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Demo Hero Section */}
      <Section id="demo" className="py-0">
        <DemoHero />
      </Section>


      {/* Interactive AI Workflow */}
      <Section id="workflow" className="py-12 md:py-16">
        <Container>
          <Title center kicker="AI Workflow" sub="Посмотрите, как Plan AI обрабатывает ваши изображения в реальном времени.">
            Интерактивный процесс
          </Title>
          
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-50" />
              
              <div className="relative z-10">
                {/* Interactive workflow visualization */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-4xl">
                    {/* Workflow steps */}
                    <div className="flex items-center justify-between relative">
                      {/* Step 1: Upload */}
                      <div className="group flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">1</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white">Загрузка</div>
                          <div className="text-xs text-zinc-400">Фото помещения</div>
                        </div>
                      </div>

                      {/* Arrow 1 */}
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent mx-4"></div>

                      {/* Step 2: AI Processing */}
                      <div className="group flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-8 h-8 text-white"
                            >
                              ✷
                            </motion.div>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">2</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white">AI Анализ</div>
                          <div className="text-xs text-zinc-400">Обработка данных</div>
                        </div>
                      </div>

                      {/* Arrow 2 */}
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent mx-4"></div>

                      {/* Step 3: Generation */}
                      <div className="group flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">3</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white">Генерация</div>
                          <div className="text-xs text-zinc-400">Создание плана</div>
                        </div>
                      </div>

                      {/* Arrow 3 */}
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent mx-4"></div>

                      {/* Step 4: Export */}
                      <div className="group flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">4</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white">Экспорт</div>
                          <div className="text-xs text-zinc-400">PNG/SVG/PDF</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>Прогресс обработки</span>
                        <span>2.3s</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2.3, ease: "easeInOut", repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      icon: "📸", 
                      title: "Загрузка фото", 
                      desc: "Поддержка всех форматов", 
                      color: "from-blue-500/10 to-purple-500/10",
                      hoverColor: "from-blue-500/20 to-purple-500/20"
                    },
                    { 
                      icon: "🤖", 
                      title: "AI Анализ", 
                      desc: "Нейронные сети", 
                      color: "from-green-500/10 to-emerald-500/10",
                      hoverColor: "from-green-500/20 to-emerald-500/20"
                    },
                    { 
                      icon: "⚡", 
                      title: "Быстрая генерация", 
                      desc: "За 2-3 секунды", 
                      color: "from-orange-500/10 to-red-500/10",
                      hoverColor: "from-orange-500/20 to-red-500/20"
                    },
                    { 
                      icon: "📁", 
                      title: "Множественный экспорт", 
                      desc: "PNG, SVG, PDF", 
                      color: "from-purple-500/10 to-pink-500/10",
                      hoverColor: "from-purple-500/20 to-pink-500/20"
                    },
                  ].map((feature, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        <div className="relative z-10">
                          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                          <div className="font-semibold text-zinc-200 group-hover:text-white transition-colors duration-300 mb-2">
                            {feature.title}
                          </div>
                          <div className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                            {feature.desc}
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Value for RE agencies */}
      <Section id="solutions" className="py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            {[
              { icon: <Building2 className="h-5 w-5" />, t: "Для агентств", d: "Единый поток: загрузка → создание → результат." },
              { icon: <Layers className="h-5 w-5" />, t: "Для других организаций", d: "Совместный доступ и единые алгоритмы создания." },
              { icon: <Share2 className="h-5 w-5" />, t: "Экспорт без трения", d: "PNG, SVG, PDF и ссылки для быстрой отправки клиентам." },
            ].map((m, i) => (
              <FadeIn key={m.t} delay={i * 0.1}>
                <div className="group flex items-start gap-4 p-6 rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
                  <div className="mt-1 rounded-full border border-white/20 bg-white/10 p-3 text-zinc-300 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                    {m.icon}
                  </div>
                  <div>
                    <div className="text-zinc-50 font-semibold text-lg group-hover:text-white transition-colors duration-300">{m.t}</div>
                    <div className="text-sm text-zinc-400 mt-2">{m.d}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
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
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
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
                  <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 [mask-image:radial-gradient(80%_120%_at_50%_0%,_black,_transparent)] bg-gradient-to-b from-white/10 to-transparent" />
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
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
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
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
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
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
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

      {/* Enhanced Before/After Section */}
      <Section id="examples" className="py-12 md:py-16">
        <Container>
          <Title kicker="До/После" sub="Двигайте ползунок — он привязан к курсору без задержек. Опробуйте магию AI в действии.">
            Визуальная разница за секунды
          </Title>
          
          <div className="mt-12 space-y-8">
            {/* Main showcase - full width */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-sm text-zinc-400 font-medium">AI Очистка помещений</span>
                </div>
                
                <EnhancedBeforeAfterSlider
              before="/latar/do1.jpg"
              after="/latar/postle1.jpg"
                  captionBefore="Исходное фото"
                  captionAfter="После AI очистки"
                  description="Удаление мебели и объектов с сохранением архитектуры"
                />
              </div>
            </div>
            
            {/* Secondary examples grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-zinc-400 font-medium">Планировка с мебелью</span>
                  </div>
                  
                  <EnhancedBeforeAfterSlider
                before="/latar/do2.jpg"
                after="/latar/postle2.jpg"
                captionBefore="С мебелью"
                captionAfter="Без мебели"
                    description="Создание чистого плана помещения"
                  />
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-zinc-400 font-medium">Технический план</span>
                  </div>
                  
                  <EnhancedBeforeAfterSlider
                before="/latar/do3.jpg"
                after="/latar/postle3.jpg"
                captionBefore="Техплан"
                captionAfter="Схематичный план"
                    description="Преобразование в профессиональный план"
              />
                </div>
              </div>
            </div>
            
            {/* Interactive stats and description */}
            <div className="text-center space-y-6">
              {/* Animated stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { number: "2.3s", label: "Среднее время обработки", icon: "⚡" },
                  { number: "99.2%", label: "Точность распознавания", icon: "🎯" },
                  { number: "10k+", label: "Обработано изображений", icon: "📊" }
                ].map((stat, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all duration-300 hover:scale-105">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                      <div className="text-lg font-bold text-white group-hover:text-white transition-colors duration-300">
                        {stat.number}
                      </div>
                      <div className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                        {stat.label}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
              
              {/* Bottom description */}
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] text-sm text-zinc-400 hover:bg-white/[0.04] transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                Примеры наших AI-планов и очистки помещений
              </div>
            </div>
          </div>
        </Container>
      </Section>


      {/* Interactive Testimonial */}
      <Section id="testimonial" className="py-12 md:py-16">
        <Container>
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-white/[0.01] p-8 md:p-12 hover:bg-white/[0.04] transition-all duration-500">
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
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.02]">
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
                  <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 [mask-image:radial-gradient(80%_120%_at_50%_0%,_black,_transparent)] bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA & Contact */}
      <Section id="contact" className="py-8 md:py-14">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-10 md:p-14">
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
          <div className="text-zinc-500 text-sm">Сделано для агентств недвижимости</div>
        </Container>
      </footer>
    </main>
  );
};

export default HomePage;