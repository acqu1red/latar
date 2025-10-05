import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ArrowUp,
  Trash2,
  Settings,
  PanelLeft,
  ChevronDown,
  Paperclip,
  X,
  ThumbsUp,
  ThumbsDown,
  Search,
  MessageSquare,
  Mic,
  Image as ImageIcon,
  Folder,
  Bell,
  ChevronLeft,
  Send,
  Layers,
  Palette,
  Check,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from './AuthContext';

// ===== Helpers =====
const cn = (...c) => c.filter(Boolean).join(" ");



// === TwinkleStar: animate the original ✷ logo (hover + afterglow) ===
function TwinkleStar() {
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  const start = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(true);
  };
  const settle = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), 1600); // чуть живёт после взаимодействия
  };
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return (
    <motion.span
      className="select-none align-middle mr-2 inline-block hero-star"
      onMouseEnter={start}
      onMouseLeave={settle}
      onMouseDown={start}
      onMouseUp={settle}
      onFocus={start}
      onBlur={settle}
      animate={
        active
          ? {
              rotate: [0, 8, -8, 0],
              scale: [1, 1.12, 1.04, 1],
              filter: [
                "drop-shadow(0 0 0px rgba(255,255,255,0))",
                "drop-shadow(0 0 6px rgba(255,255,255,0.35))",
                "drop-shadow(0 0 1px rgba(255,255,255,0.18))",
                "drop-shadow(0 0 0px rgba(255,255,255,0))",
              ],
            }
          : { rotate: 0, scale: 1, filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" }
      }
      transition={active ? { duration: 1.4, ease: "easeInOut", repeat: Infinity } : { duration: 0.3 }}
    >
      ✷
    </motion.span>
  );
}

// === Alternative Background for Advanced style ===
function AlternativeBackground() {
  useEffect(() => {
    const canvas = document.getElementById('alternative-bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Область строки ввода (приблизительные координаты)
    const searchBarArea = {
      x: window.innerWidth / 2 - 200, // центр минус половина ширины
      y: window.innerHeight / 2 - 50, // центр минус половина высоты
      width: 400,
      height: 100
    };
    
    // Настройка canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Обновляем область строки ввода при изменении размера
      searchBarArea.x = window.innerWidth / 2 - 200;
      searchBarArea.y = window.innerHeight / 2 - 50;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Массив частиц
    const particles = [];
    const particleCount = 50;
    
    // Создание частиц
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        glow: Math.random() * 0.5 + 0.5
      });
    }
    
    // Позиция мыши
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Анимация
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Обновление позиции
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Проверка, находится ли курсор над областью строки ввода
        const isMouseOverSearchBar = mouseX >= searchBarArea.x && 
                                   mouseX <= searchBarArea.x + searchBarArea.width &&
                                   mouseY >= searchBarArea.y && 
                                   mouseY <= searchBarArea.y + searchBarArea.height;
        
        // Взаимодействие с мышью (только если курсор НЕ над строкой ввода)
        if (!isMouseOverSearchBar) {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;
          }
        }
        
        // Обход области строки ввода
        const searchBarDx = (searchBarArea.x + searchBarArea.width / 2) - particle.x;
        const searchBarDy = (searchBarArea.y + searchBarArea.height / 2) - particle.y;
        const searchBarDistance = Math.sqrt(searchBarDx * searchBarDx + searchBarDy * searchBarDy);
        
        // Если частица слишком близко к области строки ввода, отталкиваем её
        if (searchBarDistance < 120) {
          const avoidForce = (120 - searchBarDistance) / 120;
          particle.vx -= (searchBarDx / searchBarDistance) * avoidForce * 0.02;
          particle.vy -= (searchBarDy / searchBarDistance) * avoidForce * 0.02;
        }
        
        // Ограничение скорости
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        // Границы экрана
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Рисование частицы с свечением
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.shadowBlur = particle.glow * 20;
        ctx.shadowColor = '#d3d3e8';
        ctx.fillStyle = '#d3d3e8';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Соединение близких частиц
        for (let j = index + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (100 - distance) / 100 * 0.3;
            ctx.strokeStyle = '#d3d3e8';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <>
      <canvas 
        id="alternative-bg-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
    </>
  );
}

// === BackgroundParticles for Advanced style ===
function BackgroundParticles() {
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load " + src));
        document.body.appendChild(s);
      });

    (async () => {
      try {
        // библиотека частиц
        await loadScript("https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js");

        window.particlesJS("particles-js", {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 } },
            opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: "#d3d3e8", opacity: 0.45, width: 1 },
            move: {
              enable: true,
              speed: 2.5,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false,
              // лёгкое «притягивание»
              attract: { enable: true, rotateX: 600, rotateY: 1200 },
            },
          },
          interactivity: {
            // слушаем окно, чтобы canvas не перехватывал клики
            detect_on: "window",
            events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
            modes: {
              grab: { distance: 220, line_linked: { opacity: 1 } },
              bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
              repulse: { distance: 200, duration: 0.4 },
              push: { particles_nb: 4 },
              remove: { particles_nb: 2 },
            },
          },
          retina_detect: true,
        });

        // stats (счётчик)
        await loadScript("https://threejs.org/examples/js/libs/stats.min.js");
        const StatsC = window.Stats;
        if (StatsC) {
          const sInst = new StatsC();
          sInst.setMode(0);
          sInst.domElement.style.position = "absolute";
          sInst.domElement.style.left = "0px";
          sInst.domElement.style.top = "0px";
          document.body.appendChild(sInst.domElement);

          const count = document.querySelector(".js-count-particles");
          const update = () => {
            sInst.begin();
            sInst.end();
            const pJSDom = window.pJSDom;
            if (pJSDom?.[0]?.pJS?.particles?.array && count) {
              count.innerText = pJSDom[0].pJS.particles.array.length.toString();
            }
            requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        }
      } catch (e) {
        console.warn("Particles init failed", e);
      }
    })();

    return () => {
      const el = document.getElementById("particles-js");
      if (el) el.innerHTML = "";
    };
  }, []);

  return (
    <>
      {/* контейнер с частицами (поверх body, но под контентом) */}
      <div id="particles-js" />
      {/* инлайновые стили */}
      <style>{`
        #particles-js{position:fixed;inset:0;width:100%;height:100%;background:transparent;z-index:0;pointer-events:none;}
        canvas{display:block;vertical-align:bottom;}
        #stats{border-radius:3px 3px 0 0;overflow:hidden;position:fixed!important;top:0;left:0;z-index:50}
      `}</style>
    </>
  );
}

// === Models (RU) ===
const MODEL_OPTIONS = [
  { id: "remove", label: "Удаление объектов" },
  { id: "plan", label: "Создание по техплану" },
  { id: "builder", label: "AI Конструктор" },
];

// === Site styles ===
const STYLE_OPTIONS = [
  { id: "advanced", label: "Продвинутый" },
  { id: "standard", label: "Стандарт" },
];

