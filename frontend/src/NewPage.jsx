import React, { useState, useRef, useEffect } from "react";

// Кастомные стили для скроллбара и анимаций
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scaleY(0.3) scaleX(0.95) translateY(-8px);
      transform-origin: top;
    }
    to {
      opacity: 1;
      transform: scaleY(1) scaleX(1) translateY(0);
      transform-origin: top;
    }
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
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarStyles;
  if (!document.head.querySelector('style[data-custom-scrollbar]')) {
    styleElement.setAttribute('data-custom-scrollbar', 'true');
    document.head.appendChild(styleElement);
  }
}
import {
  Plus,
  ArrowUp,
  Trash2,
  Settings,
  PanelLeft,
  ChevronDown,
  Paperclip,
  Filter,
  X,
  
  Search,
  MessageSquare,
  Mic,
  Image as ImageIcon,
  Images,
  Folder,
  Bell,
  ChevronLeft,
  Send,
  Layers,
  Palette,
  Check,
  ChevronRight,
  Home,
  HelpCircle,
  MoreVertical,
  Edit2,
  Pin,
  LogOut,
  User,
  FileText,
  Building2,
  Clock,
  Mail,
  Save,
  Download,
  Key,
  Box,
  Lock,
  Shield,
  Sparkles,
  Eye,
  Keyboard,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from './AuthContext';
// import { API_BASE_URL } from './config';
const API_BASE_URL = 'https://acqu1red-latar-084a.twc1.net';
import { useNavigate } from 'react-router-dom';

// ===== Confirmation Modal Component =====
function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Подтвердить", 
  cancelText = "Отмена", 
  type = "danger",
  showRememberOption = false
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <X className="h-6 w-6 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
      case 'info': return <Info className="h-6 w-6 text-blue-400" />;
      default: return <X className="h-6 w-6 text-red-400" />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 text-white';
      default: return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  const handleConfirm = () => {
    const rememberChoice = showRememberOption && document.getElementById('remember-choice')?.checked;
    onConfirm(rememberChoice);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-6xl mx-4 bg-[#161618] border border-white/10 rounded-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 border border-white/10">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-neutral-300 text-sm mb-4 leading-relaxed">{message}</p>
        
        {/* Remember option */}
        {showRememberOption && (
          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-choice"
              className="w-4 h-4 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="remember-choice" className="text-xs text-neutral-400 cursor-pointer">
              Больше не спрашивать
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors border border-white/10 rounded-md hover:bg-white/5"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${getButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ===== Rename Chat Modal Component =====
function RenameChatModal({ isOpen, onClose, onConfirm, currentTitle, showRememberOption = false }) {
  const [newTitle, setNewTitle] = useState(currentTitle || '');
  
  // Обновляем состояние при изменении currentTitle
  useEffect(() => {
    setNewTitle(currentTitle || '');
  }, [currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      const rememberChoice = showRememberOption && document.getElementById('remember-choice')?.checked;
      onConfirm(newTitle.trim(), rememberChoice);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-6xl mx-4 bg-[#161618] border border-white/10 rounded-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 border border-white/10">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Переименовать чат</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm text-neutral-400 block mb-2">
              Новое название чата
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
              placeholder="Введите название чата"
              autoFocus
              maxLength={50}
            />
          </div>
          
          {/* Remember option */}
          {showRememberOption && (
            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-choice"
                className="w-4 h-4 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="remember-choice" className="text-xs text-neutral-400 cursor-pointer">
                Больше не спрашивать
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors border border-white/10 rounded-md hover:bg-white/5"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Переименовать
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

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
        vx: (Math.random() - 0.5) * 0.8, // Замедлена скорость
        vy: (Math.random() - 0.5) * 0.8, // Замедлена скорость
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        glow: Math.random() * 0.5 + 0.5,
        angle: Math.random() * Math.PI * 2, // Для волнового движения
        baseSpeed: Math.random() * 0.2 + 0.1 // Замедлена базовая скорость дрейфа
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
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      
      particles.forEach((particle, index) => {
        // Автоматическое волновое движение (дрейф)
        particle.angle += 0.005; // Замедлено вращение
        const driftX = Math.cos(particle.angle) * particle.baseSpeed;
        const driftY = Math.sin(particle.angle) * particle.baseSpeed;
        
        // Обновление позиции с учетом дрейфа
        particle.x += particle.vx + driftX;
        particle.y += particle.vy + driftY;
        
        // Проверка, находится ли курсор над областью строки ввода
        const isMouseOverSearchBar = mouseX >= searchBarArea.x && 
                                   mouseX <= searchBarArea.x + searchBarArea.width &&
                                   mouseY >= searchBarArea.y && 
                                   mouseY <= searchBarArea.y + searchBarArea.height;
        
        // Взаимодействие с мышью (только если курсор НЕ над строкой ввода)
        if (!isMouseOverSearchBar && (mouseX !== 0 || mouseY !== 0)) {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.vx += (dx / distance) * force * 0.02;
            particle.vy += (dy / distance) * force * 0.02;
          }
        }
        
        // Обход области строки ввода
        const searchBarDx = (searchBarArea.x + searchBarArea.width / 2) - particle.x;
        const searchBarDy = (searchBarArea.y + searchBarArea.height / 2) - particle.y;
        const searchBarDistance = Math.sqrt(searchBarDx * searchBarDx + searchBarDy * searchBarDy);
        
        // Если частица слишком близко к области строки ввода, отталкиваем её
        if (searchBarDistance < 120) {
          const avoidForce = (120 - searchBarDistance) / 120;
          particle.vx -= (searchBarDx / searchBarDistance) * avoidForce * 0.03;
          particle.vy -= (searchBarDy / searchBarDistance) * avoidForce * 0.03;
        }
        
        // Ограничение скорости (менее агрессивное)
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Границы экрана
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Рисование частицы с пульсирующим свечением
        ctx.save();
        // Пульсирующая прозрачность
        const pulseOpacity = particle.opacity + Math.sin(time * 2 + index) * 0.15;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, pulseOpacity));
        // Пульсирующее свечение
        const pulseGlow = particle.glow * 20 + Math.sin(time * 3 + index) * 5;
        ctx.shadowBlur = pulseGlow;
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
            events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "repulse" }, resize: true },
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
const SERVICE_OPTIONS = [
  { id: "cleanup", label: "Удаление объектов", description: "Удаляет ненужные объекты с плана", Icon: Trash2 },
  { id: "techplan", label: "Создание по техплану", description: "Создает технический план помещения", Icon: FileText },
];

const MODEL_OPTIONS = {
  techplan: [
    { id: "boston", label: "Boston 2.5", description: "Быстрая модель" },
    { id: "melbourne", label: "Melbourne 4.5", description: "Продвинутая модель" },
  ],
  cleanup: [
    { id: "charleston", label: "Charleston 3", description: "Удаление объектов" },
  ],
};

// === Site styles ===
const STYLE_OPTIONS = [
  { id: "advanced", label: "Продвинутый" },
];

// === Advanced Style Components ===


// Компонент предпросмотра фона
function BackgroundPreview({ type }) {
  const previewRef = useRef(null);
  
  useEffect(() => {
    if (type === "interactive" && previewRef.current) {
      // Мини-версия интерактивного фона для предпросмотра
      const canvas = previewRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 120;
      
      const particles = [];
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1
        });
      }
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          
          ctx.fillStyle = '#d3d3e8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }
  }, [type]);
  
  
  if (type === "interactive") {
    return (
      <div className="w-full h-full bg-black relative overflow-hidden">
        <canvas ref={previewRef} className="w-full h-full" />
      </div>
    );
  }
  
  if (type === "alternative") {
    return (
      <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  return null;
}

// Модальное окно "Регистрация/Вход" - Премиум дизайн
// Новый компонент личного кабинета — точный референсный размер и стиль
function ProfileModal({ isOpen, onClose, user, onGrantAccess, onOpenOrganizationList }) {
  const [activeTab, setActiveTab] = useState('account');

  // Appearance
  const [theme, setTheme] = useState('system');
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [wrapLongLines, setWrapLongLines] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Behavior
  const [autoScroll, setAutoScroll] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidePanel, setSidePanel] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [autoComplete, setAutoComplete] = useState(true);
  const [starBackground, setStarBackground] = useState(false);


  // Data
  const [allowHistory, setAllowHistory] = useState(false);
  
  // User settings for confirmations
  const [userSettings, setUserSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`userSettings@${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : {
        skipDeleteConfirmation: false,
        skipRenameConfirmation: false,
        showActionNotifications: true
      };
    }
    return {
      skipDeleteConfirmation: false,
      skipRenameConfirmation: false,
      showActionNotifications: true
    };
  });
  
  // Функция для обновления настроек
  const updateUserSettings = (newSettings) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Сохраняем настройки пользователя в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`userSettings@${user.id}`, JSON.stringify(userSettings));
    }
  }, [userSettings, user?.id]);
  const [allowDetails, setAllowDetails] = useState(false);
  const [memoryUsage] = useState({ used: 74.23, total: 1070 });
  const [selectedPanel, setSelectedPanel] = useState('layers');
  const [grantUsername, setGrantUsername] = useState('');
  const [grantStatus, setGrantStatus] = useState(null);
  const [grantError, setGrantError] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGrantStatus(null);
      setGrantError('');
      setGrantUsername('');
      setGrantLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGrantAccessClick = async () => {
    if (!onGrantAccess || !grantUsername.trim()) return;
    setGrantLoading(true);
    setGrantStatus(null);
    setGrantError('');
    const result = await onGrantAccess(grantUsername.trim());
    if (result?.success) {
      setGrantStatus('success');
      setGrantUsername('');
    } else {
      setGrantStatus('error');
      setGrantError(result?.error || 'Не удалось выдать доступ');
    }
    setGrantLoading(false);
  };

  const tabs = [
    { id: 'account', label: 'Учётка', icon: User },
    { id: 'appearance', label: 'Оформление', icon: Palette },
    { id: 'behavior', label: 'Поведение', icon: Settings },
    { id: 'data', label: 'Управление данными', icon: Shield },
  ];

  const Toggle = ({ value, onChange, disabled }) => (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`relative h-5 w-9 rounded-full transition ${
        disabled ? 'bg-white/8 opacity-40' : value ? 'bg-white/15' : 'bg-white/5'
      }`}
      disabled={disabled}
      aria-pressed={value}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-all shadow-sm ${
          value ? 'left-[18px]' : 'left-[2px]'
        }`}
      />
    </button>
  );

  const Row = ({ icon: Icon, left, right }) => (
    <div className="flex items-center justify-between rounded-md border border-white/5 px-4 py-3 min-h-[48px]">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-md border border-white/5 text-white/70">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm text-white font-medium">{left}</div>
      </div>
      <div className="ml-4">{right}</div>
    </div>
  );


  const AccountTab = () => (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex-1 space-y-3">
        {/* Информация о профиле */}
        <div className="flex items-center justify-between rounded-md border border-white/5 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 text-xs font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-white">{user?.name || 'Название компании'}</div>
              <div className="text-xs text-neutral-400">{user?.username || 'Псевдоним'}</div>
            </div>
          </div>
        </div>


        {user?.role === 'director' && (
          <div className="rounded-md border border-white/5 bg-white/3 px-3 py-3 space-y-2.5">
            <div>
              <div className="text-sm font-semibold text-white">Доступ для организаций</div>
              <div className="text-xs text-neutral-400 mt-0.5">Назначьте префикс «Организация», чтобы снять лимиты</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={grantUsername}
                onChange={(e) => {
                  setGrantUsername(e.target.value);
                  setGrantStatus(null);
                  setGrantError('');
                }}
                placeholder="Псевдоним пользователя"
                className="flex-1 rounded-md border border-white/5 bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-neutral-500 focus:border-white/20 focus:outline-none"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleGrantAccessClick}
                  disabled={grantLoading || !grantUsername.trim()}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {grantLoading ? 'Выдача...' : 'Дать доступ'}
                </button>
                <button
                  onClick={() => onOpenOrganizationList?.()}
                  className="rounded-md border border-white/5 bg-white/3 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/5"
                >
                  Список
                </button>
              </div>
            </div>
            {grantStatus === 'success' && (
              <div className="text-xs text-green-400">Доступ успешно выдан.</div>
            )}
            {grantStatus === 'error' && (
              <div className="text-xs text-red-400">{grantError}</div>
            )}
          </div>
        )}

        <div className="text-xs text-neutral-400 pt-1">Язык <span className="ml-1 text-white">Русский</span></div>
      </div>
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Row icon={Eye} left="Показывать предпросмотр разговоров в истории" right={<Toggle value={showPreview} onChange={setShowPreview} />} />
      </div>
    </div>
  );

  const BehaviorTab = () => (
    <div className="space-y-2">
      <Row icon={ArrowUp} left="Включить автопрокрутку" right={<Toggle value={autoScroll} onChange={setAutoScroll} />} />
      <Row icon={Sparkles} left="Показывать предложения для продолжения" right={<Toggle value={showSuggestions} onChange={setShowSuggestions} />} />
      <Row icon={Bell} left="Получать уведомление, когда ARCPLAN заканчивает размышлять" right={<Toggle value={notifications} onChange={setNotifications} />} />
      <Row icon={Bell} left="Уведомления при действиях" right={<Toggle value={userSettings.showActionNotifications} onChange={(value) => updateUserSettings({ showActionNotifications: value })} />} />
    </div>
  );

  const DataTab = () => (
    <div className="space-y-4">
      <Row icon={Sparkles} left="Улучшить модель" right={<Toggle value={allowHistory} onChange={setAllowHistory} />} />
      {user && (
        <div className="rounded-md border border-white/10 px-4 py-3 space-y-2 bg-black/20">
          <div className="text-xs uppercase tracking-[0.1em] text-white/50">Доступ</div>
          <div className="text-sm text-white">
            {user.role === 'director' || user.accessPrefix === 'Организация'
              ? 'Безлимит генераций и повторов.'
              : `Генерации использованы: ${user.plansUsed ?? 0} из 1.`}
          </div>
          <div className="text-xs text-neutral-400">
            {user.role === 'director' || user.accessPrefix === 'Организация'
              ? 'Префикс «Организация» активирован.'
              : 'Повторить доступно до 3 раз в каждом чате без префикса.'}
          </div>
        </div>
      )}
      <div className="rounded-md border border-white/10 px-4 py-3">
        <div className="text-xs text-neutral-400">Использовано {memoryUsage.used} МБ из {(memoryUsage.total / 1000).toFixed(1)} ГБ</div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${(memoryUsage.used / memoryUsage.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'account': return <AccountTab />;
      case 'appearance': return <AppearanceTab />;
      case 'behavior': return <BehaviorTab />;
      case 'data': return <DataTab />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.18 }}
        // Компактный размер окна
        className="relative flex overflow-hidden rounded-md border border-white/5 bg-[#161618] shadow-2xl"
        style={{
          width: 'min(720px, 50vw)',   // уменьшенная ширина
          height: 'min(520px, 65vh)',  // уменьшенная высота
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Левая колонка — вкладки */}
        <div className="flex w-[180px] shrink-0 flex-col border-r border-white/5 bg-black/10">
          <div className="flex h-10 items-center px-3 text-sm font-semibold text-white/90">Настройки</div>
          <nav className="flex-1 space-y-0.5 px-1.5 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                  activeTab === tab.id ? 'bg-white/8 text-white' : 'text-neutral-400 hover:bg-white/3 hover:text-white'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
            {renderContent()}
          </motion.div>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white transition-all hover:rotate-90 duration-200"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}


function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'register' или 'login'
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Псевдоним вместо email
  const [telegram, setTelegram] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов');
          setLoading(false);
          return;
        }
        const success = await register(name, username, password);
        if (success) {
          onClose();
          window.location.reload(); // Перезагружаем страницу для обновления состояния
        } else {
          setError('Ошибка регистрации. Попробуйте еще раз');
        }
      } else {
        const success = await login(username, password);
        if (success) {
          onClose();
          window.location.reload(); // Перезагружаем страницу для обновления состояния
        } else {
          setError('Неверный логин или пароль');
        }
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте еще раз');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md mx-4 overflow-hidden bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-neutral-800">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-neutral-500 hover:text-neutral-300 transition"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-2xl font-semibold text-neutral-100">
            {mode === 'register' ? 'Запустить ARCPLAN' : 'Вход в систему'}
          </h2>
          <p className="text-neutral-500 text-sm mt-2">
            {mode === 'register' 
              ? 'Начнем работу с Вашей организацией по созданию планировок с AI' 
              : 'Войдите в свой аккаунт для доступа к функциям'}
          </p>
        </div>
        
        {/* Content */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
             {mode === 'register' && (
               <>
                 {/* Первый ряд - Название организации и Пароль для входа */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                   <div className="flex flex-col">
                     <label className="text-sm text-neutral-400 block mb-2">
                       Название организации
                     </label>
                     <input
                       type="text"
                       required
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full h-12 bg-black/40 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600 hover:border-white/20"
                       placeholder="Название организации"
                     />
                   </div>
                   
                   <div className="flex flex-col">
                     <label className="text-sm text-neutral-400 block mb-2">
                       Пароль для входа
                     </label>
                     <div className="relative h-12">
                       <input
                         type={showPassword ? 'text' : 'password'}
                         required
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full h-12 bg-black/40 border border-white/10 rounded-md px-4 py-3 pr-12 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600 hover:border-white/20"
                         placeholder="••••••••"
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-white/10"
                       >
                         {showPassword ? (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                           </svg>
                         ) : (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                         )}
                       </button>
                     </div>
                   </div>
                 </div>
                 
                 {/* Второй ряд - Псевдоним для входа и Подтвердите пароль */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                   <div className="flex flex-col">
                     <label className="text-sm text-neutral-400 block mb-2">
                       Псевдоним для входа
                     </label>
                     <input
                       type="text"
                       required
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       className="w-full h-12 bg-black/40 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600 hover:border-white/20"
                       placeholder="username"
                     />
                   </div>
                   
                   <div className="flex flex-col">
                     <label className="text-sm text-neutral-400 block mb-2">
                       Подтвердите пароль
                     </label>
                     <div className="relative h-12">
                       <input
                         type={showPassword ? 'text' : 'password'}
                         required
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         className="w-full h-12 bg-black/40 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600 hover:border-white/20"
                         placeholder="••••••••"
                       />
                     </div>
                   </div>
                 </div>
                 
                 {/* Третий ряд - Telegram для связи */}
                 <div className="flex justify-center">
                   <div className="w-full max-w-2xl">
                     <label className="text-sm text-neutral-400 block mb-2">
                       Telegram для связи
                     </label>
                     <input
                       type="text"
                       required
                       value={telegram}
                       onChange={(e) => setTelegram(e.target.value)}
                       className="w-full h-12 bg-black/40 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600 hover:border-white/20"
                       placeholder="@example"
                     />
                   </div>
                 </div>
               </>
             )}
             
             {/* Поля для входа */}
             {mode === 'login' && (
               <>
                 <div>
                   <label htmlFor="username" className="block text-sm font-medium text-neutral-400 mb-2">
                     Логин
                   </label>
                   <input
                     id="username"
                     type="text"
                     required
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 placeholder-neutral-500 transition"
                     placeholder="Введите логин"
                   />
                 </div>
                 
                 <div>
                   <label htmlFor="password" className="block text-sm font-medium text-neutral-400 mb-2">
                     Пароль
                   </label>
                   <input
                     id="password"
                     type="password"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none focus:border-neutral-600 text-neutral-200 placeholder-neutral-500 transition"
                     placeholder="••••••••"
                   />
                 </div>
               </>
             )}
            
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded border border-neutral-600 bg-neutral-700 text-neutral-100 px-4 py-3 text-sm font-medium hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (mode === 'register' ? 'Запуск...' : 'Вход...') 
                : (mode === 'register' ? 'Запустить ARCPLAN' : 'Войти')}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrganizationUsersModal({ isOpen, onClose, users = [], isLoading = false, error = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-md border border-white/10 bg-[#111113] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Пользователи с префиксом «Организация»</h3>
            <p className="text-xs text-neutral-400 mt-1">Доступ без ограничений активирован</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4 text-neutral-300" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-neutral-300">Загрузка...</div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="rounded-md border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
            {users.length === 0 && !error ? (
              <div className="text-center text-xs text-neutral-400 py-6">
                Пока нет пользователей с префиксом «Организация».
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {users.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border border-white/10 bg-black/40 px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-neutral-400">@{item.username}</div>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70">
                      Организация
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const changelog = [
    {
      version: "3.0.0",
      date: "Октябрь 2025",
      title: "Полное обновление интерфейса",
      type: "major",
      changes: [
        "Новый продвинутый дизайн с интерактивными частицами",
        "Система закрепления и управления чатами",
        "Добавлен личный кабинет с регистрацией агентств",
        "Улучшенная система поиска по чатам и настройкам"
      ]
    },
    {
      version: "2.5.0",
      date: "Сентябрь 2025",
      title: "AI Конструктор",
      type: "feature",
      changes: [
        "Запуск AI конструктора для архитектурных проектов",
        "Интеграция с системой техпланов",
        "Добавлена поддержка загрузки больших файлов"
      ]
    },
    {
      version: "2.0.0",
      date: "Август 2025",
      title: "Мультимодельная система",
      type: "major",
      changes: [
        "Добавлены три режима работы: удаление объектов, создание по техплану, конструктор",
        "Улучшена обработка изображений",
        "Оптимизирована скорость генерации"
      ]
    },
    {
      version: "1.5.0",
      date: "Июль 2025",
      title: "Система чатов",
      type: "feature",
      changes: [
        "Внедрена система множественных чатов",
        "Добавлена история сообщений",
        "Улучшен контекстный анализ"
      ]
    },
    {
      version: "1.0.0",
      date: "Июнь 2025",
      title: "Запуск платформы",
      type: "major",
      changes: [
        "Первая версия платформы",
        "Базовая обработка изображений",
        "Система авторизации пользователей"
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-black border border-white/20 rounded-3xl shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent p-8">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/10 rounded-md border border-white/20">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                История изменений
              </h2>
              <p className="text-neutral-400 text-lg mt-1">
                Эволюция нашей платформы
              </p>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-8 custom-scrollbar">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent"></div>
            
            <div className="space-y-8">
              {changelog.map((release, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-0 size-14 rounded-md border-2 border-white/20 grid place-items-center font-bold ${
                    release.type === 'major' 
                      ? 'bg-gradient-to-br from-white to-neutral-300 text-black' 
                      : 'bg-black text-white border-white/40'
                  }`}>
                    {release.version.split('.')[0]}.{release.version.split('.')[1]}
                  </div>
                  
                  {/* Content */}
                  <div className="group bg-gradient-to-br from-white/5 to-transparent rounded-md p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">
                            {release.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                            release.type === 'major' 
                              ? 'bg-white text-black' 
                              : 'bg-white/10 text-white border border-white/20'
                          }`}>
                            v{release.version}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {release.date}
                        </p>
                      </div>
                    </div>
                    
                    {/* Changes list */}
                    <div className="space-y-3 mt-4">
                      {release.changes.map((change, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
                          className="flex items-start gap-3 p-3 bg-black/20 rounded-md border border-white/5 hover:border-white/10 transition-all"
                        >
                          <div className="mt-0.5 p-1 bg-white/10 rounded-md">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-neutral-300 text-sm leading-relaxed flex-1">
                            {change}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AdvancedSidebar({ 
  chats = [], 
  activeChatId, 
  onChatSelect, 
  onSearch, 
  searchQuery, 
  onCollapse,
  isCollapsed = false,
  searchResults = { chats: [], settings: [] },
  onSettingSelect,
  onCreateChat,
  onHomeClick,
  user,
  onRenameChat,
  onDeleteChat,
  onPinChat,
  onChangelog,
  onProfile,
  onLogout,
  onAuthOpen,
  backgroundType,
  onBackgroundChange,
  advancedMessageHistory = {}
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeChatMenu, setActiveChatMenu] = useState(null);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setSettingsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Группировка чатов по датам
  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const groups = {
      pinned: [],
      today: [],
      yesterday: [],
      thisMonth: [],
      older: []
    };
    
    chats.forEach(chat => {
      if (chat.pinned) {
        groups.pinned.push(chat);
        return;
      }
      
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

  // Фильтруем чаты - показываем только те, у которых есть сообщения
  const chatsWithMessages = chats.filter(chat => {
    const chatHistory = advancedMessageHistory?.[chat.id] || [];
    return chatHistory.length > 0;
  });
  
  const chatGroups = groupChatsByDate(chatsWithMessages);
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                     'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  if (isCollapsed) {
  return (
      <aside className="hidden md:flex flex-col h-full max-h-screen border-r border-white/5 bg-black/20 backdrop-blur-sm w-14 relative z-20">
        <div className="flex-shrink-0 p-1.5 space-y-1.5">
          {/* Toggle button для свернутого сайдбара */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Toggle button clicked - collapsed sidebar');
              onCollapse();
            }}
            className="w-full aspect-square flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition rounded-md relative z-10 cursor-pointer" 
            title="Развернуть панель"
          >
            <ChevronRight className="h-4 w-4 pointer-events-none" />
          </button>
        </div>
        <nav className="px-1.5 text-xs flex-1 space-y-1.5 overflow-y-auto custom-scrollbar min-h-0">
          <button 
            onClick={onCreateChat}
            className="w-full aspect-square rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Новый чат"
          >
            <Plus className="h-3 w-3 text-neutral-400" />
          </button>
        </nav>
        <div className="flex-shrink-0 p-3 flex flex-col items-center gap-2">
          <div ref={userMenuRef} className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="size-9 rounded-full grid place-items-center text-xs font-semibold hover:scale-105 transition bg-black border border-white/30 text-white"
            title={user ? 'Профиль' : 'Аноним'}
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </button>
            
            {/* User menu для свернутого состояния */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-full ml-2 mb-2 bg-neutral-900 border border-white/10 rounded-md shadow-2xl overflow-hidden w-48 z-50">
                {user ? (
                  <>
          <button 
                      onClick={() => { onProfile(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                    >
                      <User className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-white">Личный кабинет</span>
                    </button>
                    <button 
                      onClick={() => { onChangelog(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                    >
                      <FileText className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-white">Список изменений</span>
                    </button>
                    <div className="border-t border-white/5"></div>
                    <button 
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-red-400">Выйти</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { onAuthOpen(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                    >
                      <User className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-white">Войти</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={onHomeClick}
            className="text-neutral-500 hover:text-neutral-300 transition" 
            title="Вернуться на главную"
          >
            <Home className="h-4 w-4" />
          </button>
          
          <div ref={settingsMenuRef} className="relative">
            <button 
              onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
            className="text-neutral-500 hover:text-neutral-300 transition" 
              title="Настройки"
          >
              <Settings className="h-4 w-4" />
          </button>
          
            
            {/* Settings menu для свернутого состояния */}
            {settingsMenuOpen && (
              <div className="absolute bottom-full left-full ml-2 mb-2 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg overflow-hidden w-48 z-50">
              <div className="px-3 py-1.5 border-b border-[#2c2c2e]">
                <div className="text-[10px] uppercase tracking-wide text-neutral-600">Тема</div>
              </div>
              <button 
                onClick={() => { onBackgroundChange?.('standard'); setSettingsMenuOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                  backgroundType === 'standard' ? 'bg-[#2c2c2e]' : 'hover:bg-[#252527]'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-300 flex-1">Стандартный</span>
                {backgroundType === 'standard' && <Check className="h-3.5 w-3.5 text-neutral-500" />}
              </button>
              <button 
                onClick={() => { onBackgroundChange?.('interactive'); setSettingsMenuOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                  backgroundType === 'interactive' ? 'bg-[#2c2c2e]' : 'hover:bg-[#252527]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-300 flex-1">Интерактивный</span>
                {backgroundType === 'interactive' && <Check className="h-3.5 w-3.5 text-neutral-500" />}
              </button>
              <button 
                onClick={() => { onBackgroundChange?.('alternative'); setSettingsMenuOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                  backgroundType === 'alternative' ? 'bg-[#2c2c2e]' : 'hover:bg-[#252527]'
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-300 flex-1">Альтернативный</span>
                {backgroundType === 'alternative' && <Check className="h-3.5 w-3.5 text-neutral-500" />}
              </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col h-full max-h-screen border-r border-white/5 bg-black/20 backdrop-blur-sm w-64 relative z-20">
      {/* Top: search and toggle */}
      <div className="flex-shrink-0 p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 rounded-md bg-white/5 px-4 py-2 ring-1 ring-white/10 hover:ring-white/20 transition">
            <Search className="h-3 w-3 text-neutral-400" />
            <input
              placeholder="Поиск"
              className="bg-transparent placeholder:text-neutral-500 text-sm outline-none w-full"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          {/* Toggle button для развернутого сайдбара */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Toggle button clicked - expanded sidebar');
              onCollapse();
            }}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition rounded-md shrink-0 relative z-10 cursor-pointer" 
            title="Свернуть панель"
          >
            <ChevronLeft className="h-4 w-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Nav */}
       <nav className="px-1.5 text-sm flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <AdvancedSectionTitle>Главное</AdvancedSectionTitle>
        <AdvancedNavItem onClick={onCreateChat} Icon={Plus} label="Новый чат" />
        
        <AdvancedSectionTitle className="mt-2">История</AdvancedSectionTitle>
        
        {/* Результаты поиска */}
        {searchQuery.trim() && (
          <>
            {searchResults.chats.length > 0 && (
              <>
                <AdvancedHistoryDate label="Чаты" />
                {searchResults.chats.map(chat => (
                  <AdvancedHistoryLinkWithMenu 
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onRename={() => onRenameChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onPin={() => onPinChat(chat.id)}
                    isMenuOpen={activeChatMenu === chat.id}
                    setMenuOpen={(open) => setActiveChatMenu(open ? chat.id : null)}
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
            {/* Закрепленные */}
            {chatGroups.pinned.length > 0 && (
              <>
                <AdvancedHistoryDate label="Закрепленные" />
                {chatGroups.pinned.map(chat => (
                  <AdvancedHistoryLinkWithMenu 
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onRename={() => onRenameChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onPin={() => onPinChat(chat.id)}
                    isMenuOpen={activeChatMenu === chat.id}
                    setMenuOpen={(open) => setActiveChatMenu(open ? chat.id : null)}
                  />
                ))}
              </>
            )}
            
            {/* Сегодня */}
            {chatGroups.today.length > 0 && (
              <>
                <AdvancedHistoryDate label="Сегодня" />
                {chatGroups.today.map(chat => (
                  <AdvancedHistoryLinkWithMenu 
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onRename={() => onRenameChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onPin={() => onPinChat(chat.id)}
                    isMenuOpen={activeChatMenu === chat.id}
                    setMenuOpen={(open) => setActiveChatMenu(open ? chat.id : null)}
                  />
                ))}
              </>
            )}
            
            {/* Вчера */}
            {chatGroups.yesterday.length > 0 && (
              <>
                <AdvancedHistoryDate label="Вчера" />
                {chatGroups.yesterday.map(chat => (
                  <AdvancedHistoryLinkWithMenu 
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onRename={() => onRenameChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onPin={() => onPinChat(chat.id)}
                    isMenuOpen={activeChatMenu === chat.id}
                    setMenuOpen={(open) => setActiveChatMenu(open ? chat.id : null)}
                  />
                ))}
              </>
            )}
            
            {/* Этот месяц */}
            {chatGroups.thisMonth.length > 0 && (
              <>
                <AdvancedHistoryDate label={monthNames[new Date().getMonth()]} />
                {chatGroups.thisMonth.map(chat => (
                  <AdvancedHistoryLinkWithMenu 
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onRename={() => onRenameChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onPin={() => onPinChat(chat.id)}
                    isMenuOpen={activeChatMenu === chat.id}
                    setMenuOpen={(open) => setActiveChatMenu(open ? chat.id : null)}
                  />
                ))}
              </>
            )}
            
            {/* Старые чаты */}
            {chatGroups.older.length > 0 && (
              <>
                <AdvancedHistoryDate label="Ранее" />
                {chatGroups.older.map(chat => (
                  <AdvancedHistoryLinkWithMenu 
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onRename={() => onRenameChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onPin={() => onPinChat(chat.id)}
                    isMenuOpen={activeChatMenu === chat.id}
                    setMenuOpen={(open) => setActiveChatMenu(open ? chat.id : null)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </nav>

      <div className="flex-shrink-0 px-3 py-3 border-t border-white/5 relative">
        <div className="flex items-center justify-between gap-1">
          <div ref={userMenuRef} className="flex-1 min-w-0 relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-md transition w-full"
          >
              <div className="size-8 rounded-full grid place-items-center text-sm font-semibold bg-black border border-white/30 text-white shrink-0">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
              <div className="flex-1 text-left min-w-0">
              <div className="text-sm text-white truncate">{user?.name || 'Аноним'}</div>
              <div className="text-xs text-neutral-500 truncate">{user?.username || ''}</div>
            </div>
          </button>
        
        {/* User menu */}
        {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900 border border-white/10 rounded-md shadow-2xl overflow-hidden z-50">
            {user ? (
              <>
                <button 
                  onClick={() => { onProfile(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                >
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-white">Личный кабинет</span>
                </button>
                <button 
                  onClick={() => { onChangelog(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                >
                  <FileText className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-white">Список изменений</span>
                </button>
                <div className="border-t border-white/5"></div>
                <button 
                  onClick={() => { onLogout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition text-left"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">Выйти</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { onAuthOpen(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                >
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-white">Войти</span>
                </button>
              </>
            )}
          </div>
        )}
          </div>
          <button 
            onClick={onHomeClick}
            className="text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition p-2 rounded-md shrink-0" 
            title="Вернуться на главную"
          >
            <Home className="h-4 w-4" />
          </button>
          <div ref={settingsMenuRef} className="relative">
            <button 
              onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
              className="text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition p-2 rounded-md shrink-0" 
              title="Настройки"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            {/* Settings menu */}
            {settingsMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg overflow-hidden w-48 z-50">
                <div className="px-3 py-1.5 border-b border-[#2c2c2e]">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-600">Тема</div>
                </div>
                <button 
                  onClick={() => { onBackgroundChange?.('standard'); setSettingsMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                    backgroundType === 'standard' ? 'bg-[#2c2c2e]' : 'hover:bg-[#252527]'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-300 flex-1">Стандартный</span>
                  {backgroundType === 'standard' && <Check className="h-3.5 w-3.5 text-neutral-500" />}
                </button>
                <button 
                  onClick={() => { onBackgroundChange?.('interactive'); setSettingsMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                    backgroundType === 'interactive' ? 'bg-[#2c2c2e]' : 'hover:bg-[#252527]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-300 flex-1">Интерактивный</span>
                  {backgroundType === 'interactive' && <Check className="h-3.5 w-3.5 text-neutral-500" />}
                </button>
                <button 
                  onClick={() => { onBackgroundChange?.('alternative'); setSettingsMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${
                    backgroundType === 'alternative' ? 'bg-[#2c2c2e]' : 'hover:bg-[#252527]'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-300 flex-1">Альтернативный</span>
                  {backgroundType === 'alternative' && <Check className="h-3.5 w-3.5 text-neutral-500" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AdvancedSectionTitle({ children, className = "" }) {
  return (
     <div className={`px-1.5 pb-0.5 pt-3 text-xs uppercase tracking-wider text-neutral-500 ${className}`}>
      {children}
    </div>
  );
}

function AdvancedNavItem({ Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-1.5 rounded-md px-4 py-2 my-0.5 transition text-left text-sm ${
        active
          ? "bg-white/10 text-white"
          : "text-neutral-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-3 w-3" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function AdvancedHistoryLinkWithMenu({ chat, active = false, onClick, onRename, onDelete, onPin, isMenuOpen, setMenuOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, setMenuOpen]);
  
  // Обработчик правого клика
  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем позицию клика относительно контейнера
    const rect = containerRef.current.getBoundingClientRect();
    setMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setMenuOpen(true);
  };
  
  // Управление видимостью трех точек
  useEffect(() => {
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = (e) => {
      // Проверяем, что курсор действительно покинул контейнер
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
        setIsHovered(false);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative group w-full"
    >
      <div className="flex items-center gap-1 w-full min-h-[32px]">
        <button 
          onClick={onClick}
          onContextMenu={handleRightClick}
            className={`flex-1 text-left py-2 px-4 rounded-md truncate cursor-pointer transition min-h-[32px] text-sm ${
            active 
              ? "text-white bg-white/10" 
              : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2 h-full">
            {chat.pinned && <Pin className="h-3 w-3 text-white flex-shrink-0" />}
            <span className="truncate">{chat.title || "Новый чат"}</span>
          </div>
        </button>
      </div>
      
      {isMenuOpen && (
        <div 
          className="absolute bg-neutral-900 border border-white/10 rounded-md shadow-2xl overflow-hidden z-50 min-w-[160px]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onRename(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition text-left text-sm"
          >
            <Edit2 className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-sm text-white">Переименовать</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition text-left text-sm"
          >
            <Pin className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-sm text-white">{chat.pinned ? 'Открепить' : 'Закрепить'}</span>
          </button>
          <div className="border-t border-white/5"></div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 transition text-left text-sm"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            <span className="text-sm text-red-400">Удалить</span>
          </button>
        </div>
      )}
    </div>
  );
}

function AdvancedHistoryLink({ label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`block w-full text-left py-2 px-4 rounded-md truncate cursor-pointer transition text-sm ${
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
    <div className="px-3 pt-4 pb-1 text-xs uppercase tracking-wider text-neutral-500">{label}</div>
  );
}

function AdvancedMainArea({ 
  onAttach, 
  attachments = [], 
  modelMenuOpen, 
  onModelMenuToggle, 
  onFilesSelected,
  onSendMessage,
  isGenerating = false,
  currentMessage = null,
  currentResult = null,
  messageHistory = [],
  onRate,
  onRegenerate,
  onDownload,
  onImageClick,
  onModelChange,
  model,
  onModelSelect,
  service,
  onServiceChange,
  showServiceMenu,
  onServiceMenuToggle,
  selectedModel,
  onSelectedModelChange
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [techplanModeLocal, setTechplanModeLocal] = useState('with');

  // Показываем сообщения, если есть активное сообщение, результат, история или идет генерация
  const showMessages = currentMessage || currentResult || messageHistory.length > 0 || isGenerating;

  return (
    <main className="relative flex flex-col h-screen">
          {/* Service Selector в правом верхнем углу - показываем только когда нет сообщений */}
          {!showMessages && (
            <div className="absolute top-6 right-8 z-30">
              <AdvancedServiceSelector
                value={service}
                onChange={onServiceChange}
                isOpen={showServiceMenu}
                onToggle={onServiceMenuToggle}
              />
            </div>
          )}
          {/* Сообщения в верхней части */}
          {showMessages && (
        <div className="flex-1 pt-16 overflow-y-auto custom-scrollbar">
          {/* История сообщений */}
          {messageHistory.length > 0 && (
            <div className="space-y-6 px-6 py-4">
              {messageHistory.map((msg, index) => (
                <div key={`${msg.id || msg.messageId}-${index}`} className="w-full">
                  {msg.type === 'user' ? (
                    <AdvancedMessageDisplay
                      isGenerating={false}
                      message={msg}
                      result={null}
                      onRate={onRate}
                      onRegenerate={onRegenerate}
                      onDownload={onDownload}
                      onImageClick={onImageClick}
                      service={service}
                      selectedModel={selectedModel}
                      onModelChange={onSelectedModelChange}
                      techplanMode={msg.techplanMode || techplanModeLocal}
                      onTechplanModeChange={setTechplanModeLocal}
                    />
                  ) : (
                    <AdvancedMessageDisplay
                      isGenerating={false}
                      message={null}
                      result={msg}
                      onRate={onRate}
                      onRegenerate={onRegenerate}
                      onDownload={onDownload}
                      onImageClick={onImageClick}
                      service={service}
                      selectedModel={selectedModel}
                      onModelChange={onSelectedModelChange}
                      techplanMode={msg.techplanMode || techplanModeLocal}
                      onTechplanModeChange={setTechplanModeLocal}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Текущее сообщение */}
          {(currentMessage || currentResult || isGenerating) && (
            <div className="px-6 py-4">
              <AdvancedMessageDisplay
                isGenerating={isGenerating}
                message={currentMessage}
                result={currentResult}
                onRate={onRate}
                onRegenerate={onRegenerate}
                onDownload={onDownload}
                onImageClick={onImageClick}
                service={service}
                selectedModel={selectedModel}
                onModelChange={onSelectedModelChange}
                techplanMode={currentMessage?.techplanMode || techplanModeLocal}
                onTechplanModeChange={setTechplanModeLocal}
              />
            </div>
          )}
        </div>
      )}

      {/* Логотип и панель - в центре до первого сообщения */}
      {!showMessages && (
        <div className="flex-1 flex flex-col items-center justify-center -mt-16">
          <h1 className="text-5xl font-light tracking-[-0.03em] text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1' }}>ARCPLAN</h1>
          <div className="mx-auto max-w-3xl px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.35 }}
              className="w-full flex justify-center"
            >
          <AdvancedSearchBar 
            onAdvanced={() => setShowAdvanced(true)} 
            onAttach={onAttach}
            attachments={attachments}
            modelMenuOpen={modelMenuOpen}
            onModelMenuToggle={onModelMenuToggle}
            onFilesSelected={onFilesSelected}
                onSendMessage={onSendMessage}
                isGenerating={isGenerating}
                isAtBottom={showMessages}
                onImageClick={onImageClick}
                additionalButtons={null}
                model={model}
                onModelSelect={onModelSelect}
                service={service}
                selectedModel={selectedModel}
                onSelectedModelChange={onSelectedModelChange}
          />
        </motion.div>
      </div>
        </div>
      )}

      {/* Панель внизу отключена по требованию: скрываем поиск/модель в чате */}

      <AdvancedSuperBanner 
        showMessages={showMessages}
      />
    </main>
  );
}

function AdvancedSearchBar({ onAdvanced, onAttach, attachments = [], modelMenuOpen, onModelMenuToggle, onFilesSelected, onSendMessage, isGenerating = false, isAtBottom = false, additionalButtons = null, onImageClick, onModelChange, model, onModelSelect, service, selectedModel, onSelectedModelChange }) {
  const [query, setQuery] = useState("");
  const [techplanMode, setTechplanMode] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSendTooltip, setShowSendTooltip] = useState(false);
  const filtersButtonRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Отслеживаем изменения модели извне
  useEffect(() => {
    if (onModelChange) {
      onModelChange(model);
    }
  }, [model, onModelChange]);

  const fileInputRef = useRef(null);
  
  // Горизонтальный скролл колесиком мышки
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);
  
  // Drag to scroll
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    // Не начинаем драг если кликнули на кнопку или интерактивный элемент
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
    e.preventDefault();
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grab';
      }
    }
  };

  const canSend = attachments.length > 0 && (
    model === "3d" ? query.trim().length > 0 : 
    model === "cleanup" ? true : 
    techplanMode !== null
  );

  return (
    <div className="relative z-20 w-full max-w-3xl mx-auto">
      {/* Attached Files Preview - Above the search bar */}
      {attachments.length > 0 && (
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide cursor-grab select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="inline-flex items-center gap-2 px-2 h-[64px] rounded-md bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/[0.15] transition-all duration-300 group relative flex-shrink-0"
            >
              {/* Превью изображения - кликабельно для предпросмотра */}
              <div 
                className="w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-white/30 to-white/10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageClick?.(attachment.url, attachment.name)}
              >
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-white/90 font-medium truncate max-w-[150px]">{attachment.name}</span>
                <span className="text-[10px] text-white/50">{(attachment.size / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAttach?.(attachment.id, 'remove');
                }}
                className="ml-1.5 text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Удалить"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Search Bar */}
      <div className={`bg-white/5 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5 rounded-md`}>
      <div className="flex items-center gap-3 pr-2 py-0.5 min-h-[48px]">
        <div className="relative pl-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md hover:bg-white/10 transition-all duration-200 group hover:scale-110"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Paperclip className="h-5 w-5 text-white hover:text-white transition-transform duration-200 group-hover:scale-110" />
          </button>
          {/* Кнопка фильтров рядом со скрепкой (только когда панель внизу) */}
          {isAtBottom && (
            <button
              ref={filtersButtonRef}
              onClick={() => {
                // Тоггл окна фильтров, заодно закрываем меню модели
                setShowFilters((v) => !v);
                onModelMenuToggle?.(false);
              }}
              className="ml-1 p-1.5 rounded-md hover:bg-white/10 transition-all duration-200 group hover:scale-110"
              title="Фильтры"
            >
              <Filter className="h-5 w-5 text-white" />
            </button>
          )}
          
          {/* Скрытый input для выбора файлов */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFilesSelected}
          />
          
          {/* Подсказка при наведении */}
          {showTooltip && (
             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 text-white text-sm rounded-sm whitespace-nowrap z-50 text-center">
              Прикрепить
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </div>
          )}
        </div>

        {/* Center area: input / techplan toggles / empty for cleanup */}
        {model === "3d" && (
          <input
            placeholder="Что ты хочешь узнать?"
             className="flex-1 bg-transparent py-1 text-[16px] placeholder:text-neutral-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        {model === "techplan" && (
           <div className="flex-1 h-10 flex items-center gap-3 px-6">
            <AdvancedToggleChip
              label="С мебелью"
              active={techplanMode === "with"}
              onClick={() => {
                setTechplanMode("with");
                onAdvanced?.();
              }}
            />
            <div className="h-4 w-px bg-white/20"></div>
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

        {model === "cleanup" && (
           <div className="flex-1 h-10 flex items-center gap-4 px-6">
            <div className="text-sm text-neutral-400">Удаление объектов</div>
          </div>
        )}

        {/* Right controls: model selector + Send button */}
         <div className="hidden md:flex items-center gap-3 text-sm ml-4">
          <AdvancedModelMenu
            service={service}
            value={selectedModel}
            onChange={(modelId) => {
                onSelectedModelChange?.(modelId);
                onAdvanced?.();
            }}
            isOpen={modelMenuOpen}
            onToggle={onModelMenuToggle}
          />

          <div 
            className="relative"
            onMouseEnter={() => !canSend && setShowSendTooltip(true)}
            onMouseLeave={() => setShowSendTooltip(false)}
          >
            <button
              type="button"
              disabled={!canSend || isGenerating}
              className="mr-1 mt-2 mb-2 rounded-md p-1.5 ring-1 ring-white/10 bg-white hover:bg-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group hover:scale-110"
              onClick={() => {
                if (!canSend || isGenerating) return;
                const payload = { model, query, techplanMode, attachments };
                onSendMessage?.(payload);
              }}
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                   className="h-4 w-4 text-black"
                >
                  ✷
                </motion.div>
              ) : (
              <svg 
                 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 text-black"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              )}
            </button>
            
            {/* Подсказка для недоступной кнопки отправки */}
            {showSendTooltip && !canSend && (
              <div 
                 className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 text-white text-sm rounded-sm whitespace-nowrap z-50 text-center"
                onMouseEnter={() => setShowSendTooltip(true)}
                onMouseLeave={() => setShowSendTooltip(false)}
              >
                Прикрепите фотографию
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Дополнительные кнопки когда панель внизу */}
      {isAtBottom && additionalButtons && (
        <div className="px-4 md:px-6 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {additionalButtons}
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
      className={`rounded-md px-4 py-2 text-sm transition ${
        active
          ? "text-white border border-white/40"
          : "text-neutral-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

// Компактный компонент для выбора модели в сообщении
function AdvancedModelMenuCompact({ service, value, onChange }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  const models = MODEL_OPTIONS[service] || [];
  const current = models.find((m) => m.id === value) || models[0];

  return (
    <div ref={menuRef} className="relative" data-model-menu>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center gap-2 cursor-pointer text-sm text-white hover:text-neutral-300 transition"
      >
        <span>{current?.label}</span>
        <ChevronDown className={`h-3 w-3 text-white opacity-70 transition-transform duration-200 ease-out ${open ? 'rotate-180' : 'rotate-0'}`} />
      </div>
      {open && (
        <div className="absolute right-0 w-52 rounded border border-white/10 bg-[#2d2e31] p-1.5 shadow-2xl z-[100] bottom-full mb-2">
          {models.map((model) => (
            <div
              key={model.id}
              onClick={(e) => {
                e.stopPropagation();
                onChange(model.id);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/10 transition cursor-pointer ${
                value === model.id ? 'bg-white/5' : ''
              }`}
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">{model.label}</div>
                <div className="text-xs text-neutral-400">{model.description}</div>
              </div>
              {value === model.id && <div className="h-2 w-2 bg-white rounded-full ml-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент для выбора моделей в поисковой строке
function AdvancedModelMenu({ service, value, onChange, isOpen, onToggle }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isMenuOpen = isOpen !== undefined ? isOpen : open;
  const toggleMenu = (next) => {
    if (onToggle) {
      if (typeof next === 'boolean') onToggle(next); else onToggle(!isMenuOpen);
    } else {
      if (typeof next === 'boolean') setOpen(next); else setOpen(!isMenuOpen);
    }
  };
  
  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        toggleMenu(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const models = MODEL_OPTIONS[service] || [];
  const current = models.find((m) => m.id === value) || models[0];

  return (
    <div ref={menuRef} className="relative" data-model-menu>
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu();
        }}
        className="flex items-center gap-2 cursor-pointer text-sm text-white hover:text-neutral-300 transition"
      >
        <span>{current?.label}</span>
        <ChevronDown className={`h-3 w-3 text-white opacity-70 transition-transform duration-200 ease-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>
      {isMenuOpen && (
        <div className="absolute right-0 w-52 rounded border border-white/10 bg-[#2d2e31] p-1.5 shadow-2xl z-[100] top-full mt-2">
          {models.map((model) => (
            <div
              key={model.id}
              onClick={(e) => {
                e.stopPropagation();
                onChange(model.id);
                toggleMenu(false);
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/10 transition cursor-pointer ${
                value === model.id ? 'bg-white/5' : ''
              }`}
            >
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">{model.label}</div>
                <div className="text-xs text-neutral-400">{model.description}</div>
              </div>
              {value === model.id && <div className="h-2 w-2 bg-white rounded-full ml-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент для выбора услуги (размещается в правом верхнем углу)
function AdvancedServiceSelector({ value, onChange, isOpen, onToggle }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isMenuOpen = isOpen !== undefined ? isOpen : open;
  const toggleMenu = (next) => {
    if (onToggle) {
      if (typeof next === 'boolean') onToggle(next); else onToggle(!isMenuOpen);
    } else {
      if (typeof next === 'boolean') setOpen(next); else setOpen(!isMenuOpen);
    }
  };
  
  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        toggleMenu(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const items = [
    { key: "techplan", label: "Создание по техплану", sub: "Перерисовать 2D план из фото техплана" },
    { key: "cleanup", label: "Удаление объектов", sub: "Очистить фото комнаты от мебели и мусора" },
  ];

  const current = items.find((i) => i.key === value);

  return (
    <div ref={menuRef} className="relative" data-service-selector>
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu();
        }}
        className="cursor-pointer text-lg text-white hover:text-neutral-300 transition relative flex items-center gap-2"
        style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.3)' }}
      >
        <span>{current.label}</span>
        <ChevronDown className={`h-5 w-5 text-neutral-400 self-end transition-transform duration-200 ease-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>
      {isMenuOpen && (
         <div 
           className="absolute right-0 w-56 rounded border border-white/10 bg-[#2d2e31] p-1.5 shadow-2xl z-[100] top-full mt-2"
         >
          {items.map((it) => (
            <div
              key={it.key}
              onClick={(e) => {
                e.stopPropagation();
                onChange(it.key);
                toggleMenu(false);
              }}
               className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/10 transition cursor-pointer ${
                value === it.key ? 'bg-white/5' : ''
              }`}
            >
              <div className="text-sm text-white">{it.label}</div>
              {value === it.key && <div className="h-2 w-2 bg-white rounded-full" />}
              </div>
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

function AdvancedSuperBanner({ showMessages = false }) {
  // Баннер отключен
  return null;
}

// === Custom Hook for Safe Blob URL Management ===
function useBlobUrl(file) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      setError(false);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setBlobUrl(url);
      setError(false);
      
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          console.warn('Ошибка при освобождении blob URL:', err);
        }
      };
    } catch (err) {
      console.error('Ошибка создания blob URL:', err);
      setError(true);
      setBlobUrl(null);
    }
  }, [file]);

  return { blobUrl, error };
}


// === Image Modal Component ===
function ImageModal({ isOpen, imageUrl, imageAlt, onClose }) {
  const [imageError, setImageError] = useState(false);
  
  if (!isOpen) return null;

  // Проверяем, что imageUrl существует и не является освобожденным blob URL
  const isValidImageUrl = imageUrl && 
    (!imageUrl.startsWith('blob:') || 
     (imageUrl.startsWith('blob:') && !imageError));

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[80vw] max-h-[80vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          title="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Изображение */}
        {isValidImageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            onError={() => {
              console.warn('Ошибка загрузки изображения в модальном окне:', imageUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="max-w-md max-h-md bg-gray-800 rounded-md p-8 text-center text-white">
            <div className="text-lg font-medium mb-2">Изображение недоступно</div>
            <div className="text-sm text-gray-400">Файл был удален или поврежден</div>
          </div>
        )}
      </div>
      
      {/* Клик по фону для закрытия */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}

// === Advanced Message System ===
function AdvancedMessageDisplay({ 
  isGenerating = false, 
  message = null, 
  result = null, 
  onRate, 
  onRegenerate, 
  onDownload,
  onImageClick,
  service = 'techplan',
  selectedModel = 'boston',
  onModelChange,
  techplanMode = 'with',
  onTechplanModeChange
}) {
  // Используем isGenerating из result, если оно есть, иначе используем проп
  const actualIsGenerating = result?.isGenerating ?? isGenerating;
  
  if (!actualIsGenerating && !message && !result) return null;

  return (
    <div className="relative z-20 w-full px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* Сообщение пользователя */}
        {message && (
          <div className="flex justify-end">
            <div className="w-fit max-w-[33vw] min-w-[280px] rounded-md bg-white/10 ring-1 ring-white/20 backdrop-blur px-3 py-2">
              {/* Название чата */}
              <div className="text-[11px] font-medium text-white/80 mb-1.5 pb-1.5 border-b border-white/10">
                {message.chatTitle}
              </div>
              
              {/* Текст сообщения (показываем только если есть текст) */}
              {message.text && (
                <div className="text-sm text-white whitespace-pre-wrap mb-2">{message.text}</div>
              )}
              
              {/* Прикрепленные файлы с горизонтальным скроллом */}
              {message.attachments && message.attachments.length > 0 && (
                <div className={`overflow-x-auto scrollbar-hide pb-1 ${message.text ? 'mt-2' : 'mt-1.5'}`}>
                  <div className="flex gap-2" style={{ minWidth: 'min-content' }}>
                    {message.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-2 px-2 h-[64px] rounded-md bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/[0.15] transition-all duration-300 group relative flex-shrink-0 cursor-pointer"
                        onClick={() => att.url && onImageClick?.(att.url, att.name)}
                      >
                        {/* Превью изображения */}
                        {att.url ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-white/30 to-white/10 flex-shrink-0">
                            <img 
                              src={att.url} 
                              alt={att.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-4 w-4 text-white/70" />
                          </div>
                        )}
                        
                        {/* Информация о файле */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-white/90 font-medium truncate max-w-[150px]" title={att.name}>
                            {att.name}
                          </span>
                          <span className="text-[10px] text-white/50">
                            {att.size ? `${(att.size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Анимация генерации */}
        {actualIsGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-md bg-white/5 ring-1 ring-white/10 backdrop-blur px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-lg"
                >
                  ✷
                </motion.div>
                <span className="font-medium">ARCPLAN генерирует изображение...</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1.5">
                Обработка фотографий и генерация результата
              </div>
            </div>
          </div>
        )}

        {/* Результат от модели */}
        {result && !actualIsGenerating && (
          <div className="flex justify-start">
            <div className="w-fit max-w-[55%] rounded-md bg-white/5 ring-1 ring-white/10 backdrop-blur px-4 py-3">
              
              {/* Сгенерированное изображение или заглушка */}
              {result.image ? (
                <div className="mb-4">
                  <div className="relative">
                    <img 
                      src={result.image} 
                      alt="Результат генерации" 
                      className="rounded-md ring-1 ring-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ width: 'min(560px, 36vw)', height: 'min(560px, 36vw)', objectFit: 'contain' }}
                      onClick={() => onImageClick?.(result.image, "Результат генерации")}
                      onError={(e) => {
                        console.warn('Ошибка загрузки изображения результата:', result.image);
                        e.target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'rounded-md ring-1 ring-red-500/20 bg-red-500/10 p-4 text-center text-red-400 text-sm';
                        errorDiv.innerHTML = 'Ошибка загрузки изображения. <a href="' + result.image + '" target="_blank" class="underline">Открыть в новой вкладке</a>';
                        e.target.parentNode.appendChild(errorDiv);
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload?.(result.image);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-md bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      title="Скачать изображение"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div 
                    className="rounded-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ width: 'min(560px, 36vw)', height: 'min(560px, 36vw)' }}
                    onClick={() => onImageClick?.('placeholder', 'Результат генерации')}
                  >
                    <div className="text-center">
                      <ImageIcon className="h-24 w-24 text-white/30 mx-auto mb-3" />
                      <div className="text-lg text-white/50">1200 × 1200</div>
                      <div className="text-sm text-white/30 mt-2">Изображение результата</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-white whitespace-pre-wrap mb-3">
                {result.text}
              </div>
              
              {result.images && Array.isArray(result.images) && result.images.length > 1 && (
                <div className="mb-4">
                  <div className="text-xs text-white/70 mb-2">Дополнительные результаты ({result.images.length}):</div>
                  <div className="grid grid-cols-2 gap-3 max-w-[560px]">
                    {result.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={imageUrl} 
                          alt={`Результат ${index + 1}`}
                          className="w-full rounded-md ring-1 ring-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onImageClick?.(imageUrl, `Результат ${index + 1}`)}
                          onError={(e) => {
                            console.warn('Ошибка загрузки дополнительного изображения:', imageUrl);
                            e.target.style.display = 'none';
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload?.(imageUrl);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                          title="Скачать изображение"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Нижняя часть: кнопки слева, модель справа */}
              <div className="flex items-end justify-between gap-4">
                {/* Левая часть: кнопки действий */}
                <div className="flex items-center gap-2 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
                  {result.image && (
                    <button
                      onClick={() => onDownload?.(result.image)}
                      className="h-8 w-8 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                      title="Скачать"
                    >
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => onRegenerate?.(result.messageId)}
                    className="h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-xs text-white"
                    title="Повторить"
                  >
                    Повторить
                  </button>
                  
                  {/* Режим для techplan */}
                  {service === 'techplan' && (
                    <>
                      <div className="h-6 w-px bg-white/10"></div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onTechplanModeChange && onTechplanModeChange('with'); }}
                        className={`h-8 px-3 rounded-md transition-colors text-xs ${
                          techplanMode === 'with'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                        title="С мебелью"
                      >
                        С мебелью
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onTechplanModeChange && onTechplanModeChange('without'); }}
                        className={`h-8 px-3 rounded-md transition-colors text-xs ${
                          techplanMode === 'without'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                        title="Без мебели"
                      >
                        Без мебели
                      </button>
                    </>
                  )}
                </div>
                
                {/* Правая часть: выбор модели */}
                <div className="flex items-center gap-2 text-sm">
                  <AdvancedModelMenuCompact
                    service={service}
                    value={selectedModel}
                    onChange={onModelChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MonochromeClaudeStyle() {
  const { user, logout, saveSettings, loadSettings, refreshUser, grantOrganizationAccess, fetchOrganizationUsers } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState("techplan"); // Выбор услуги: techplan или cleanup
  const [selectedModel, setSelectedModel] = useState("boston"); // Выбор модели: boston, melbourne, charleston
  const [model, setModel] = useState("techplan"); // Оставляем для совместимости
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [value, setValue] = useState("");
  const [removeDepth, setRemoveDepth] = useState(null); // null | 'surface' | 'partial' | 'full' // surface | partial | full
  const [planFurniture, setPlanFurniture] = useState(null); // 'with' | 'without' | null
  const [attachments, setAttachments] = useState([]); // {id,name,size,url,file}
  const fileInputRef = useRef(null);
  const textRef = useRef(null);

  // Очистка blob URL при размонтировании компонента
  useEffect(() => {
    return () => {
      // Очищаем все blob URL при размонтировании
      attachments.forEach((item) => {
        if (item.url && item.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(item.url);
          } catch (error) {
            console.warn('Ошибка при освобождении blob URL при размонтировании:', error);
          }
        }
      });
    };
  }, [attachments]);

  // Очистка всех blob URL при инициализации компонента
  useEffect(() => {
    // Очищаем все возможные blob URL при загрузке страницы
    const cleanupBlobUrls = () => {
      try {
        // Получаем все ключи localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('advancedMessageHistory')) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                // Проверяем и очищаем blob URL в истории
                Object.keys(parsed).forEach(chatId => {
                  const messages = parsed[chatId];
                  if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                      if (msg.attachments) {
                        msg.attachments.forEach(att => {
                          if (att.url && att.url.startsWith('blob:')) {
                            att.url = null; // Убираем blob URL
                          }
                        });
                      }
                    });
                  }
                });
                localStorage.setItem(key, JSON.stringify(parsed));
              }
            } catch (error) {
              console.warn('Ошибка очистки blob URL в localStorage:', error);
            }
          }
        });
      } catch (error) {
        console.warn('Ошибка при очистке blob URL:', error);
      }
    };

    cleanupBlobUrls();
    
    // Периодическая очистка localStorage каждые 5 минут
    const cleanupInterval = setInterval(() => {
      try {
        const keys = Object.keys(localStorage);
        let totalSize = 0;
        
        // Подсчитываем общий размер данных
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([value]).size;
          }
        });
        
        // Если общий размер больше 8MB, очищаем старые данные
        if (totalSize > 8 * 1024 * 1024) {
          console.warn('localStorage переполнен, выполняем очистку');
          keys.forEach(key => {
            if (key.includes('advancedMessageHistory') || key.includes('chats@')) {
              localStorage.removeItem(key);
            }
          });
        }
      } catch (error) {
        console.warn('Ошибка при периодической очистке localStorage:', error);
      }
    }, 5 * 60 * 1000); // 5 минут
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Site style (persisted per user)
  const [userId] = useState(() => {
    if (typeof window === "undefined") return "anon";
    return localStorage.getItem("userId") || "anon";
  });

  // Chats state
  const [chats, setChats] = useState(() => {
    // Загружаем чаты из localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chats@${userId}`);
      if (saved) {
        const parsedChats = JSON.parse(saved);
        return parsedChats.length > 0 ? parsedChats : [{ id: `chat-${Date.now()}`, title: "Новый чат", messages: [] }];
      }
    }
    return [{ id: `chat-${Date.now()}`, title: "Новый чат", messages: [] }];
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    // Загружаем активный чат из localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`activeChatId@${userId}`);
      if (saved) {
        return saved;
      }
    }
    return chats[0]?.id;
  });
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasFirstMessage, setHasFirstMessage] = useState(false);
  const [responses, setResponses] = useState({}); // { messageId: { text, rating, canRegenerate } }

  // Left/Right drawers
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [rightTab, setRightTab] = useState("chats"); // 'chats' | 'settings'

  const [siteStyle, setSiteStyle] = useState(() => {
    if (typeof window === "undefined") return STYLE_OPTIONS[0].id; // Advanced by default
    return localStorage.getItem(`siteStyle@${userId}`) || STYLE_OPTIONS[0].id;
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
  const [backgroundType, setBackgroundType] = useState("standard");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [limitNotice, setLimitNotice] = useState('');
  const [regenerationUsage, setRegenerationUsage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`regenerations@${userId}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [organizationModal, setOrganizationModal] = useState({ isOpen: false, loading: false, users: [], error: '' });
  const [guestPlanCount, setGuestPlanCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('guestPlansUsed');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const isDirector = user?.role === 'director';
  const isOrganizationUser = user?.accessPrefix === 'Организация';
  const hasUnlimitedAccess = isDirector || isOrganizationUser;

  // Confirmation modals state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    onConfirm: null
  });

  // Загружаем настройки при монтировании
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        const settings = await loadSettings();
        if (settings) {
          if (settings.siteStyle) setSiteStyle(settings.siteStyle);
          if (settings.backgroundType) setBackgroundType(settings.backgroundType);
        }
      }
    };
    loadUserSettings();
  }, [user]);

  // Сохраняем настройки при изменении
  useEffect(() => {
    const saveUserSettings = async () => {
      if (user) {
        await saveSettings({
          siteStyle,
          backgroundType
        });
      }
    };
    // Сохраняем с небольшой задержкой чтобы не спамить сервер
    const timeoutId = setTimeout(saveUserSettings, 500);
    return () => clearTimeout(timeoutId);
  }, [siteStyle, backgroundType, user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`regenerations@${userId}`, JSON.stringify(regenerationUsage));
    }
  }, [regenerationUsage, userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`regenerations@${userId}`);
      setRegenerationUsage(saved ? JSON.parse(saved) : {});
    }
  }, [userId]);

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      localStorage.setItem('guestPlansUsed', guestPlanCount.toString());
    }
  }, [guestPlanCount, user]);

  useEffect(() => {
    if (user) {
      setGuestPlanCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!limitNotice) return;
    const timer = setTimeout(() => setLimitNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [limitNotice]);

  useEffect(() => {
    if (hasUnlimitedAccess && Object.keys(regenerationUsage).length) {
      setRegenerationUsage({});
    }
  }, [hasUnlimitedAccess]);


  // Advanced message system states
  const [advancedCurrentMessage, setAdvancedCurrentMessage] = useState(null);
  const [advancedCurrentResult, setAdvancedCurrentResult] = useState(null);
  const [advancedIsGenerating, setAdvancedIsGenerating] = useState(false);
  const [advancedMessageHistory, setAdvancedMessageHistory] = useState(() => {
    // Загружаем историю сообщений из localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`advancedMessageHistory@${userId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Проверяем размер данных и очищаем если слишком много
          const dataSize = new Blob([saved]).size;
          if (dataSize > 10 * 1024 * 1024) { // Больше 10MB
            console.warn('История сообщений слишком большая, очищаем');
            localStorage.removeItem(`advancedMessageHistory@${userId}`);
            return {};
          }
          return parsed;
        }
      } catch (error) {
        console.error('Ошибка загрузки истории сообщений:', error);
        localStorage.removeItem(`advancedMessageHistory@${userId}`);
      }
    }
    return {};
  }); // { chatId: [messages] }

  // Image modal state
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', alt: '' });
  
  // Modal states
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    onConfirm: null,
    onCancel: null,
    showRememberOption: false
  });
  
  // Rename chat modal state
  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    chatId: null,
    currentTitle: '',
    showRememberOption: false
  });
  
  // User settings for confirmations
  const [userSettings, setUserSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`userSettings@${userId}`);
      return saved ? JSON.parse(saved) : {
        skipDeleteConfirmation: false,
        skipRenameConfirmation: false,
        showActionNotifications: true
      };
    }
    return {
      skipDeleteConfirmation: false,
      skipRenameConfirmation: false,
      showActionNotifications: true
    };
  });
  
  // Сохраняем настройки пользователя в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`userSettings@${userId}`, JSON.stringify(userSettings));
    }
  }, [userSettings, userId]);
  
  // Функция для обновления настроек
  const updateUserSettings = (newSettings) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Обработчики для модального окна переименования
  const handleRenameConfirm = (newTitle, rememberChoice) => {
    if (renameModal.chatId && newTitle.trim()) {
      setChats(chats.map(c => 
        c.id === renameModal.chatId ? { ...c, title: newTitle.trim() } : c
      ));
    }
    
    if (rememberChoice) {
      updateUserSettings({ skipRenameConfirmation: true });
    }
    
    setRenameModal({
      isOpen: false,
      chatId: null,
      currentTitle: '',
      showRememberOption: false
    });
  };
  
  const handleRenameCancel = () => {
    setRenameModal({
      isOpen: false,
      chatId: null,
      currentTitle: '',
      showRememberOption: false
    });
  };

  // Сохраняем историю сообщений в localStorage с ограничениями
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Ограничиваем количество сообщений в истории (максимум 20 на чат)
        const limitedHistory = {};
        Object.keys(advancedMessageHistory).forEach(chatId => {
          const messages = advancedMessageHistory[chatId];
          if (messages && messages.length > 20) {
            // Берем только последние 20 сообщений
            limitedHistory[chatId] = messages.slice(-20);
          } else {
            limitedHistory[chatId] = messages;
          }
        });

        // Проверяем размер данных перед сохранением
        const dataString = JSON.stringify(limitedHistory);
        const dataSize = new Blob([dataString]).size;
        
        // Если размер больше 2MB, очищаем старые чаты
        if (dataSize > 2 * 1024 * 1024) {
          console.warn('История сообщений слишком большая, очищаем старые чаты');
          const chatIds = Object.keys(limitedHistory);
          const chatsToKeep = chatIds.slice(-2); // Оставляем только последние 2 чата
          const cleanedHistory = {};
          chatsToKeep.forEach(chatId => {
            cleanedHistory[chatId] = limitedHistory[chatId];
          });
          localStorage.setItem(`advancedMessageHistory@${userId}`, JSON.stringify(cleanedHistory));
        } else {
          localStorage.setItem(`advancedMessageHistory@${userId}`, dataString);
        }
      } catch (error) {
        console.error('Ошибка сохранения истории сообщений:', error);
        // Если ошибка QuotaExceededError, очищаем историю
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage переполнен, очищаем историю сообщений');
          // Очищаем все данные истории для этого пользователя
          localStorage.removeItem(`advancedMessageHistory@${userId}`);
          // Также очищаем другие возможные ключи
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.includes('advancedMessageHistory') || key.includes('chats@')) {
              localStorage.removeItem(key);
            }
          });
        }
      }
    }
  }, [advancedMessageHistory, userId]);

  // Сохраняем чаты в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chats@${userId}`, JSON.stringify(chats));
    }
  }, [chats, userId]);

  // Сохраняем активный чат в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && activeChatId) {
      localStorage.setItem(`activeChatId@${userId}`, activeChatId);
    }
  }, [activeChatId, userId]);

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
    // Преобразуем MODEL_OPTIONS в плоский массив
    const allModels = Object.values(MODEL_OPTIONS).flat();
    
    const settingsOptions = [
      { id: 'style', label: 'Стиль сайта', options: STYLE_OPTIONS },
      { id: 'model', label: 'ARCPLAN MODEL', options: allModels },
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
        setModel(setting.id);
        break;
      case 'background':
        setBackgroundType(setting.id);
        break;
      default:
        break;
    }
    setSearchQuery(""); // Очищаем поиск после выбора
  };

  // Advanced message system handlers
  const handleAdvancedSendMessage = async (payload) => {
    const { model, query, techplanMode, attachments } = payload;

    if (model === "techplan") {
      if (!hasUnlimitedAccess) {
        if (user && (user.plansUsed ?? 0) >= 1) {
          setLimitNotice('Лимит генераций исчерпан. Обратитесь к директору за доступом «Организация».');
          return;
        }
        if (!user && guestPlanCount >= 1) {
          setLimitNotice('Гостевой лимит генераций исчерпан. Попросите доступ «Организация» у директора.');
          return;
        }
      }
    }
    
    // Генерируем название чата на основе модели и даты
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${day}.${month}.${year} ${hours}:${minutes}`;
    
    let chatTitle = "Новый чат";
    if (model === "techplan") {
      chatTitle = `Создание плана ${dateStr}`;
    } else if (model === "cleanup") {
      chatTitle = `Удаление объектов ${dateStr}`;
    }
    
    // Создаем сообщение пользователя
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: model === "3d" ? query : "",
      attachments: attachments.map((a) => ({ id: a.id, name: a.name, url: a.url, size: a.size })),
      chatTitle: chatTitle,
      time: new Date().toISOString(),
      // Сохраняем параметры для повторного запроса
      requestParams: {
        model,
        query,
        techplanMode,
        attachments: attachments.map((a) => ({ id: a.id, name: a.name, file: a.file, size: a.size }))
      }
    };

    setAdvancedCurrentMessage(userMessage);
    setAdvancedIsGenerating(true);
    setAdvancedCurrentResult(null);

    try {
      let responseText = "";
      let responseImage = null;

      if (model === "techplan" && attachments.length > 0) {
        // Ранее здесь был лимит на количество изображений; лимит снят

        // Генерация технического плана
        const formData = new FormData();
        // прикладываем все изображения
        attachments.forEach((att) => formData.append('image', att.file));
        formData.append('mode', techplanMode === "with" ? "withFurniture" : "withoutFurniture");

        // Показываем прогресс для множественных изображений
        if (attachments.length > 1) {
          responseText = `Обрабатываю ${attachments.length} изображений по очереди для снижения нагрузки на сервер...`;
        }

        const response = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || '';
          let errorMessage = 'Ошибка генерации технического плана';
          let errorCode;
          try {
            if (contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData?.error || errorMessage;
              errorCode = errorData?.code;
              
              // Специальная обработка ошибок COMETAPI
              if (errorMessage.includes('当前分组上游负载已饱和') || errorMessage.includes('shell_api_error')) {
                errorMessage = 'Сервер перегружен, попробуйте через несколько минут. Система автоматически повторит попытку.';
              }
            } else {
              const text = await response.text();
              errorMessage = text?.slice(0, 300) || errorMessage;
            }
          } catch (_) {}
          const err = new Error(errorMessage);
          if (errorCode) err.code = errorCode;
          throw err;
        }

        // Поддержка множественных результатов
        const contentType = response.headers.get('content-type') || '';
        let responseImages = [];
        if (contentType.includes('application/json')) {
          const data = await response.json();
          console.log('📊 Ответ от API techplan:', data);
          
          // Обрабатываем структуру ответа от API generate-technical-plan
          if (data.success) {
            if (data.result) {
              // Один результат
              responseImages = [data.result.imageUrl];
            } else if (data.results && Array.isArray(data.results)) {
              // Множественные результаты
              responseImages = data.results.map(r => r.imageUrl);
            }
          }
        } else {
          // Конвертируем blob в base64 для прямого использования
        const imageBlob = await response.blob();
          const reader = new FileReader();
          responseImages = await new Promise((resolve) => {
            reader.onload = () => resolve([reader.result]);
            reader.readAsDataURL(imageBlob);
          });
        }
        responseImage = responseImages[0] || null;
        responseText = `Технический план успешно создан в режиме "${techplanMode === "with" ? "С мебелью" : "Без мебели"}".`;

        if (!hasUnlimitedAccess) {
          if (user) {
            await refreshUser();
          } else {
            setGuestPlanCount((prev) => prev + 1);
          }
        }
      } else if (model === "cleanup" && attachments.length > 0) {
        // Ранее здесь был лимит на количество изображений; лимит снят

        // Переносим текущее user‑сообщение в историю один раз до начала цикла
        setAdvancedMessageHistory(prev => ({
          ...prev,
          [activeChatId]: [
            ...(prev[activeChatId] || []),
            {
              ...userMessage,
              type: 'user',
              chatTitle: userMessage.chatTitle,
              attachments: userMessage.attachments?.map(att => ({ id: att.id, name: att.name, size: att.size, url: att.url }))
            }
          ]
        }));
        // Убираем дублирование в зоне текущего сообщения
        setAdvancedCurrentMessage(null);

        // Последовательно отправляем каждый файл и добавляем отдельное AI‑сообщение
        for (let i = 0; i < attachments.length; i++) {
          const attachment = attachments[i];
          const formData = new FormData();
          formData.append('image', attachment.file);

          try {
            const response = await fetch(`${API_BASE_URL}/api/remove-objects`, {
              method: 'POST',
              headers: {
                'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
              },
              body: formData
            });

            let resultImage = null;
            if (response.ok) {
              const contentType = response.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const data = await response.json();
                if (data.success && data.result) {
                  resultImage = data.result.imageUrl;
                }
              } else {
                const imageBlob = await response.blob();
                const reader = new FileReader();
                resultImage = await new Promise((resolve) => {
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(imageBlob);
                });
              }
            }

            const aiResponse = {
              messageId: `${userMessage.id}-${i}`,
              text: '',
              image: resultImage,
              rating: null,
              canRegenerate: true,
              time: new Date().toISOString()
            };

            setAdvancedMessageHistory(prev => ({
              ...prev,
              [activeChatId]: [
                ...(prev[activeChatId] || []),
                { ...aiResponse, type: 'ai' }
              ]
            }));
          } catch (e) {
            // Даже при ошибке добавляем пустое AI‑сообщение, чтобы сохранить количество
            const aiResponse = {
              messageId: `${userMessage.id}-${i}`,
              text: '',
              image: null,
              rating: null,
              canRegenerate: true,
              time: new Date().toISOString()
            };
            setAdvancedMessageHistory(prev => ({
              ...prev,
              [activeChatId]: [
                ...(prev[activeChatId] || []),
                { ...aiResponse, type: 'ai' }
              ]
            }));
          }
        }

        // Очистка состояния после завершения всех изображений
        setAdvancedCurrentMessage(null);
        setAdvancedCurrentResult(null);
        setAdvancedIsGenerating(false);
        clearAllAttachments();
        // Переименовываем чат
        autoRenameChat(activeChatId, model, techplanMode);
        return;
      } else {
        // Обычная обработка для других моделей
        responseText = `Вот результат обработки вашего запроса "${userMessage.text}".`;
      }
      
      const aiResponse = {
        messageId: userMessage.id,
        text: responseText,
        image: responseImage,
        images: (typeof responseImages !== 'undefined' ? responseImages : undefined) || (typeof responseImages2 !== 'undefined' ? responseImages2 : undefined),
        rating: null,
        canRegenerate: true
      };

      setAdvancedCurrentResult(aiResponse);
      
      // Добавляем сообщения в историю для текущего чата
      setAdvancedMessageHistory(prev => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          { 
            ...userMessage, 
            type: 'user',
            chatTitle: userMessage.chatTitle,
            // Сохраняем attachments с ключевыми данными (без blob URL)
            attachments: userMessage.attachments?.map(att => ({
              id: att.id,
              name: att.name,
              size: att.size,
              url: att.url
            }))
          },
          { ...aiResponse, type: 'ai', time: new Date().toISOString() }
        ]
      }));
      
      // Автоматически переименовываем чат по модели
      autoRenameChat(activeChatId, model, techplanMode);
      
      // Очищаем текущие сообщения после добавления в историю
      setAdvancedCurrentMessage(null);
      setAdvancedCurrentResult(null);
    } catch (error) {
      console.error('Ошибка генерации:', error);
      
      // Определяем тип ошибки для более точной обработки
      let errorMessage = error.message;
      let isCometApiError = false;
      
      if (errorMessage.includes('Сервис генерации временно недоступен') || 
          errorMessage.includes('No available channels') ||
          errorMessage.includes('comet_api_error') ||
          errorMessage.includes('503')) {
        isCometApiError = true;
        errorMessage = 'Сервис генерации временно недоступен. Попробуйте позже.';
      } else if (errorMessage.includes('API_KEY_MISSING')) {
        errorMessage = 'Сервис временно недоступен. Обратитесь к администратору.';
      }
      
      if (error.code === 'PLAN_LIMIT' || error.code === 'GUEST_LIMIT') {
        setLimitNotice(error.message);
        if (error.code === 'PLAN_LIMIT') {
          await refreshUser();
        }
        if (error.code === 'GUEST_LIMIT') {
          setGuestPlanCount(1);
        }
      } else if (model === 'techplan' || model === 'cleanup') {
        setLimitNotice(errorMessage);
      }
      
      const errorResponse = {
        messageId: userMessage.id,
        text: '',
        rating: null,
        canRegenerate: !isCometApiError // Не позволяем повторную генерацию при ошибках COMETAPI
      };

      setAdvancedCurrentResult(errorResponse);
      
      // Добавляем сообщения в историю даже при ошибке
      setAdvancedMessageHistory(prev => ({
        ...prev,
        [activeChatId]: [
          ...(prev[activeChatId] || []),
          { 
            ...userMessage, 
            type: 'user',
            chatTitle: userMessage.chatTitle,
            // Сохраняем attachments с ключевыми данными (без blob URL)
            attachments: userMessage.attachments?.map(att => ({
              id: att.id,
              name: att.name,
              size: att.size,
              url: att.url
            }))
          },
          { ...errorResponse, type: 'ai', time: new Date().toISOString() }
        ]
      }));
      
      // Автоматически переименовываем чат по модели даже при ошибке
      autoRenameChat(activeChatId, model, techplanMode);
      
      // Очищаем текущие сообщения после добавления в историю
      setAdvancedCurrentMessage(null);
      setAdvancedCurrentResult(null);
    } finally {
      setAdvancedIsGenerating(false);
      // Очищаем прикрепленные фотографии после завершения обработки
      clearAllAttachments();
    }
  };

  const handleAdvancedRate = (messageId, rating) => {
    setAdvancedCurrentResult(prev => prev ? {
      ...prev,
      rating
    } : null);
    
    // Обновляем рейтинг в истории для текущего чата
    setAdvancedMessageHistory(prev => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map(msg => 
        msg.messageId === messageId && msg.type === 'ai' 
          ? { ...msg, rating }
          : msg
      )
    }));
  };

  const handleAdvancedRegenerate = async (messageId) => {
    const regenLimit = hasUnlimitedAccess ? Infinity : 3;
    const currentRegenCount = regenerationUsage[activeChatId] || 0;
    if (regenLimit !== Infinity && currentRegenCount >= regenLimit) {
      setLimitNotice('Лимит повторов достигнут. Обратитесь к директору за доступом «Организация».');
      return;
    }

    // Находим сообщение: если клик был по AI — берём предыдущее user; если по user — берём его
    const messageHistory = advancedMessageHistory[activeChatId] || [];
    let userMessage = messageHistory.find(msg => msg.type === 'user' && msg.id === messageId);
    let aiIndex = -1;
    if (!userMessage) {
      aiIndex = messageHistory.findIndex(msg => msg.type === 'ai' && msg.messageId === messageId);
      if (aiIndex !== -1) {
        for (let i = aiIndex - 1; i >= 0; i--) {
          if (messageHistory[i].type === 'user') { userMessage = messageHistory[i]; break; }
        }
      }
    }

    if (!userMessage || !userMessage.requestParams) {
      console.error('Не найдены параметры запроса для повторной генерации');
      return;
    }

    const { model, query, techplanMode, attachments } = userMessage.requestParams;

    // Устанавливаем статус генерации для конкретного AI сообщения в истории
    setAdvancedMessageHistory(prev => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map(msg => 
        msg.type === 'ai' && msg.messageId === messageId 
          ? { ...msg, isGenerating: true }
          : msg
      )
    }));

    try {
      let responseImage = null;
      let responseText = '';

      if (model === "techplan" && attachments.length > 0) {
        // Ранее здесь был лимит на количество изображений; лимит снят

        // Генерация технического плана
        const formData = new FormData();
        // прикладываем все изображения
        attachments.forEach((att) => formData.append('image', att.file));
        formData.append('mode', techplanMode === "with" ? "withFurniture" : "withoutFurniture");

        // Показываем прогресс для множественных изображений
        if (attachments.length > 1) {
          responseText = `Обрабатываю ${attachments.length} изображений по очереди для снижения нагрузки на сервер...`;
        }

        const response = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || '';
          let errorMessage = 'Ошибка генерации технического плана';
          let errorCode;
          try {
            if (contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData?.error || errorMessage;
              errorCode = errorData?.code;

              // Специальная обработка ошибок COMETAPI
              if (errorMessage.includes('当前分组上游负载已饱和') || errorMessage.includes('shell_api_error')) {
                errorMessage = 'Сервер перегружен, попробуйте через несколько минут. Система автоматически повторит попытку.';
              }
            } else {
              const text = await response.text();
              errorMessage = text?.slice(0, 300) || errorMessage;
            }
          } catch (_) {}
          const err = new Error(errorMessage);
          if (errorCode) err.code = errorCode;
          throw err;
        }

        // Поддержка множественных результатов
        const contentType = response.headers.get('content-type') || '';
        let responseImages = [];
        if (contentType.includes('application/json')) {
          const data = await response.json();
          console.log('📊 Ответ от API techplan (regenerate):', data);
          
          // Обрабатываем структуру ответа от API generate-technical-plan
          if (data.success) {
            if (data.result) {
              // Один результат
              responseImages = [data.result.imageUrl];
            } else if (data.results && Array.isArray(data.results)) {
              // Множественные результаты
              responseImages = data.results.map(r => r.imageUrl);
            }
          }
        } else {
          // Конвертируем blob в base64 для прямого использования
          const imageBlob = await response.blob();
          const reader = new FileReader();
          responseImages = await new Promise((resolve) => {
            reader.onload = () => resolve([reader.result]);
            reader.readAsDataURL(imageBlob);
          });
        }
        responseImage = responseImages[0] || null;
        responseText = `Технический план успешно создан в режиме "${techplanMode === "with" ? "С мебелью" : "Без мебели"}".`;

        if (!hasUnlimitedAccess) {
          if (user) {
            await refreshUser();
          } else {
            setGuestPlanCount((prev) => prev + 1);
          }
        }
      } else if (model === "cleanup" && attachments.length > 0) {
        // Определяем индекс изображения для этого AI‑сообщения
        let indexStr = messageId.split('-').pop() || '0';
        let attachmentIndex = parseInt(indexStr, 10);
        if (Number.isNaN(attachmentIndex) || attachmentIndex < 0 || attachmentIndex >= attachments.length) {
          attachmentIndex = 0;
        }

        const attachment = attachments[attachmentIndex];
        const formData = new FormData();
        formData.append('image', attachment.file);

        const response = await fetch(`${API_BASE_URL}/api/remove-objects`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });

        let resultImage = null;
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (data.success && data.result) { resultImage = data.result.imageUrl; }
          } else {
            const imageBlob = await response.blob();
            const reader = new FileReader();
            resultImage = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(imageBlob);
            });
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Ошибка удаления объектов');
        }

        // Обновляем только это AI‑сообщение
        setAdvancedMessageHistory(prev => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map(msg => 
            msg.type === 'ai' && msg.messageId === messageId
              ? { ...msg, image: resultImage, text: '', isGenerating: false, time: new Date().toISOString() }
              : msg
          )
        }));
        return;
      } else {
        // Обычная обработка для других моделей
        responseText = `Вот результат обработки вашего запроса "${query}".`;
      }

      // Создаем новый результат
      const newResult = {
        messageId: userMessage.id,
        text: responseText,
        image: responseImage,
        rating: null,
        canRegenerate: true,
        time: new Date().toISOString(),
        isGenerating: false
      };
      
      // Обновляем сообщение в истории для текущего чата
      setAdvancedMessageHistory(prev => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map(msg => 
          msg.type === 'ai' && msg.messageId === messageId 
            ? { ...msg, ...newResult, type: 'ai' }
            : msg
        )
      }));

      if (regenLimit !== Infinity) {
        setRegenerationUsage(prev => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || 0) + 1
        }));
      }

    } catch (error) {
      console.error('Ошибка при повторной генерации:', error);
      // Обновляем сообщение с ошибкой
      setAdvancedMessageHistory(prev => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map(msg => 
          msg.type === 'ai' && msg.messageId === messageId 
            ? { 
                ...msg, 
                text: '',
                image: null,
                rating: null,
                canRegenerate: true,
                isGenerating: false,
                time: new Date().toISOString()
              }
            : msg
        )
      }));
    } finally {
      // Очищаем прикрепленные фотографии после завершения обработки
      clearAllAttachments();
    }
  };

  // Функция для добавления сгенерированного изображения в галерею

  const handleAdvancedDownload = async (imageUrl) => {
    try {
      console.log('Начинаем скачивание изображения:', imageUrl);
      
      // Загружаем изображение как blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Создаем URL для blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.jpg`;
      
      // Добавляем в DOM, кликаем и удаляем
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Освобождаем память
      URL.revokeObjectURL(blobUrl);
      
      console.log('Изображение успешно скачано');
    } catch (error) {
      console.error('Ошибка при скачивании изображения:', error);
      
      // Fallback: открываем изображение в новой вкладке
      console.log('Fallback: открываем изображение в новой вкладке');
      window.open(imageUrl, '_blank');
    }
  };

  // Image modal handlers
  const handleImageClick = (imageUrl, imageAlt) => {
    setImageModal({ isOpen: true, url: imageUrl, alt: imageAlt });
  };

  const handleImageModalClose = () => {
    setImageModal({ isOpen: false, url: '', alt: '' });
  };


  const settingsBtnRef = useRef(null);

  const isRemove = model === "cleanup";
  const isPlan = model === "techplan";

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
      if (!hasUnlimitedAccess) {
        if (user && (user.plansUsed ?? 0) >= 1) {
          setLimitNotice('Лимит генераций исчерпан. Обратитесь к директору за доступом «Организация».');
          return;
        }
        if (!user && guestPlanCount >= 1) {
          setLimitNotice('Гостевой лимит генераций исчерпан. Попросите доступ «Организация» у директора.');
          return;
        }
      }
    }
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user",
      model: model,
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

        const response = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          const err = new Error(errorData.error || 'Ошибка генерации технического плана');
          if (errorData.code) err.code = errorData.code;
          throw err;
        }

        // Получаем изображение как base64
        const imageBlob = await response.blob();
        const reader = new FileReader();
        responseImage = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(imageBlob);
        });
        responseText = `Технический план успешно создан в режиме "${planFurniture === "with" ? "С мебелью" : "Без мебели"}".`;

        if (!hasUnlimitedAccess) {
          if (user) {
            await refreshUser();
          } else {
            setGuestPlanCount((prev) => prev + 1);
          }
        }
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
      
      // Определяем тип ошибки для более точной обработки
      let errorMessage = error.message;
      let isCometApiError = false;
      
      if (errorMessage.includes('Сервис генерации временно недоступен') || 
          errorMessage.includes('No available channels') ||
          errorMessage.includes('comet_api_error') ||
          errorMessage.includes('503')) {
        isCometApiError = true;
        errorMessage = 'Сервис генерации временно недоступен. Попробуйте позже.';
      } else if (errorMessage.includes('API_KEY_MISSING')) {
        errorMessage = 'Сервис временно недоступен. Обратитесь к администратору.';
      }
      
      if (isPlan && (error.code === 'PLAN_LIMIT' || error.code === 'GUEST_LIMIT')) {
        setLimitNotice(error.message);
        if (error.code === 'PLAN_LIMIT') {
          await refreshUser();
        }
        if (error.code === 'GUEST_LIMIT') {
          setGuestPlanCount(1);
        }
      } else if (isPlan) {
        setLimitNotice(errorMessage);
      }
      
      setResponses(prev => ({
        ...prev,
        [msg.id]: {
          text: '',
          rating: null,
          canRegenerate: !isCometApiError // Не позволяем повторную генерацию при ошибках COMETAPI
        }
      }));
    } finally {
      setIsGenerating(false);
    }
    
    // cleanup: очищаем список, не отзывая blob-URL (они нужны для предпросмотра в истории)
    setAttachments([]);
    setValue("");
  };

  // Attachments cleanup on unmount (не отзываем blob URL сразу, чтобы не ломать предпросмотр истории)
  useEffect(() => {
    return () => {
      // намеренно ничего не делаем здесь
    };
  }, [attachments]);

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
    
    // Очищаем все состояния сообщений
    setAdvancedCurrentMessage(null);
    setAdvancedCurrentResult(null);
    setAdvancedIsGenerating(false);
    setRemoveDepth(null);
    setHasFirstMessage(false);
    setIsGenerating(false);
    setResponses({});
    setRegenerationUsage(prev => ({
      ...prev,
      [id]: 0
    }));
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
    setRegenerationUsage(prev => {
      const nextUsage = { ...prev };
      delete nextUsage[activeChatId];
      return nextUsage;
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
    setRegenerationUsage(prev => {
      const nextUsage = { ...prev };
      delete nextUsage[chatId];
      return nextUsage;
    });
  };

  const onAttachClick = () => fileInputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    // Если услуга — техплан, разрешаем только один файл
    if (isPlan) {
      const first = imgs[0];
      if (first) {
        const item = {
          id: `${first.name}-${first.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: first.name,
          size: first.size,
          url: URL.createObjectURL(first),
          file: first,
        };
        setAttachments([item]);
      }
    } else {
      const items = imgs.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
      }));
      if (items.length) setAttachments((prev) => [...prev, ...items]);
    }
    e.target.value = ""; // allow re-upload same file
  };
  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item && item.url && item.url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(item.url);
        } catch (error) {
          console.warn('Ошибка при освобождении blob URL:', error);
        }
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const clearAllAttachments = () => {
    // Не отзывает blob URL, чтобы не ломать предпросмотр вложений в истории сообщений
    setAttachments([]);
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
    const regenLimit = hasUnlimitedAccess ? Infinity : 3;
    const currentRegenCount = regenerationUsage[activeChatId] || 0;
    if (regenLimit !== Infinity && currentRegenCount >= regenLimit) {
      setLimitNotice('Лимит повторов достигнут. Обратитесь к директору за доступом «Организация».');
      return;
    }

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

      if (regenLimit !== Infinity) {
        setRegenerationUsage(prev => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || 0) + 1
        }));
      }
    }, 2000);
  };

  // Функция для форматирования даты
  const formatChatDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };
  
  // Функция для автоматического переименования чата
  const autoRenameChat = (chatId, model, techplanMode = null) => {
    let newTitle = "Новый чат";
    const dateStr = formatChatDate();
    
    switch (model) {
      case "techplan":
        newTitle = `Создание плана ${dateStr}`;
        break;
      case "cleanup":
        newTitle = `Удаление объектов ${dateStr}`;
        break;
      default:
        newTitle = "Новый чат";
    }
    
    // Обновляем название чата только если оно еще "Новый чат"
    setChats(prev => prev.map(chat => 
      chat.id === chatId && chat.title === "Новый чат"
        ? { ...chat, title: newTitle }
        : chat
    ));
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  const handleCreateNewChat = () => {
    createChat();
  };
  
  const handleRenameChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    const currentTitle = chat?.title || 'Новый чат';
    
    if (userSettings.skipRenameConfirmation) {
      // Если пользователь отключил подтверждения, сразу показываем модальное окно переименования
      setRenameModal({
        isOpen: true,
        chatId: chatId,
        currentTitle: currentTitle,
        showRememberOption: false
      });
    } else {
      // Показываем модальное окно переименования с опцией "Больше не спрашивать"
      setRenameModal({
        isOpen: true,
        chatId: chatId,
        currentTitle: currentTitle,
        showRememberOption: true
      });
    }
  };
  
  const handleDeleteChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    const chatTitle = chat?.title || 'Новый чат';
    
    if (userSettings.skipDeleteConfirmation) {
      // Если пользователь отключил подтверждения, сразу удаляем
      setChats(chats.filter(c => c.id !== chatId));
      
      // Удаляем историю сообщений для этого чата
      setAdvancedMessageHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[chatId];
        return newHistory;
      });
      
      if (activeChatId === chatId && chats.length > 1) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats[0]?.id || null);
      }
      
      // Очищаем текущие сообщения при удалении чата
      setAdvancedCurrentMessage(null);
      setAdvancedCurrentResult(null);
    } else {
      // Показываем модальное окно подтверждения
      setConfirmationModal({
        isOpen: true,
        title: 'Удалить чат',
        message: `Вы уверены, что хотите удалить чат "${chatTitle}"? Это действие нельзя отменить.`,
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        showRememberOption: true,
        onConfirm: (rememberChoice) => {
          setChats(chats.filter(c => c.id !== chatId));
          
          // Удаляем историю сообщений для этого чата
          setAdvancedMessageHistory(prev => {
            const newHistory = { ...prev };
            delete newHistory[chatId];
            return newHistory;
          });
          
          if (activeChatId === chatId && chats.length > 1) {
            const remainingChats = chats.filter(c => c.id !== chatId);
            setActiveChatId(remainingChats[0]?.id || null);
          }
          
          // Очищаем текущие сообщения при удалении чата
          setAdvancedCurrentMessage(null);
          setAdvancedCurrentResult(null);
          
          if (rememberChoice) {
            updateUserSettings({ skipDeleteConfirmation: true });
          }
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        },
        onClose: () => {
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };
  
  const handlePinChat = (chatId) => {
    setChats(chats.map(c => 
      c.id === chatId ? { ...c, pinned: !c.pinned } : c
    ));
  };
  
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Выход из учетной записи',
      message: 'Вы уверены, что хотите выйти из своей учетной записи? Все несохраненные данные будут потеряны.',
      confirmText: 'Выйти',
      cancelText: 'Отмена',
      onConfirm: () => {
        logout();
        navigate('/');
        setConfirmModal({
          isOpen: false,
          type: 'danger',
          title: '',
          message: '',
          confirmText: 'Подтвердить',
          cancelText: 'Отмена',
          onConfirm: null
        });
      }
    });
  };
  
  const handleProfile = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsProfileOpen(true);
    }
  };

  const handleGrantOrganizationAccess = async (username) => {
    const result = await grantOrganizationAccess(username);
    if (result?.success) {
      await refreshUser();
    }
    return result;
  };

  const handleOpenOrganizationList = async () => {
    setOrganizationModal({ isOpen: true, loading: true, users: [], error: '' });
    const list = await fetchOrganizationUsers();
    if (list) {
      setOrganizationModal({ isOpen: true, loading: false, users: list, error: '' });
    } else {
      setOrganizationModal({ isOpen: true, loading: false, users: [], error: 'Не удалось получить список пользователей.' });
    }
  };

  const handleCloseOrganizationModal = () => {
    setOrganizationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Gallery functions
  // Advanced style layout (единственный доступный стиль)
    return (
      <div data-style={siteStyle} className="relative h-screen w-full text-neutral-200 antialiased" style={{ backgroundColor: '#161618' }}>
        {backgroundType === "standard" && null /* Стандартный фон - только цвет, без частиц */}
        {backgroundType === "interactive" && <BackgroundParticles />}
        {backgroundType === "alternative" && <AlternativeBackground />}
        <div className={`relative z-10 grid h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'grid-cols-[56px_1fr]' : 'grid-cols-[256px_1fr]'
        }`}>
          <AdvancedSidebar 
            chats={filteredChats}
            activeChatId={activeChatId}
            onChatSelect={(chatId) => {
              setActiveChatId(chatId);
              setHasFirstMessage(chats.find(c => c.id === chatId)?.messages.length > 0);
              setIsGenerating(false);
              setResponses({});
              
              // Очищаем все состояния сообщений при переключении чатов
              setAdvancedCurrentMessage(null);
              setAdvancedCurrentResult(null);
              setAdvancedIsGenerating(false);
            }}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isCollapsed={isSidebarCollapsed}
            searchResults={searchResults}
            onSettingSelect={handleSettingSelect}
            onCreateChat={handleCreateNewChat}
            onHomeClick={handleHomeClick}
            user={user}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onPinChat={handlePinChat}
            onChangelog={() => setIsChangelogOpen(true)}
            onProfile={handleProfile}
            backgroundType={backgroundType}
            onBackgroundChange={setBackgroundType}
            onLogout={handleLogout}
            onAuthOpen={() => setIsAuthOpen(true)}
            advancedMessageHistory={advancedMessageHistory}
          />
          <AdvancedMainArea 
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
            onFilesSelected={onFilesSelected}
            onSendMessage={handleAdvancedSendMessage}
            isGenerating={advancedIsGenerating}
            currentMessage={advancedCurrentMessage}
            currentResult={advancedCurrentResult}
            messageHistory={advancedMessageHistory[activeChatId] || []}
            onRate={handleAdvancedRate}
            onRegenerate={handleAdvancedRegenerate}
            onDownload={handleAdvancedDownload}
            onImageClick={handleImageClick}
            onModelChange={setModel}
            model={model}
            onModelSelect={setModel}
            service={service}
            onServiceChange={(newService) => {
              setService(newService);
              // Установим модель по умолчанию для выбранной услуги
              const defaultModel = newService === 'techplan' ? 'boston' : 'charleston';
              setSelectedModel(defaultModel);
              setModel(newService); // Для совместимости
            }}
            showServiceMenu={showServiceMenu}
            onServiceMenuToggle={setShowServiceMenu}
            selectedModel={selectedModel}
            onSelectedModelChange={setSelectedModel}
          />
          {limitNotice && (
            <div className="mx-auto max-w-3xl w-full px-4 mb-4">
              <div className="rounded-md border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-xs text-yellow-200">
                {limitNotice}
              </div>
            </div>
          )}
        </div>
        
        {/* Image Modal */}
        <ImageModal
          isOpen={imageModal.isOpen}
          imageUrl={imageModal.url}
          imageAlt={imageModal.alt}
          onClose={handleImageModalClose}
        />
        
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
          onConfirm={confirmationModal.onConfirm}
          onClose={confirmationModal.onClose}
          showRememberOption={confirmationModal.showRememberOption}
        />
        
        {/* Rename Chat Modal */}
        <RenameChatModal
          isOpen={renameModal.isOpen}
          onClose={handleRenameCancel}
          onConfirm={handleRenameConfirm}
          currentTitle={renameModal.currentTitle}
          showRememberOption={renameModal.showRememberOption}
        />
        
        {/* Feature Modals */}
        <ChangelogModal 
          isOpen={isChangelogOpen} 
          onClose={() => setIsChangelogOpen(false)} 
        />
        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onGrantAccess={handleGrantOrganizationAccess}
          onOpenOrganizationList={handleOpenOrganizationList}
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)}
        />
        <OrganizationUsersModal
          isOpen={organizationModal.isOpen}
          onClose={handleCloseOrganizationModal}
          users={organizationModal.users}
          isLoading={organizationModal.loading}
          error={organizationModal.error}
        />
        
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type}
        />
    </div>
  );
}

export default MonochromeClaudeStyle;


