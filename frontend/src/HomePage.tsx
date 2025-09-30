import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import HeroDiagonal from "./hero_diagonal";
import {
  ArrowRight,
  Check,
  Shield,
  Upload,
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

const Grain = () => (
  <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(black_1px,transparent_1px)] [background-size:6px_6px]" />
);

const Glow = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-white/10 to-white/0 ${className}`} />
);

/* =============================
   Old FoldingHero component removed - replaced with HeroDiagonal
   ============================= */

/* =============================
   Before/After slider — zero-lag, bound to pointer
   ============================= */
const BeforeAfterSlider = ({ before, after, captionBefore = "До", captionAfter = "После" }: { before: string; after: string; captionBefore?: string; captionAfter?: string }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [x, setX] = React.useState(0.5);

  const setFromEvent = (e: MouseEvent | TouchEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setX(nx);
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setFromEvent(e.nativeEvent);
    const move = (ev: MouseEvent | TouchEvent) => { ev.preventDefault(); setFromEvent(ev); };
    const up = () => {
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
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl select-none cursor-col-resize"
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <img src={before} alt="before" className="absolute inset-0 w-full h-[420px] md:h-[520px] object-cover" />
      <img
        src={after}
        alt="after"
        className="absolute inset-0 h-[420px] md:h-[520px] object-cover"
        style={{ width: "100%", clipPath: `inset(0 0 0 ${x * 100}%)` }}
      />
      {/* Handle */}
      <div className="absolute inset-y-0" style={{ left: `${x * 100}%` }}>
        <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-white/80" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-zinc-900 grid place-content-center shadow ring-1 ring-black/10 pointer-events-none">
          <span className="text-xs font-medium">⇆</span>
        </div>
      </div>
      <div className="absolute left-3 bottom-3 text-[10px] px-2 py-1 rounded bg-black/40 text-white/90">{captionBefore}</div>
      <div className="absolute right-3 bottom-3 text-[10px] px-2 py-1 rounded bg-black/40 text-white/90">{captionAfter}</div>
      <div className="relative h-[420px] md:h-[520px]" />
    </div>
  );
};

/* =============================
   Quick Demo (upload + generate)
   ============================= */
function QuickDemo() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFileUrl(url);
  };
  const pick = () => inputRef.current?.click();
  const generate = () => {
    if (!fileUrl) return;
    setGenerating(true);
    setTimeout(() => setGenerating(false), 900); // имитация обработки
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={pick} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition">
          <Upload className="h-4 w-4" /> Загрузить фото
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button onClick={generate} disabled={!fileUrl} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
          <Wand2 className="h-4 w-4" /> Сгенерировать
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="aspect-video rounded-xl ring-1 ring-white/10 bg-white/[0.02] overflow-hidden grid place-content-center text-zinc-500">
          {fileUrl ? (
            <img src={fileUrl} alt="uploaded" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs">Загрузите фото помещения</span>
          )}
        </div>
        <div className="relative aspect-video rounded-xl ring-1 ring-white/10 bg-white/[0.02] overflow-hidden grid place-content-center text-zinc-500">
          {fileUrl ? (
            <img src={fileUrl} alt="result" className="w-full h-full object-cover" style={{ filter: "grayscale(100%) contrast(1.15)" }} />
          ) : (
            <span className="text-xs">Здесь появится результат</span>
          )}
          {generating && (
            <div className="absolute inset-0 grid place-content-center bg-black/40 text-white text-sm">Генерация…</div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-300 selection:text-zinc-900">
      <Grain />

      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md bg-zinc-950/80 border-b border-white/10' 
          : 'backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 border-b border-white/5'
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
                    Регистрация
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
            className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-md"
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
                        Регистрация
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
          <Container className="pt-20 pb-28 md:pt-28 md:pb-36">

            <SlideInFromLeft delay={0.2}>
              <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight" style={{ fontFamily: 'New York, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Plan AI — превращает фотографии<br />
                в идеальные планировки за секунды
            </h1>
            </SlideInFromLeft>

            <SlideInFromLeft delay={0.6}>
              <p className="mt-6 max-w-2xl text-zinc-400">
              Система создания планировки и очистки помещений.<br />
              Оптимизация задач и надежность результата.
              </p>
            </SlideInFromLeft>

            <SlideInFromLeft delay={1.0}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={handleTexSchemeRedirect} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-100 text-zinc-950 px-6 py-2.5 font-medium hover:opacity-90 transition">
                Начать создание
              </button>
                <button onClick={handleConstructorRedirect} className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-2.5 font-medium transition-all duration-300 relative overflow-hidden group hover:bg-white/15">
                  <span className="relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">Попробовать демо</span>
                  <ArrowRight className="h-4 w-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
              </button>
            </div>
            </SlideInFromLeft>

            {/* Diagonal Hero visual */}
            <motion.div style={{ y }} className="mt-16 md:mt-24">
            <HeroDiagonal
              images={{
                hero1: "/latar/uploads/hero1.webp",
                hero2: "/latar/uploads/hero2_cropped.webp",
                hero3: "/latar/uploads/hero3_cropped.webp",
                hero4: "/latar/uploads/hero4_cropped.webp",
                hero5: "/latar/uploads/hero5_cropped.webp",
                hero6: "/latar/uploads/hero6.webp",
              }}
              className="h-[420px] md:h-[520px]"
            />
            </motion.div>

            <FadeIn delay={0.2}>
              <p className="mt-6 text-xs text-zinc-500">
                * Plan AI.
              </p>
            </FadeIn>
          </Container>
        </div>
      </Section>

      {/* Partners */}
      <Section id="partners" className="py-12 md:py-20">
        <Container>
          <Title center kicker="Партнёрство" sub="Мы работаем с девелоперами, агентствами и proptech-компаниями.">
            Наши партнёры
          </Title>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { src: "/latar/alatartsev.jpg", alt: "Alatartsev" },
              { src: "/latar/alatartsev.jpg", alt: "Partner 2" },
              { src: "/latar/alatartsev.jpg", alt: "Partner 3" }
            ].map((partner, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="aspect-[4/1] rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <img src={partner.src} alt={partner.alt} className="w-full h-full object-cover" />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Quick Demo */}
      <Section id="demo" className="py-10 md:py-16">
        <Container>
          <Title kicker="Быстрое демо" sub="Загрузите фото → нажмите «Сгенерировать».">
            Попробуйте на своём фото
          </Title>
          <div className="mt-6">
            <QuickDemo />
          </div>
        </Container>
      </Section>

      {/* Value for RE agencies */}
      <Section id="solutions">
        <Container className="pb-8 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            {[
              { icon: <Building2 className="h-4 w-4" />, t: "Для агентств", d: "Единый поток: загрузка → создание → результат." },
              { icon: <Layers className="h-4 w-4" />, t: "Для других организаций", d: "Совместный доступ и единые алгоритмы создания." },
              { icon: <Share2 className="h-4 w-4" />, t: "Экспорт без трения", d: "PNG, SVG, PDF и ссылки для быстрой отправки клиентам." },
            ].map((m, i) => (
              <FadeIn key={m.t} delay={i * 0.04}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300">{m.icon}</div>
                  <div>
                    <div className="text-zinc-50 font-medium">{m.t}</div>
                    <div className="text-sm text-zinc-500">{m.d}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section id="features" className="py-16 md:py-28">
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
              { icon: <Ruler className="h-5 w-5" />, title: "AI 2D-план", desc: "Перерисовка техплана: чёткий, читаемый результат, с мебелью или без." },
              { icon: <Eraser className="h-5 w-5" />, title: "Очистка фото", desc: "Убираем мебель, гарнитуры и мусор. Оставляем стены и декор." },
              { icon: <Wand2 className="h-5 w-5" />, title: "Конструктор + ИИ", desc: "Соберите план в конструкторе, добавьте фото — ИИ расставит мебель." },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {f.icon}
                    <span>Module</span>
                  </div>
                  <h3 className="text-xl font-medium text-zinc-100">{f.title}</h3>
                  <p className="mt-2 text-zinc-400">{f.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4" /> Экспорт в PNG/SVG
                  </div>
                  <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 [mask-image:radial-gradient(80%_120%_at_50%_0%,_black,_transparent)] bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section id="how" className="py-12 md:py-20">
        <Container>
          <Title kicker="Как это работает" center sub="Три режима под разные задачи агентств: 2D-план, очистка фото и конструктор с ИИ.">
            Простые шаги для каждой функции
          </Title>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. AI создание 2D плана */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"><Ruler className="h-4 w-4" /> 2D-план</div>
              <h3 className="mt-3 text-xl font-medium text-zinc-100">AI создание 2D плана</h3>
              <ol className="mt-3 list-decimal list-inside text-zinc-400 space-y-2">
                <li>Загрузите фото техплана (в том числе сделанное на телефон).</li>
                <li>Выберите: с мебелью или без мебели.</li>
                <li>Получите аккуратный 2D-план (PNG/SVG) и экспортируйте.</li>
              </ol>
            </div>
            {/* 2. Очистка */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"><Eraser className="h-4 w-4" /> Очистка фото</div>
              <h3 className="mt-3 text-xl font-medium text-zinc-100">Очистка ненужных объектов</h3>
              <ol className="mt-3 list-decimal list-inside text-zinc-400 space-y-2">
                <li>Загрузите фото помещения/комнаты.</li>
                <li>Plan AI удалит мебель, гарнитуры и мусор; стены и декор сохранятся.</li>
                <li>Скачайте чистое изображение помещения.</li>
              </ol>
            </div>
            {/* 3. Конструктор с ИИ */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"><Wand2 className="h-4 w-4" /> Конструктор + ИИ</div>
              <h3 className="mt-3 text-xl font-medium text-zinc-100">Конструктор с встроенным AI</h3>
              <ol className="mt-3 list-decimal list-inside text-zinc-400 space-y-2">
                <li>Соберите 2D-план из простых блоков.</li>
                <li>Загрузите фото для каждой комнаты и отредактируйте мебель.</li>
                <li>Сгенерируйте финальный план и экспортируйте.</li>
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      {/* Before/After (3 sliders) */}
      <Section id="examples" className="py-12 md:py-20">
        <Container>
          <Title kicker="До/После" sub="Двигайте ползунок — он привязан к курсору без задержек.">
            Визуальная разница за секунды
          </Title>
          <div className="mt-10 space-y-8">
            {/* Первый блок - полная ширина */}
            <BeforeAfterSlider
              before="/latar/do1.jpg"
              after="/latar/postle1.jpg"
              captionBefore="Исходник"
              captionAfter="Очистка"
            />
            
            {/* Второй и третий блоки - горизонтально рядом */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BeforeAfterSlider
                before="/latar/do2.jpg"
                after="/latar/postle2.jpg"
                captionBefore="С мебелью"
                captionAfter="Без мебели"
              />
              <BeforeAfterSlider
                before="/latar/do3.jpg"
                after="/latar/postle3.jpg"
                captionBefore="Техплан"
                captionAfter="Схематичный план"
              />
            </div>
            
            <p className="text-center text-zinc-400">Примеры наших схематичных планов</p>
          </div>
        </Container>
      </Section>


      {/* Testimonial */}
      <Section id="testimonial" className="py-16 md:py-28">
        <Container>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <FadeIn>
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <Shield className="h-4 w-4" /> Агенства по всей России ускоряют свою работу с Plan AI
              </div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <blockquote className="mt-6 text-2xl md:text-3xl leading-relaxed text-zinc-100">
                «Каждый сэкономленный цент - это заработанный цент. Зарабатывай быстро - вместе с Plan AI».
              </blockquote>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div>
                  <div className="text-zinc-200 font-medium">Илья Андреевич Белоусов</div>
                  <div className="text-zinc-500 text-sm">CEO, Маркетолог, Инвестор</div>
      </div>
    </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-12 md:py-20">
        <Container>
          <Title center kicker="FAQ" sub="О внедрении в агентства и кастомизации под ваши процессы.">
            Частые вопросы
          </Title>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: "Какая стоимость для организаций?", a: "Стоимость расчитывается индивидуально для каждой организации с учетом объемов и сложности задач." },
              { q: "Нужна ли подписка?", a: "Нет. Сайт и продукт ориентированы на корпоративное внедрение и пилоты, без публичных тарифов." },
              { q: "Как перенести стиль в бренд агентства?", a: "Пресеты: логотип, шрифты и цвет акцентов — применяются к экспортам." },
              { q: "Можно ли обучить модели под наши планы?", a: "Да, поддерживаем дообучение на ваших данных и типовых планировках." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-zinc-100 font-medium">{item.q}</div>
                  <p className="mt-2 text-zinc-400">{item.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA & Contact */}
      <Section id="contact" className="py-16 md:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-10 md:p-14">
            <Glow className="-top-10" />
            <FadeIn>
              <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">Готовы к пилоту?</div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h3 className="mt-3 text-3xl md:text-4xl font-semibold text-zinc-50">Запустим Plan AI в вашем агентстве</h3>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-3 text-zinc-400 max-w-2xl">Оставьте контакты — подготовим демо на ваших данных и обсудим интеграцию.</p>
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