// === Advanced Style Components ===
function AdvancedSidebar({ 
  chats = [], 
  activeChatId, 
  onChatSelect, 
  onSearch, 
  searchQuery, 
  onCollapse,
  isCollapsed = false,
  searchResults = { chats: [], settings: [] },
  onSettingSelect
}) {
  // Группировка чатов по датам
  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const groups = {
      today: [],
      yesterday: [],
      thisMonth: [],
      older: []
    };
    
    chats.forEach(chat => {
      const chatDate = new Date(chat.lastMessageTime || chat.createdAt || 0);
      const chatDateOnly = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());
      
      if (chatDateOnly.getTime() === today.getTime()) {
        groups.today.push(chat);
      } else if (chatDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(chat);
      } else if (chatDate.getMonth() === now.getMonth() && chatDate.getFullYear() === now.getFullYear()) {
        groups.thisMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });
    
    return groups;
  };

  const chatGroups = groupChatsByDate(chats);
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                     'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  if (isCollapsed) {
  return (
      <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm w-16">
        <div className="p-3">
          <div className="w-full h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-neutral-400" />
          </div>
        </div>
        <nav className="px-2 text-sm flex-1 space-y-2">
          <button 
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Чат"
          >
            <MessageSquare className="h-4 w-4 text-neutral-400" />
          </button>
          <button 
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Голос"
          >
            <Mic className="h-4 w-4 text-neutral-400" />
          </button>
          <button 
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Imagine"
          >
            <ImageIcon className="h-4 w-4 text-neutral-400" />
          </button>
          <button 
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Проекты"
          >
            <Folder className="h-4 w-4 text-neutral-400" />
          </button>
        </nav>
        <div className="p-3 flex items-center justify-between">
          <div className="size-7 rounded-full bg-white/10 grid place-items-center text-xs">D</div>
          <button 
            onClick={onCollapse}
            className="text-neutral-500 hover:text-neutral-300 transition" 
            title="Развернуть панель"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm w-64">
      {/* Top: search */}
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 hover:ring-white/20 transition">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            placeholder="Поиск ⌘K"
            className="bg-transparent placeholder:text-neutral-500 text-sm outline-none w-full"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 text-sm">
        <AdvancedSectionTitle>Главное</AdvancedSectionTitle>
        <AdvancedNavItem active Icon={MessageSquare} label="Чат" />
        <AdvancedNavItem Icon={Mic} label="Голос" />
        <div className="relative">
          <AdvancedNavItem Icon={ImageIcon} label="Imagine" />
          <span className="absolute left-[30px] top-2 h-2 w-2 rounded-full bg-sky-400" />
        </div>
        <AdvancedNavItem Icon={Folder} label="Проекты" />
        
        <AdvancedSectionTitle className="mt-2">История</AdvancedSectionTitle>
        
        {/* Результаты поиска */}
        {searchQuery.trim() && (
          <>
            {searchResults.chats.length > 0 && (
              <>
                <AdvancedHistoryDate label="Чаты" />
                {searchResults.chats.map(chat => (
                  <AdvancedHistoryLink 
                    key={chat.id}
                    label={chat.title || "Новый чат"}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                  />
                ))}
              </>
            )}
            
            {searchResults.settings.length > 0 && (
              <>
                <AdvancedHistoryDate label="Настройки" />
                {searchResults.settings.map((setting, index) => (
                  <button
                    key={`setting-${index}`}
                    onClick={() => onSettingSelect?.(setting)}
                    className="block w-full text-left py-1.5 px-3 rounded-md truncate cursor-pointer transition text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                  >
                    <div className="text-sm">{setting.label}</div>
                    <div className="text-xs text-neutral-500">{setting.category}</div>
                  </button>
                ))}
              </>
            )}
            
            {searchResults.chats.length === 0 && searchResults.settings.length === 0 && (
              <div className="px-3 py-2 text-sm text-neutral-500">
                Ничего не найдено
              </div>
            )}
          </>
        )}
        
        {/* Обычная история (если нет поиска) */}
        {!searchQuery.trim() && (
          <>
            {/* Сегодня */}
            {chatGroups.today.length > 0 && (
              <>
                <AdvancedHistoryDate label="Сегодня" />
                {chatGroups.today.map(chat => (
                  <AdvancedHistoryLink 
                    key={chat.id}
                    label={chat.title || "Новый чат"}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                  />
                ))}
              </>
            )}
            
            {/* Вчера */}
            {chatGroups.yesterday.length > 0 && (
              <>
                <AdvancedHistoryDate label="Вчера" />
                {chatGroups.yesterday.map(chat => (
                  <AdvancedHistoryLink 
                    key={chat.id}
                    label={chat.title || "Новый чат"}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                  />
                ))}
              </>
            )}
            
            {/* Этот месяц */}
            {chatGroups.thisMonth.length > 0 && (
              <>
                <AdvancedHistoryDate label={monthNames[new Date().getMonth()]} />
                {chatGroups.thisMonth.map(chat => (
                  <AdvancedHistoryLink 
                    key={chat.id}
                    label={chat.title || "Новый чат"}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                  />
                ))}
              </>
            )}
            
            {/* Старые чаты */}
            {chatGroups.older.length > 0 && (
              <>
                <AdvancedHistoryDate label="Ранее" />
                {chatGroups.older.map(chat => (
                  <AdvancedHistoryLink 
                    key={chat.id}
                    label={chat.title || "Новый чат"}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </nav>

      <div className="mt-auto px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-white/10 grid place-items-center">D</div>
        </div>
        <button 
          onClick={onCollapse}
          className="text-neutral-500 hover:text-neutral-300 transition" 
          title={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}

function AdvancedSectionTitle({ children, className = "" }) {
  return (
    <div className={`px-2 pb-1 pt-4 text-[11px] uppercase tracking-wider text-neutral-500 ${className}`}>
      {children}
    </div>
  );
}

function AdvancedNavItem({ Icon, label, active }) {
  return (
    <button
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 my-0.5 transition text-left ${
        active
          ? "bg-white/10 text-white"
          : "text-neutral-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function AdvancedHistoryLink({ label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`block w-full text-left py-1.5 px-3 rounded-md truncate cursor-pointer transition ${
        active 
          ? "text-white bg-white/10" 
          : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}

function AdvancedHistoryDate({ label }) {
  return (
    <div className="px-3 pt-4 pb-1 text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
  );
}

function AdvancedMainArea({ backgroundType, onBackgroundChange, onAttach, attachments = [], modelMenuOpen, onModelMenuToggle }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPromoCard, setShowPromoCard] = useState(true);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen">
      <AdvancedTopBar />

      <div className="mx-auto max-w-3xl px-6 w-full">
        <AdvancedLogoMark />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <AdvancedSearchBar 
            onAdvanced={() => setShowAdvanced(true)} 
            onAttach={onAttach}
            attachments={attachments}
            modelMenuOpen={modelMenuOpen}
            onModelMenuToggle={onModelMenuToggle}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="mt-6 flex justify-center"
        >
          {showAdvanced ? (
            <AdvancedAdvancedRow 
              backgroundType={backgroundType}
              onBackgroundChange={onBackgroundChange}
              modelMenuOpen={modelMenuOpen}
              onModelMenuToggle={onModelMenuToggle}
            />
          ) : showPromoCard ? (
            <AdvancedPromoCard onClose={() => {
              setShowPromoCard(false);
              setShowAdvanced(true);
            }} />
          ) : null}
        </motion.div>
      </div>

      <AdvancedSuperBanner />
    </main>
  );
}

function AdvancedTopBar() {
  return (
    <div className="flex h-14 items-center justify-end px-6 border-b border-white/5 sticky top-0 z-10">
    </div>
  );
}

function AdvancedLogoMark() {
  return (
    <div className="flex items-center justify-center gap-3 select-none">
      {/* Black-hole logo with micro-circuit motif */}
      <svg width="56" height="56" viewBox="0 0 64 64" className="drop-shadow-[0_0_24px_rgba(255,255,255,0.10)]">
        <defs>
          <radialGradient id="hole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" />
            <stop offset="55%" stopColor="#0b0b0e" />
            <stop offset="100%" stopColor="#1a1d24" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#9fb4ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#7aa2ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7aa2ff" stopOpacity="0.0" />
          </radialGradient>
        </defs>
        {/* accretion disk */}
        <circle cx="32" cy="32" r="18" fill="url(#hole)" />
        <ellipse cx="32" cy="32" rx="24" ry="10" fill="none" stroke="url(#glow)" strokeWidth="3" />
        <ellipse cx="32" cy="32" rx="18" ry="7" fill="none" stroke="#8fb0ff" strokeOpacity="0.35" strokeWidth="2" />
        {/* micro-circuit traces */}
        <g stroke="#cfe1ff" strokeOpacity="0.6" strokeWidth="1.2" fill="none" strokeLinecap="round">
          <path d="M20 22 l-6 -4 m0 0 l-3 2 m3 -2 l0 6" />
          <path d="M44 20 l6 -4 m0 0 l3 2 m-3 -2 l0 6" />
          <path d="M18 44 l-6 4 m0 0 l-3 -2 m3 2 l0 -6" />
          <path d="M46 44 l6 4 m0 0 l3 -2 m-3 2 l0 -6" />
          {/* pads */}
          <circle cx="14" cy="18" r="1.5" fill="#d8e6ff" />
          <circle cx="50" cy="18" r="1.5" fill="#d8e6ff" />
          <circle cx="14" cy="46" r="1.5" fill="#d8e6ff" />
          <circle cx="50" cy="46" r="1.5" fill="#d8e6ff" />
        </g>
      </svg>
      <span className="text-5xl font-semibold tracking-tight">Plan AI</span>
    </div>
  );
}

function AdvancedSearchBar({ onAdvanced, onAttach, attachments = [], modelMenuOpen, onModelMenuToggle }) {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState("techplan");
  const [techplanMode, setTechplanMode] = useState(null);

  const canSend = model === "3d" ? query.trim().length > 0 : techplanMode !== null;

  return (
    <div className="relative z-20 mt-8 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <div className="flex items-center gap-3 px-4 md:px-6">
        <button
          onClick={onAttach}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Прикрепить файл"
        >
          <Paperclip className="h-5 w-5 text-neutral-400 hover:text-neutral-200" />
        </button>

        {/* Center area: input / techplan toggles / empty for cleanup */}
        {model === "3d" && (
          <input
            placeholder="Что ты хочешь узнать?"
            className="flex-1 bg-transparent py-4 md:py-5 text-[15px] placeholder:text-neutral-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        {model === "techplan" && (
          <div className="flex-1 py-3 md:py-4 flex items-center gap-2">
            <AdvancedToggleChip
              label="С мебелью"
              active={techplanMode === "with"}
              onClick={() => {
                setTechplanMode("with");
                onAdvanced?.();
              }}
            />
            <AdvancedToggleChip
              label="Без мебели"
              active={techplanMode === "without"}
              onClick={() => {
                setTechplanMode("without");
                onAdvanced?.();
              }}
            />
          </div>
        )}

        {model === "cleanup" && <div className="flex-1 py-4 md:py-5" />}

        {/* Right controls: model selector + Send button */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <AdvancedModelMenu
            value={model}
            onChange={(m) => {
              setModel(m);
              onAdvanced?.();
            }}
            isOpen={modelMenuOpen}
            onToggle={onModelMenuToggle}
          />

          <button
            type="button"
            title="Отправить"
            disabled={!canSend}
            className="ml-1 rounded-full p-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => {
              if (!canSend) return;
              const payload = { model, query, techplanMode };
              console.log("send:", payload);
            }}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 md:px-6 pb-4">
          <div className="text-xs text-neutral-500 mb-2">Прикрепленные файлы: {attachments.length}</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative group">
                <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => onAttach?.(attachment.id, 'remove')}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancedToggleChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm ring-1 transition ${
        active
          ? "bg-white/15 ring-white/20 text-white"
          : "bg-white/5 ring-white/10 text-neutral-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function AdvancedModelMenu({ value, onChange, isOpen, onToggle }) {
  const [open, setOpen] = useState(false);
  
  // Используем внешнее состояние, если оно передано
  const isMenuOpen = isOpen !== undefined ? isOpen : open;
  const toggleMenu = onToggle || (() => setOpen(!open));
  const items = [
    { key: "techplan", label: "Создание по техплану", sub: "Перерисовать 2D план из фото техплана", Icon: AdvancedIconTechplan },
    { key: "cleanup", label: "Удаление объектов", sub: "Очистить фото комнаты от мебели и мусора", Icon: AdvancedIconCleanup },
    { key: "3d", label: "3D план", sub: "Сгенерировать 3D-просмотр из данных плана", Icon: AdvancedIcon3D },
  ];

  const current = items.find((i) => i.key === value);

  return (
    <div className="relative" data-model-menu>
      <button
        type="button"
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
      >
        <current.Icon className="h-4 w-4" />
        <span>{current.label}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 z-40 w-64 rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-50">
          {items.map((it, idx) => (
            <button
              key={it.key}
              onClick={() => {
                onChange(it.key);
                if (onToggle) {
                  onToggle(false);
                } else {
                  setOpen(false);
                }
              }}
              className={`w-full text-left px-2 py-2 rounded-lg hover:bg-white/10 transition ${
                value === it.key ? "bg-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <it.Icon className="h-4 w-4 text-neutral-200" />
                <div className="flex-1">
                  <div className="text-xs font-medium">{it.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{it.sub}</div>
                </div>
                {value === it.key && <Check className="h-3 w-3" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdvancedIconTechplan({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16M4 9h10M4 13h16M4 17h8" />
    </svg>
  );
}

function AdvancedIconCleanup({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
    </svg>
  );
}

function AdvancedIcon3D({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
      <path d="M12 7l7 4M12 7L5 11M12 21V7" />
    </svg>
  );
}

function AdvancedPromoCard({ onClose }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative z-10 mx-auto w-[60%] max-w-xl">
      {/* Крестик в круглом фоне, выходящем за границы окна */}
      <motion.button
        className="absolute z-20 w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-lg"
        style={{ 
          backgroundColor: '#252628',
          top: '-12px',
          right: '-12px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        title="Закрыть"
      >
        <motion.div
          animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <X className="h-3 w-3" style={{ color: '#d3d3e8' }} />
        </motion.div>
      </motion.button>

      {/* Основное окно с округленными углами */}
      <div className="relative bg-gradient-to-br from-[#171b24] via-[#141827] to-[#0c0e14] overflow-hidden" 
           style={{ 
             borderRadius: '40px 0px 40px 40px', // Максимально округленные углы кроме правого верхнего (0px)
             border: '1px solid #252628'
           }}>

        <div className="relative w-full h-24 md:h-32" style={{ aspectRatio: '2048/512' }}>
        {!imageError ? (
        <img
          alt="promo"
          className="absolute inset-0 h-full w-full object-cover"
            src={`${import.meta.env.BASE_URL}promo_floor.jpg?v=${Date.now()}`}
            onError={() => {
              console.log('Ошибка загрузки изображения promo_floor.jpg');
              setImageError(true);
            }}
            onLoad={() => console.log('Изображение promo_floor.jpg загружено успешно')}
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <img
              alt="fallback promo"
              className="h-full w-full object-cover opacity-50"
              src={`${import.meta.env.BASE_URL}hero.jpg`}
              onError={() => {
                console.log('Fallback изображение также не загрузилось');
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-sm font-medium">Промо изображение</div>
                <div className="text-xs mt-1 opacity-75">promo_floor.jpg</div>
              </div>
            </div>
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px),repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
      </div>

        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm md:text-lg font-semibold leading-tight">Вообрази что угодно</div>
              <div className="text-xs text-neutral-300">Генерируй изображения и видео с помощью Grok</div>
            </div>
            <button className="shrink-0 rounded-lg bg-white/90 text-black px-3 py-1.5 text-xs hover:bg-white transition">Перейти</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedAdvancedRow({ backgroundType, onBackgroundChange, modelMenuOpen, onModelMenuToggle }) {
  const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
  const [themesMenuOpen, setThemesMenuOpen] = useState(false);
  const [bg, setBg] = useState(null);

  const bgOptions = [
    "Тёмный премиум",
    "Светлый",
    "VENOM",
    "DNA-liquid",
    "Графит",
    "Шахматный",
    "Чистый",
  ];

  const backgroundOptions = [
    { id: "standard", label: "Стандартный", description: "Простой фон без частиц" },
    { id: "interactive", label: "Интерактивный", description: "Фон с частицами и взаимодействием" },
    { id: "alternative", label: "Альтернативный", description: "Космический фон с летающими точками" }
  ];

  // Закрытие меню при клике вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (backgroundMenuOpen || themesMenuOpen || modelMenuOpen) {
        const target = event.target;
        const isBackgroundMenu = target.closest('[data-background-menu]');
        const isThemesMenu = target.closest('[data-themes-menu]');
        const isModelMenu = target.closest('[data-model-menu]');
        
        if (!isBackgroundMenu && !isThemesMenu && !isModelMenu) {
          setBackgroundMenuOpen(false);
          setThemesMenuOpen(false);
          onModelMenuToggle?.(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [backgroundMenuOpen, themesMenuOpen, modelMenuOpen, onModelMenuToggle]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button className="flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10">
        <ImageIcon className="h-4 w-4" />
        <span className="text-sm">Параметры плана</span>
      </button>

      <div className="relative" data-background-menu>
        <button 
          onClick={() => {
            setBackgroundMenuOpen((v) => !v);
            setThemesMenuOpen(false); // Закрываем другое меню
            onModelMenuToggle?.(false); // Закрываем меню модели
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
        >
        <Layers className="h-4 w-4" />
          <span className="text-sm">Фон страницы</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
        {backgroundMenuOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-50">
            {backgroundOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onBackgroundChange?.(option.id);
                  setBackgroundMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-2 rounded-lg hover:bg-white/10 transition ${
                  backgroundType === option.id ? "bg-white/10" : ""
                }`}
              >
                <div className="text-xs font-medium">{option.label}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative" data-themes-menu>
        <button
          onClick={() => {
            setThemesMenuOpen((v) => !v);
            setBackgroundMenuOpen(false); // Закрываем другое меню
            onModelMenuToggle?.(false); // Закрываем меню модели
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
        >
          <Palette className="h-4 w-4" />
          <span className="text-sm">{bg ? `Фон: ${bg}` : "Фоны"}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
        {themesMenuOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-50">
            {bgOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setBg(opt);
                  setThemesMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-2 rounded-lg hover:bg-white/10 transition ${
                  bg === opt ? "bg-white/10" : ""
                }`}
              >
                <div className="text-xs font-medium">{opt}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdvancedSuperBanner() {
  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-20">
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-lg shadow-2xl">
        <div>
          <div className="text-sm font-medium">SuperGrok</div>
          <div className="text-xs text-neutral-400">Разблокируй расширенные возможности</div>
        </div>
        <button className="rounded-xl bg-white/90 text-black px-4 py-2 text-sm hover:bg-white transition">Улучшить</button>
      </div>
    </div>
  );
}

export default function MonochromeClaudeStyle() {
  const { user } = useAuth();
  const [model, setModel] = useState(MODEL_OPTIONS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [value, setValue] = useState("");
  const [removeDepth, setRemoveDepth] = useState(null); // null | 'surface' | 'partial' | 'full' // surface | partial | full
  const [planFurniture, setPlanFurniture] = useState(null); // 'with' | 'without' | null
  const [attachments, setAttachments] = useState([]); // {id,name,size,url,file}
  const fileInputRef = useRef(null);
  const textRef = useRef(null);

  // Chats state
  const [chats, setChats] = useState(() => [{ id: `chat-${Date.now()}`, title: "Новый чат", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id);
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasFirstMessage, setHasFirstMessage] = useState(false);
  const [responses, setResponses] = useState({}); // { messageId: { text, rating, canRegenerate } }

  // Right drawer
  const [rightOpen, setRightOpen] = useState(false);
  const [rightTab, setRightTab] = useState("chats"); // 'chats' | 'settings'

  // Site style (persisted per user)
  const [userId] = useState(() => {
    if (typeof window === "undefined") return "anon";
    return localStorage.getItem("userId") || "anon";
  });
  const [siteStyle, setSiteStyle] = useState(() => {
    if (typeof window === "undefined") return STYLE_OPTIONS[0].id; // Advanced by default
    return localStorage.getItem(`siteStyle@${localStorage.getItem("userId") || "anon"}`) || STYLE_OPTIONS[0].id;
  });
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-style", siteStyle);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(`siteStyle@${userId}`, siteStyle);
    }
  }, [siteStyle, userId]);

  // Advanced style states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filteredChats, setFilteredChats] = useState(chats);
  const [backgroundType, setBackgroundType] = useState("interactive");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  // Фильтрация чатов и настроек по поисковому запросу
  const [searchResults, setSearchResults] = useState({ chats: [], settings: [] });
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      setSearchResults({ chats: [], settings: [] });
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Поиск по чатам
    const filteredChats = chats.filter(chat => 
      chat.title?.toLowerCase().includes(query) ||
      chat.messages?.some(msg => 
        msg.text?.toLowerCase().includes(query)
      )
    );
    
    // Поиск по настройкам
    const settingsOptions = [
      { id: 'style', label: 'Стиль сайта', options: STYLE_OPTIONS },
      { id: 'model', label: 'Модель', options: MODEL_OPTIONS },
      { id: 'background', label: 'Фон страницы', options: [
        { id: 'standard', label: 'Стандартный' },
        { id: 'interactive', label: 'Интерактивный' },
        { id: 'alternative', label: 'Альтернативный' }
      ]}
    ];
    
    const filteredSettings = settingsOptions.flatMap(category => 
      category.options.filter(option => 
        option.label.toLowerCase().includes(query) ||
        category.label.toLowerCase().includes(query)
      ).map(option => ({
        ...option,
        category: category.label,
        categoryId: category.id
      }))
    );
    
    setFilteredChats(filteredChats);
    setSearchResults({ chats: filteredChats, settings: filteredSettings });
  }, [searchQuery, chats]);

  // Обработка выбора настроек из поиска
  const handleSettingSelect = (setting) => {
    switch (setting.categoryId) {
      case 'style':
        setSiteStyle(setting.id);
        break;
      case 'model':
        setModel(MODEL_OPTIONS.find(m => m.id === setting.id) || MODEL_OPTIONS[0]);
        break;
      case 'background':
        setBackgroundType(setting.id);
        break;
      default:
        break;
    }
    setSearchQuery(""); // Очищаем поиск после выбора
  };


  const settingsBtnRef = useRef(null);

  const isRemove = model.id === "remove";
  const isPlan = model.id === "plan";

  const canSend = (isRemove || isPlan)
    ? attachments.length > 0
    : (value.trim().length > 0 || attachments.length > 0);

  const send = async () => {
    if (!canSend) return;
    let content = value;
    if (isRemove) {
      content = `Удаление объектов — Полностью`;
    } else if (isPlan) {
      content = `Создание по техплану — ${planFurniture === "with" ? "С мебелью" : "Без мебели"}`;
    }
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user",
      model: model.id,
      text: content,
      attachments: attachments.map((a) => ({ id: a.id, name: a.name, url: a.url })),
      time: new Date().toISOString(),
    };
    
    // Mark as first message if this is the first user message
    if (!hasFirstMessage) {
      setHasFirstMessage(true);
    }
    
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              title: c.messages.length ? c.title : content || "Новый чат",
              messages: [...c.messages, msg],
              lastMessageTime: new Date().toISOString(),
            }
          : c
      )
    );
    
    // Start generation process
    setIsGenerating(true);
    
    try {
      let responseText = "";
      let responseImage = null;

      if (isPlan && attachments.length > 0) {
        // Генерация технического плана
        const formData = new FormData();
        formData.append('image', attachments[0].file);
        formData.append('mode', planFurniture === "with" ? "withFurniture" : "withoutFurniture");

        const response = await fetch('/api/generate-technical-plan', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка генерации технического плана');
        }

        // Получаем изображение как blob
        const imageBlob = await response.blob();
        responseImage = URL.createObjectURL(imageBlob);
        responseText = `Технический план успешно создан в режиме "${planFurniture === "with" ? "С мебелью" : "Без мебели"}".`;
      } else {
        // Обычная обработка для других моделей
        responseText = `Вот результат обработки вашего запроса "${content}".`;
      }
      
      setResponses(prev => ({
        ...prev,
        [msg.id]: {
          text: responseText,
          image: responseImage,
          rating: null,
          canRegenerate: true
        }
      }));
    } catch (error) {
      console.error('Ошибка генерации:', error);
      setResponses(prev => ({
        ...prev,
        [msg.id]: {
          text: `Ошибка: ${error.message}`,
          rating: null,
          canRegenerate: true
        }
      }));
    } finally {
      setIsGenerating(false);
    }
    
    // cleanup
    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setAttachments([]);
    setValue("");
  };

  // Attachments cleanup on unmount
  useEffect(() => () => { attachments.forEach((a) => URL.revokeObjectURL(a.url)); }, [attachments]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowModelMenu(false);
        setRightOpen(false);
      }
      if (isPlan || isRemove) return;
      if (e.key === "Enter" && !e.shiftKey) {
        const el = document.activeElement;
        if (el && textRef.current && el === textRef.current) {
          e.preventDefault();
          send();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, isPlan, isRemove, removeDepth, planFurniture, canSend, attachments.length]);

  const openRight = (tab = "chats") => {
    setRightTab(tab);
    setRightOpen(true);
  };

  const createChat = () => {
    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const chat = { 
      id, 
      title: "Новый чат", 
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageTime: new Date().toISOString()
    };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(id);
    setLeftOpen(false);
    setValue("");
    setAttachments([]);
    setPlanFurniture(null);
    setRemoveDepth(null);
    setHasFirstMessage(false);
    setIsGenerating(false);
    setResponses({});
  };

  const deleteActiveChat = () => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== activeChatId);
      const next = filtered.length
        ? filtered
        : [{ id: `chat-${Date.now()}`, title: "Новый чат", messages: [] }];
      setActiveChatId(next[0].id);
      setHasFirstMessage(next[0].messages.length > 0);
      setIsGenerating(false);
      setResponses({});
      return next;
    });
  };

  const deleteChat = (chatId) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId);
      const next = filtered.length
        ? filtered
        : [{ id: `chat-${Date.now()}`, title: "Новый чат", messages: [] }];
      
      // Если удаляем активный чат, переключаемся на первый доступный
      if (chatId === activeChatId) {
        setActiveChatId(next[0].id);
        setHasFirstMessage(next[0].messages.length > 0);
        setIsGenerating(false);
        setResponses({});
      }
      
      return next;
    });
  };

  const onAttachClick = () => fileInputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    const items = imgs.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      file,
    }));
    if (items.length) setAttachments((prev) => [...prev, ...items]);
    e.target.value = ""; // allow re-upload same file
  };
  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  // Response actions
  const rateResponse = (messageId, rating) => {
    setResponses(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        rating
      }
    }));
  };

  const regenerateResponse = (messageId) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResponses(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          text: prev[messageId].text + " (обновлено)",
          canRegenerate: true
        }
      }));
    }, 2000);
  };

  // Advanced style layout
  if (siteStyle === "advanced") {
    return (
      <div data-style={siteStyle} className="relative min-h-screen w-full text-neutral-200 antialiased" style={{ backgroundColor: '#161618' }}>
        {backgroundType === "interactive" && <BackgroundParticles />}
        {backgroundType === "alternative" && <AlternativeBackground />}
        <div className={`relative z-10 grid min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'grid-cols-[64px_1fr]' : 'grid-cols-[256px_1fr]'
        }`}>
          <AdvancedSidebar 
            chats={filteredChats}
            activeChatId={activeChatId}
            onChatSelect={(chatId) => {
              setActiveChatId(chatId);
              setHasFirstMessage(chats.find(c => c.id === chatId)?.messages.length > 0);
              setIsGenerating(false);
              setResponses({});
            }}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isCollapsed={isSidebarCollapsed}
            searchResults={searchResults}
            onSettingSelect={handleSettingSelect}
          />
          <AdvancedMainArea 
            backgroundType={backgroundType}
            onBackgroundChange={setBackgroundType}
            onAttach={(id, action) => {
              if (action === 'remove') {
                removeAttachment(id);
              } else {
                onAttachClick();
              }
            }}
            attachments={attachments}
            modelMenuOpen={modelMenuOpen}
            onModelMenuToggle={setModelMenuOpen}
          />
        </div>
      </div>
    );
  }

  // Standard style layout
  return (
    <div data-style={siteStyle} className="min-h-screen themed-root antialiased relative overflow-hidden">
      <div className="flex h-screen relative z-10">
        {/* ==== Left rail - Desktop only ==== */}
        <aside className="hidden md:flex w-16 shrink-0 theme-border border-r theme-panel backdrop-blur flex-col items-center justify-between py-4">
          <div className="flex flex-col items-center gap-4">
            {/* По клику на панель — открываем правую панель с чатами */}
            <button onClick={() => openRight("chats")} className="h-10 w-10 grid place-items-center rounded-md hover:bg-black/10" title="Список чатов">
              <PanelLeft className="h-5 w-5" />
      </button>
            <button onClick={createChat} className="h-10 w-10 grid place-items-center rounded-md hover:bg-black/10" title="Новый чат">
              <Plus className="h-5 w-5" />
      </button>
            <button onClick={deleteActiveChat} className="h-10 w-10 grid place-items-center rounded-md hover:bg-black/10" title="Удалить текущий чат">
              <Trash2 className="h-5 w-5" />
            </button>
            <button ref={settingsBtnRef} onClick={() => openRight("settings")} className="h-10 w-10 grid place-items-center rounded-md hover:bg-black/10" title="Настройки">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-black/20 grid place-items-center text-xs font-semibold">DC</div>
        </aside>

        {/* ==== Main content ==== */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between p-4 theme-border border-b theme-panel">
            <button onClick={() => openRight("chats")} className="h-10 w-10 grid place-items-center rounded-md hover:bg-black/10" title="Список чатов">
              <PanelLeft className="h-5 w-5" />
        </button>
            <div className="text-sm font-medium">Plan AI</div>
            <button onClick={() => openRight("settings")} className="h-10 w-10 grid place-items-center rounded-md hover:bg-black/10" title="Настройки">
              <Settings className="h-5 w-5" />
      </button>
          </div>

          <div className={cn("flex-1 flex flex-col items-center", hasFirstMessage ? "justify-start" : "justify-center")}>
            <motion.div 
              className="mx-auto max-w-3xl px-4 md:px-6 w-full"
              animate={{
                justifyContent: hasFirstMessage ? "flex-start" : "center",
                paddingTop: hasFirstMessage ? "1rem" : "0"
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
            {/* top label */}
            <div className="flex justify-center px-4 md:px-0">
              <span className="inline-flex items-center gap-2 rounded-full theme-border theme-panel px-3 py-1 text-xs theme-text-muted">
                Plan AI
                <span className="opacity-50">·</span>
                <span className="uppercase tracking-wider hidden sm:inline">Стиль: {STYLE_OPTIONS.find((s) => s.id === siteStyle)?.label}</span>
                <span className="uppercase tracking-wider sm:hidden">{STYLE_OPTIONS.find((s) => s.id === siteStyle)?.label}</span>
              </span>
          </div>

            {/* hero title */}
            <div className="mt-4 md:mt-6 flex justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-lg sm:text-xl md:text-3xl font-semibold tracking-tight leading-tight font-hero text-center md:text-left px-4 md:px-0"
              >
                <TwinkleStar />
                <span className="block sm:inline">
                  {user ? `Приветствую, ${user.name}` : "Рады Вас видеть!"}
                </span>
              </motion.h1>
      </div>

            {/* messages */}
            {activeChat?.messages?.length > 0 && (
              <div className="mt-6 md:mt-8 mb-4 md:mb-6 space-y-4 md:space-y-6">
                {activeChat.messages.map((m) => (
                  <div key={m.id} className="space-y-3 md:space-y-4">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] md:max-w-[80%] rounded-lg theme-border theme-panel-muted px-3 py-2">
                        <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                        {m.attachments?.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {m.attachments.map((att) => (
                              <img key={att.id} src={att.url} alt={att.name} className="w-full max-w-sm md:max-w-md rounded-lg theme-border"/>
                            ))}
        </div>
                        )}
                        <div className="mt-1 text-[11px] theme-text-muted">{new Date(m.time).toLocaleTimeString()}</div>
      </div>
    </div>
                    
                    {/* AI Response */}
                    {responses[m.id] && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[80%] rounded-lg theme-border theme-panel-muted px-3 py-2">
                          <div className="text-sm whitespace-pre-wrap">{responses[m.id].text}</div>
                          
                          {/* Сгенерированное изображение */}
                          {responses[m.id].image && (
                            <div className="mt-3">
                              <img 
                                src={responses[m.id].image} 
                                alt="Сгенерированный технический план" 
                                className="w-full max-w-md rounded-lg theme-border"
                              />
                            </div>
                          )}
                          
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => rateResponse(m.id, responses[m.id].rating === 'like' ? null : 'like')}
                              className={cn(
                                "h-8 w-8 rounded-lg grid place-items-center transition-colors",
                                responses[m.id].rating === 'like' 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "hover:bg-gray-500/20 text-white"
                              )}
                              title="Лайк"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => rateResponse(m.id, responses[m.id].rating === 'dislike' ? null : 'dislike')}
                              className={cn(
                                "h-8 w-8 rounded-lg grid place-items-center transition-colors",
                                responses[m.id].rating === 'dislike' 
                                  ? "bg-red-500/20 text-red-400" 
                                  : "hover:bg-gray-500/20 text-white"
                              )}
                              title="Дизлайк"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                            {responses[m.id].canRegenerate && (
                              <button
                                onClick={() => regenerateResponse(m.id)}
                                className="h-8 px-3 rounded-lg text-xs theme-border theme-panel hover:opacity-90"
                                title="Повторить"
                              >
                                Повторить
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Generation message */}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg theme-border theme-panel-muted px-3 py-2">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-hero">Генерируется</span>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="text-2xl"
                        >
                          ✷
                        </motion.div>
                      </div>
                      <div className="text-xs theme-text-muted mt-1">Немного стоит подождать...</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Composer - Centered before first message */}
            {!hasFirstMessage && (
              <div className="mt-6 md:mt-8 flex">
                <div className={cn("w-full max-w-2xl rounded-lg backdrop-blur relative theme-panel theme-border","shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]") }>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      {/* left: attach */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={onAttachClick}
                          className={cn(
                            "h-8 w-8 rounded-lg grid place-items-center",
                            "theme-border theme-panel hover:opacity-90"
                          )}
                          title="Прикрепить файл"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={onFilesSelected}
                        />
                      </div>

                      {/* center: content */}
                      {isPlan ? (
                        <div className="flex w-full items-center gap-1 md:gap-2 flex-wrap">
                          <button
                            onClick={() => setPlanFurniture("with")}
                            className={cn(
                              "rounded-md border px-2 md:px-3 py-2 text-xs md:text-sm",
                              planFurniture === "with" ? "accent-button" : "theme-panel theme-border"
                            )}
                          >
                            С мебелью
                          </button>
                          <button
                            onClick={() => setPlanFurniture("without")}
                            className={cn(
                              "rounded-md border px-2 md:px-3 py-2 text-xs md:text-sm",
                              planFurniture === "without" ? "accent-button" : "theme-panel theme-border"
                            )}
                          >
                            Без мебели
                          </button>
                        </div>
                      ) : isRemove ? (
                        <div className="flex w-full items-center gap-2">
                          <button
                            onClick={() => setRemoveDepth("full")}
                            className={cn("rounded-md px-3 py-2 text-sm border", removeDepth === "full" ? "accent-button" : "theme-panel theme-border")}
                          >
                            Полностью
                          </button>
                        </div>
                      ) : (
                        <textarea
                          ref={textRef}
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          rows={3}
                          placeholder="Опишите задачу…"
                          className={cn(
                            "min-h-[84px] w-full resize-none bg-transparent text-[15px] leading-6 outline-none",
                            "placeholder:theme-text-muted"
                          )}
                        />
                      )}

                      {/* right: Model then Send (в одну линию) */}
                      <div className="flex shrink-0 items-center gap-1 md:gap-2 self-end pb-1 relative">
                        <div className="relative">
                          <button
                            onClick={() => setShowModelMenu((v) => !v)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg px-2 md:px-2.5 py-1.5 text-xs md:text-sm",
                              "theme-panel theme-border hover:opacity-90"
                            )}
                          >
                            <span className="hidden sm:inline">{model.label}</span>
                            <span className="sm:hidden">{model.label.split(' ')[0]}</span>
                            <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          {showModelMenu && (
                            <div className="absolute right-0 top-10 z-20 w-48 md:w-56 rounded-md theme-border theme-panel shadow-lg">
                              {MODEL_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => {
                                    setModel(opt);
                                    setShowModelMenu(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-sm hover:opacity-90",
                                    opt.id === model.id && "opacity-100"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={send}
                          disabled={!canSend || isGenerating}
                          className={cn(
                            "h-8 w-8 md:h-9 md:w-9 rounded-md grid place-items-center border",
                            isGenerating 
                              ? "disabled-button" 
                              : canSend 
                                ? "accent-button" 
                                : "disabled-button"
                          )}
                          title={isGenerating ? "Генерируется..." : "Отправить"}
                        >
                          {isGenerating ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="text-base md:text-lg"
                            >
                              ✷
                            </motion.div>
                          ) : (
                            <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    { ((isRemove || isPlan) && attachments.length === 0) && (
                      <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}} transition={{duration:0.25}}
                        className="mt-2 rounded-lg theme-border theme-panel px-3 py-2 text-xs theme-text-muted">
                        Чтобы сгенерировать — прикрепите хотя бы одну фотографию.
                      </motion.div>
                    )}

                    {/* attachments preview (below model/select & send) */}
                    {attachments.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs theme-text-muted mb-2">Вложения: {attachments.length}</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {attachments.map((a) => (
                            <div key={a.id} className="group relative overflow-hidden rounded-md theme-border theme-panel-muted">
                              <img src={a.url} alt={a.name} className="h-24 w-full object-cover" loading="lazy" />
                              <button
                                onClick={() => removeAttachment(a.id)}
                                className="absolute top-1 right-1 hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md theme-panel theme-border backdrop-blur"
                                title="Удалить"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* bottom area: status */}
                  <div className={cn("flex items-center justify-between px-3 py-2 text-xs border-t theme-border theme-text-muted")}>
                    <div>
                      {isRemove && <>{removeDepth ? 'Режим удаления: Полностью' : 'Выберите режим удаления'}</>}
                      {isPlan && <>{planFurniture ? `Выбрано: ${planFurniture === 'with' ? 'С мебелью' : 'Без мебели'}` : 'Выберите режим: «С мебелью» или «Без мебели»'}</>}
                      {!isRemove && !isPlan && <>Enter — отправить • Shift+Enter — новая строка</>}
                    </div>
                    <div>Модель: {model.label}</div>
                  </div>
                </div>
              </div>
            )}

            {/* chips удалены по запросу */}
          </motion.div>
          </div>
          
          {/* Composer - Fixed at bottom after first message */}
          {hasFirstMessage && (
            <div className="sticky bottom-0 bg-themed-root/80 backdrop-blur-sm p-2 md:p-4">
              <div className="mx-auto max-w-3xl">
                <div className={cn("w-full rounded-lg backdrop-blur relative theme-panel theme-border","shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]") }>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* left: attach */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={onAttachClick}
                        className={cn(
                          "h-8 w-8 rounded-lg grid place-items-center",
                          "theme-border theme-panel hover:opacity-90"
                        )}
                        title="Прикрепить файл"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onFilesSelected}
                      />
                    </div>

                    {/* center: content */}
                    {isPlan ? (
                      <div className="flex w-full items-center gap-1 md:gap-2 flex-wrap">
                        <button
                          onClick={() => setPlanFurniture("with")}
                          className={cn(
                            "rounded-md border px-2 md:px-3 py-2 text-xs md:text-sm",
                            planFurniture === "with" ? "accent-button" : "theme-panel theme-border"
                          )}
                        >
                          С мебелью
                        </button>
                        <button
                          onClick={() => setPlanFurniture("without")}
                          className={cn(
                            "rounded-md border px-2 md:px-3 py-2 text-xs md:text-sm",
                            planFurniture === "without" ? "accent-button" : "theme-panel theme-border"
                          )}
                        >
                          Без мебели
                        </button>
                      </div>
                    ) : isRemove ? (
                      <div className="flex w-full items-center gap-2">
                        <button
                          onClick={() => setRemoveDepth("full")}
                          className={cn("rounded-md px-3 py-2 text-sm border", removeDepth === "full" ? "accent-button" : "theme-panel theme-border")}
                        >
                          Полностью
                        </button>
                      </div>
                    ) : (
                      <textarea
                        ref={textRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={3}
                        placeholder="Опишите задачу…"
                        className={cn(
                          "min-h-[84px] w-full resize-none bg-transparent text-[15px] leading-6 outline-none",
                          "placeholder:theme-text-muted"
                        )}
                      />
                    )}

                    {/* right: Model then Send (в одну линию) */}
                    <div className="flex shrink-0 items-center gap-1 md:gap-2 self-end pb-1 relative">
                      <div className="relative">
                        <button
                          onClick={() => setShowModelMenu((v) => !v)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2 md:px-2.5 py-1.5 text-xs md:text-sm",
                            "theme-panel theme-border hover:opacity-90"
                          )}
                        >
                          <span className="hidden sm:inline">{model.label}</span>
                          <span className="sm:hidden">{model.label.split(' ')[0]}</span>
                          <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                        {showModelMenu && (
                          <div className="absolute right-0 top-10 z-20 w-48 md:w-56 rounded-md theme-border theme-panel shadow-lg">
                            {MODEL_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setModel(opt);
                                  setShowModelMenu(false);
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-sm hover:opacity-90",
                                  opt.id === model.id && "opacity-100"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={send}
                        disabled={!canSend || isGenerating}
                        className={cn(
                          "h-8 w-8 md:h-9 md:w-9 rounded-md grid place-items-center border",
                          isGenerating 
                            ? "disabled-button" 
                            : canSend 
                              ? "accent-button" 
                              : "disabled-button"
                        )}
                        title={isGenerating ? "Генерируется..." : "Отправить"}
                      >
                        {isGenerating ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-base md:text-lg"
                          >
                            ✷
                          </motion.div>
                        ) : (
                          <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  { ((isRemove || isPlan) && attachments.length === 0) && (
                    <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}} transition={{duration:0.25}}
                      className="mt-2 rounded-lg theme-border theme-panel px-3 py-2 text-xs theme-text-muted">
                      Чтобы сгенерировать — прикрепите хотя бы одну фотографию.
                    </motion.div>
                  )}

                  {/* attachments preview (below model/select & send) */}
                  {attachments.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs theme-text-muted mb-2">Вложения: {attachments.length}</div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {attachments.map((a) => (
                          <div key={a.id} className="group relative overflow-hidden rounded-md theme-border theme-panel-muted">
                            <img src={a.url} alt={a.name} className="h-24 w-full object-cover" loading="lazy" />
                            <button
                              onClick={() => removeAttachment(a.id)}
                              className="absolute top-1 right-1 hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md theme-panel theme-border backdrop-blur"
                              title="Удалить"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                 {/* bottom area: status */}
                 <div className={cn("flex items-center justify-between px-3 py-2 text-xs border-t theme-border theme-text-muted")}>
                   <div>
                     {isRemove && <>{removeDepth ? 'Режим удаления: Полностью' : 'Выберите режим удаления'}</>}
                     {isPlan && <>{planFurniture ? `Выбрано: ${planFurniture === 'with' ? 'С мебелью' : 'Без мебели'}` : 'Выберите режим: «С мебелью» или «Без мебели»'}</>}
                     {!isRemove && !isPlan && <>Enter — отправить • Shift+Enter — новая строка</>}
                   </div>
                   <div>Модель: {model.label}</div>
                 </div>
               </div>
             </div>
           </div>
            )}
        </main>
      </div>

      {/* ==== Left sliding drawer ==== */}
      {rightOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-10" onClick={() => setRightOpen(false)} />
          <motion.aside
            initial={{ x: -360 }}
            animate={{ x: 0 }}
            exit={{ x: -360 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed left-0 top-0 h-full w-[320px] md:w-[360px] theme-border bg-black shadow-2xl flex flex-col z-20"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b theme-border">
              <div className="text-sm theme-text-muted">{rightTab === 'chats' ? 'Чаты' : 'Настройки'}</div>
              <button onClick={() => setRightOpen(false)} className="h-8 w-8 grid place-items-center rounded-lg hover:opacity-90"><X className="h-4 w-4" /></button>
            </div>

            {rightTab === 'chats' && (
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {/* Action buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={createChat} 
                    className="w-full rounded-md border-2 px-3 py-2 text-sm transition-all duration-200 flex items-center gap-2 font-medium new-chat-button"
                  >
                    <Plus className="h-4 w-4"/>
                    Новый чат
                  </button>
                  <button 
                    onClick={deleteActiveChat} 
                    className="w-full rounded-md theme-border theme-panel px-3 py-2 text-sm hover:opacity-90 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4"/>
                    Удаление чата
                  </button>
                  <button 
                    onClick={() => setRightTab("settings")} 
                    className="w-full rounded-md theme-border theme-panel px-3 py-2 text-sm hover:opacity-90 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4"/>
                    Настройки
                  </button>
                </div>
                
                {/* Chats list */}
                <div className="border-t theme-border pt-3 md:pt-4">
                  <div className="text-xs theme-text-muted mb-3">Всего чатов: {chats.length}</div>
                  <div className="space-y-2">
                    {chats.map(c => (
                      <div key={c.id} className="flex items-center gap-2">
                        <button 
                          onClick={() => { setActiveChatId(c.id); setRightOpen(false); setHasFirstMessage(c.messages.length > 0); setIsGenerating(false); setResponses({}); }} 
                          className={cn("flex-1 text-left rounded-md border px-3 py-2 hover:opacity-95", c.id === activeChatId ? "theme-panel" : "theme-panel-muted", "theme-border")}
                        >
                          <div className="text-sm truncate">{c.title || 'Без названия'}</div>
                          <div className="text-[11px] theme-text-muted">Сообщений: {c.messages.length}</div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(c.id);
                          }}
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Удалить чат"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {/* Back to chats button */}
                <button 
                  onClick={() => setRightTab("chats")} 
                  className="w-full rounded-md theme-border theme-panel px-3 py-2 text-sm hover:opacity-90 flex items-center gap-2"
                >
                  <PanelLeft className="h-4 w-4"/>
                  Вернуться к чатам
                </button>
                
                <div className="border-t theme-border pt-3 md:pt-4">
                  <div className="text-sm theme-text-muted mb-2">Профиль</div>
                  <div className="space-y-2">
                    <label className="block text-xs theme-text-muted">Email</label>
                    <input className="w-full rounded-md theme-border theme-panel px-3 py-2 outline-none text-sm" placeholder="you@example.com" />
                    <label className="block text-xs theme-text-muted mt-3">Пароль</label>
                    <input type="password" className="w-full rounded-md theme-border theme-panel px-3 py-2 outline-none text-sm" placeholder="••••••••" />
                    <button className="mt-3 rounded-md theme-border theme-panel px-3 py-2 text-sm hover:opacity-90">Сохранить</button>
                  </div>
                </div>

                {/* === Оформление / стиль сайта === */}
                <div>
                  <div className="text-sm theme-text-muted mb-2">Оформление</div>
                  <label className="block text-xs theme-text-muted mb-2">Стиль сайта</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSiteStyle(opt.id)}
                        className={cn("style-chip", siteStyle === opt.id && "style-chip-active")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] theme-text-muted mt-2">Стиль сохраняется за аккаунтом пользователя.</div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}


      {/* --- Themes, accents & fonts --- */}
      <style>{`
        /* Prefer Apple New York for the hero title; graceful fallbacks */
        @font-face {
          font-family: "New York";
          src: local("New York"), local("NY"), local("New York Medium"), local("New York Small"), local("New York Large");
          font-weight: 400 800;
          font-style: normal;
          font-display: swap;
        }
        .font-hero { font-family: "New York", -apple-system-ui-serif, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }


        /* Core theming tokens */
        .themed-root { background: var(--bg); color: var(--text); }
        .theme-panel { background-color: var(--panel); }
        .theme-panel-muted { background-color: var(--panel-muted); }
        .theme-border { border-color: var(--border); border-style: solid; }
        .theme-text-muted { color: var(--muted); }
        .hero-star { color: var(--hero-accent, currentColor); }

        .accent-button { background: var(--accent); color: var(--accent-contrast); border-color: var(--accent); }
        .accent-button:hover { opacity: .92; }
        .disabled-button { background: var(--accent-disabled, var(--panel)); color: var(--accent-disabled-contrast, var(--muted)); border-color: var(--accent-disabled, var(--border)); }

        .style-chip { border: 1px solid var(--border); background: var(--panel); color: var(--text); border-radius: 12px; padding: 8px 10px; font-size: 12px; }
        .style-chip:hover { background: var(--panel-muted); }
        .style-chip-active { outline: 2px solid var(--accent); outline-offset: 0; }

        /* New Chat Button - адаптивное оформление для разных стилей */
        .new-chat-button {
          background: var(--accent);
          color: var(--accent-contrast);
          border-color: var(--accent);
        }
        .new-chat-button:hover {
          background: var(--accent-hover, var(--accent));
          border-color: var(--accent-hover, var(--accent));
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        :root[data-style='standard']{
          --bg: #262624;
          --panel: #30302e;
          --panel-muted: #2a2a28;
          --border: #c2c0b7;
          --text: #c2c0b7;
          --muted: #a8a69d;
          --accent: #cc7c5e;
          --accent-contrast: #ffffff;
          --accent-hover: #d4886a;
          --hero-accent: #cc7c5e;
          --accent-disabled: #754c3b;
          --accent-disabled-contrast: #a8a69d;
        }
        :root[data-style='advanced']{
          --bg: #0b0b0e;
          --panel: rgba(255,255,255,0.05);
          --panel-muted: rgba(255,255,255,0.03);
          --border: rgba(255,255,255,0.1);
          --text: #e5e7eb;
          --muted: #9ca3af;
          --accent: #7aa2ff;
          --accent-contrast: #ffffff;
          --accent-hover: #8fb0ff;
          --hero-accent: #7aa2ff;
          --accent-disabled: rgba(255,255,255,0.1);
          --accent-disabled-contrast: #6b7280;
        }

        /* legacy helpers (if still referenced somewhere) */
        .bg-neutral-850 { background-color: rgb(38 38 38); }
        .bg-neutral-925 { background-color: rgb(18 18 18); }
      `}</style>
    </div>
  );
}
