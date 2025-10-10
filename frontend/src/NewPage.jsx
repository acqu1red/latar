import React, { useState, useRef, useEffect } from "react";

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
  ThumbsUp,
  ThumbsDown,
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
import { API_BASE_URL } from './config';
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
        className="relative w-full max-w-md mx-4 bg-[#161618] border border-white/10 rounded-2xl p-6 shadow-2xl"
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
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${getButtonStyle()}`}
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
        className="relative w-full max-w-md mx-4 bg-[#161618] border border-white/10 rounded-2xl p-6 shadow-2xl"
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
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
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
              className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors rounded-lg"
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
const MODEL_OPTIONS = [
  { id: "cleanup", label: "Удаление объектов", description: "Удаляет ненужные объекты с плана", Icon: Trash2 },
  { id: "techplan", label: "Создание по техплану", description: "Создает технический план помещения", Icon: FileText },
  { id: "3d", label: "3D план", description: "Создает 3D визуализацию плана", Icon: Box },
];

// === Site styles ===
const STYLE_OPTIONS = [
  { id: "advanced", label: "Продвинутый" },
];

// === Advanced Style Components ===

// Модальное окно "3D режим" - Премиум дизайн
function ThreeDModeModal({ isOpen, onClose, onActivate }) {
  if (!isOpen) return null;

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
        className="relative w-full max-w-lg overflow-hidden bg-black border border-white/20 rounded-2xl shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent p-6">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-white/10 rounded-xl border border-white/20"
            >
              <Layers className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Plan AI 3D
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Превратите 2D планы в 3D визуализацию
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative p-6">
          {/* Visual showcase */}
          <div className="mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/10">
            <svg className="w-full h-32" viewBox="0 0 400 200" fill="none">
              {/* 2D to 3D transformation visualization */}
              <g opacity="0.3">
                <rect x="20" y="60" width="150" height="100" rx="8" stroke="white" strokeWidth="2" fill="white" fillOpacity="0.05"/>
                <line x1="40" y1="80" x2="150" y2="80" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="100" x2="150" y2="100" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="120" x2="150" y2="120" stroke="white" strokeWidth="1"/>
              </g>
              
              <motion.g
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <path d="M 190 100 L 210 100" stroke="white" strokeWidth="2" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" from="0" to="8" dur="0.5s" repeatCount="indefinite"/>
                </path>
                <path d="M 205 95 L 210 100 L 205 105" stroke="white" strokeWidth="2" fill="none"/>
              </motion.g>
              
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <path d="M 230 100 L 300 60 L 370 100 L 370 160 L 300 200 L 230 160 Z" stroke="white" strokeWidth="2" fill="white" fillOpacity="0.1"/>
                <path d="M 230 100 L 230 160" stroke="white" strokeWidth="2"/>
                <path d="M 300 60 L 300 120" stroke="white" strokeWidth="2"/>
                <path d="M 370 100 L 370 160" stroke="white" strokeWidth="2"/>
                <path d="M 230 160 L 300 200" stroke="white" strokeWidth="2"/>
                <path d="M 300 200 L 370 160" stroke="white" strokeWidth="2"/>
                <circle cx="300" cy="120" r="4" fill="white">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                </circle>
              </motion.g>
            </svg>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="p-1.5 bg-white/10 rounded-md">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1 text-sm">Автоматическая 3D генерация</h4>
                <p className="text-neutral-400 text-xs">Превращайте 2D планы в объемные 3D модели одним кликом</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="p-1.5 bg-white/10 rounded-md">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1 text-sm">Интерьерная визуализация</h4>
                <p className="text-neutral-400 text-xs">Добавляйте мебель, текстуры и освещение для реалистичности</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="p-1.5 bg-white/10 rounded-md">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1 text-sm">Экспорт и презентация</h4>
                <p className="text-neutral-400 text-xs">Сохраняйте в различных форматах для презентаций клиентам</p>
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onClose();
                onActivate();
              }}
              className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Активировать 3D режим</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all border border-white/20 text-sm"
            >
              Позже
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Модальное окно "Как это работает" - Премиум дизайн
function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const features = [
    {
      icon: MessageSquare,
      title: "Умные чаты",
      description: "Создавайте неограниченное количество чатов для различных задач. Каждый чат сохраняет контекст разговора и может быть переименован, закреплен или удален.",
      visual: (
        <svg className="w-full h-32" viewBox="0 0 200 100" fill="none">
          <rect x="10" y="20" width="60" height="8" rx="4" fill="white" opacity="0.2"/>
          <rect x="10" y="35" width="80" height="8" rx="4" fill="white" opacity="0.3"/>
          <rect x="10" y="50" width="50" height="8" rx="4" fill="white" opacity="0.2"/>
          <rect x="130" y="25" width="60" height="8" rx="4" fill="white" opacity="0.9"/>
          <rect x="110" y="40" width="80" height="8" rx="4" fill="white" opacity="0.8"/>
          <circle cx="25" cy="24" r="6" fill="white" opacity="0.6"/>
          <circle cx="175" cy="29" r="6" fill="white"/>
        </svg>
      )
    },
    {
      icon: Layers,
      title: "Модели обработки",
      description: "Выбирайте подходящую модель для вашей задачи: удаление объектов с изображений, создание по техническому плану или использование AI конструктора.",
      visual: (
        <svg className="w-full h-32" viewBox="0 0 200 100" fill="none">
          <rect x="30" y="20" width="50" height="60" rx="4" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" strokeOpacity="0.3"/>
          <rect x="60" y="30" width="50" height="60" rx="4" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
          <rect x="90" y="40" width="50" height="60" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1" strokeOpacity="0.8"/>
        </svg>
      )
    },
    {
      icon: Paperclip,
      title: "Загрузка файлов",
      description: "Прикрепляйте изображения, документы и другие файлы к вашим сообщениям. Система автоматически анализирует содержимое.",
      visual: (
        <svg className="w-full h-32" viewBox="0 0 200 100" fill="none">
          <rect x="40" y="25" width="40" height="50" rx="4" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
          <rect x="90" y="25" width="40" height="50" rx="4" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.6"/>
          <rect x="140" y="25" width="40" height="50" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeOpacity="0.9"/>
          <path d="M 100 20 L 110 10 L 120 20" stroke="white" strokeWidth="2" opacity="0.7" fill="none"/>
        </svg>
      )
    },
    {
      icon: Palette,
      title: "Фоновые эффекты",
      description: "Переключайтесь между интерактивным и альтернативным фоном для создания комфортной рабочей среды.",
      visual: (
        <svg className="w-full h-32" viewBox="0 0 200 100" fill="none">
          <circle cx="50" cy="50" r="4" fill="white" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="100" cy="30" r="3" fill="white" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="150" cy="60" r="5" fill="white" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="75" cy="70" r="3" fill="white" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="130" cy="40" r="4" fill="white" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </svg>
      )
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
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-black border border-white/20 rounded-3xl shadow-2xl" 
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
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Как это работает
            </h2>
          </div>
          <p className="text-neutral-400 text-lg ml-16">
            Откройте для себя возможности платформы
          </p>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5"
              >
                {/* Visual */}
                <div className="mb-6 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                  {feature.visual}
                </div>
                
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white flex-1">
                    {feature.title}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
function ProfileModal({ isOpen, onClose, user, backgroundType, onBackgroundChange, on3DInfoOpen, onGrantAccess, onOpenOrganizationList }) {
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
          <div className="rounded-lg border border-white/5 bg-white/3 px-3 py-3 space-y-2.5">
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
      
      {/* Plan AI 3D кнопка */}
      <div className="flex justify-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-4 py-3 backdrop-blur-lg shadow-2xl overflow-hidden"
        >
          {/* Звездные частицы на фоне */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white" />
              Plan AI 3D
            </div>
            <div className="text-xs text-neutral-400">Попробуй расширенные возможности</div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={on3DInfoOpen}
            className="relative z-10 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Скоро
          </motion.button>
        </motion.div>
      </div>
    </div>
  );

  const AppearanceTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'interactive', label: 'Интерактивный', icon: '✨' },
          { id: 'alternative', label: 'Альтернативный', icon: '🎨' }
        ].map((backgroundType) => (
          <button
            key={backgroundType.id}
            onClick={() => onBackgroundChange(backgroundType.id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 px-3 py-4 text-xs transition ${
              backgroundType === backgroundType.id
                ? 'border-white/40 text-white'
                : 'border-white/10 text-neutral-300 hover:border-white/20'
            }`}
          >
            <div className="relative flex h-10 w-14 items-center justify-center rounded-lg overflow-hidden">
              {backgroundType.id === 'standard' && (
                <div className="absolute inset-0 bg-[#161618]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[8px] text-neutral-500">Фон</div>
                  </div>
                </div>
              )}
              {backgroundType.id === 'interactive' && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
                  <div className="absolute inset-0 bg-black/20"></div>
                  {/* Интерактивные частицы */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/40 rounded-full"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                      }}
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
              )}
              {backgroundType.id === 'alternative' && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900">
                  <div className="absolute inset-0 bg-black/20"></div>
                  {/* Альтернативные частицы */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-300/50 rounded-full"
                      style={{
                        left: `${15 + i * 25}%`,
                        top: `${25 + i * 15}%`,
                      }}
                      animate={{
                        opacity: [0.2, 0.7, 0.2],
                        scale: [0.3, 1.2, 0.3],
                      }}
                      transition={{
                        duration: 3 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </div>
              )}
              <span className="relative z-10 text-white text-lg">{backgroundType.icon}</span>
            </div>
            {backgroundType.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Row icon={Eye} left="Показывать предпросмотр разговоров в истории" right={<Toggle value={showPreview} onChange={setShowPreview} />} />
      </div>
    </div>
  );

  const BehaviorTab = () => (
    <div className="space-y-2">
      <Row icon={ArrowUp} left="Включить автопрокрутку" right={<Toggle value={autoScroll} onChange={setAutoScroll} />} />
      <Row icon={Sparkles} left="Показывать предложения для продолжения" right={<Toggle value={showSuggestions} onChange={setShowSuggestions} />} />
      <Row icon={Bell} left="Получать уведомление, когда Plan AI заканчивает размышлять" right={<Toggle value={notifications} onChange={setNotifications} />} />
      <Row icon={Bell} left="Уведомления при действиях" right={<Toggle value={userSettings.showActionNotifications} onChange={(value) => updateUserSettings({ showActionNotifications: value })} />} />
    </div>
  );

  const DataTab = () => (
    <div className="space-y-4">
      <Row icon={Sparkles} left="Улучшить модель" right={<Toggle value={allowHistory} onChange={setAllowHistory} />} />
      {user && (
        <div className="rounded-lg border border-white/10 px-4 py-3 space-y-2 bg-black/20">
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
      <div className="rounded-lg border border-white/10 px-4 py-3">
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
        className="relative flex overflow-hidden rounded-lg border border-white/5 bg-[#161618] shadow-2xl"
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
  const [mode, setMode] = useState('register'); // 'register' или 'login'
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
          setError('Неверный псевдоним или пароль');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[360px] mx-auto overflow-hidden bg-black border border-white/20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent px-5 py-4">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Запустить Plan AI' : 'Вход в систему'}
          </h2>
          <p className="text-neutral-400 text-xs mt-1">
            {mode === 'register' 
              ? 'Начнем работу с Вашей организацией по созданию планировок с AI' 
              : 'Войдите в свой аккаунт для доступа к функциям'}
          </p>
        </div>
        
        {/* Content */}
        <div className="px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-neutral-400 block mb-2">
                  Название организации
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                  placeholder="Как называется Ваша организация?"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm text-neutral-400 block mb-2">
                Псевдоним {mode === 'register' ? 'для входа' : ''}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                placeholder="username"
              />
            </div>
            
            <div>
              <label className="text-sm text-neutral-400 block mb-2">
                Пароль {mode === 'register' ? 'для входа' : ''}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">
                    Telegram для связи
                  </label>
                  <input
                    type="text"
                    required
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                    placeholder="@example"
                  />
                </div>
              </>
            )}
            
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-600 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-all shadow-lg shadow-white/10"
            >
              {loading 
                ? (mode === 'register' ? 'Запуск...' : 'Вход...') 
                : (mode === 'register' ? 'Запустить Plan AI' : 'Войти')}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              {mode === 'register' ? 'Уже работаете с нами?' : 'Нет аккаунта?'}{' '}
              <button 
                onClick={() => {
                  setMode(mode === 'register' ? 'login' : 'register');
                  setError('');
                }}
                className="text-white hover:underline transition"
              >
                {mode === 'register' ? 'Войти в систему' : 'Зарегистрироваться'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Модальное окно "Список изменений" - Премиум дизайн
function Plan3DInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-[#0b0b0e] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Plan AI 3D</h2>
              <p className="text-sm text-neutral-400">Скоро в разработке</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">Как это будет работать</h3>
            <p className="text-neutral-400 text-sm">
              Мы создаем революционную систему преобразования 2D планов в 3D пространство
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <h4 className="font-medium text-white">1. Загрузка техплана</h4>
              </div>
              <p className="text-sm text-neutral-400">
                Загружаете фотографию техплана или план помещения
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-green-400" />
                </div>
                <h4 className="font-medium text-white">2. Векторизация</h4>
              </div>
              <p className="text-sm text-neutral-400">
                ИИ автоматически распознает стены, двери, окна и создает векторную модель
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-purple-400" />
                </div>
                <h4 className="font-medium text-white">3. 3D преобразование</h4>
              </div>
              <p className="text-sm text-neutral-400">
                Преобразуем 2D план в полноценное 3D пространство с правильными пропорциями
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                </div>
                <h4 className="font-medium text-white">4. Расстановка объектов</h4>
              </div>
              <p className="text-sm text-neutral-400">
                Автоматически расставляем мебель и объекты в 3D пространстве
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h4 className="font-medium text-white">Результат</h4>
            </div>
            <p className="text-sm text-neutral-300">
              Полноценная 3D модель вашего помещения с возможностью виртуального тура, 
              изменения планировки и подбора мебели в реальном времени
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizationUsersModal({ isOpen, onClose, users = [], isLoading = false, error = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Пользователи с префиксом «Организация»</h3>
            <p className="text-xs text-neutral-400 mt-1">Доступ без ограничений активирован</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
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
              <div className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-300">
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
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
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
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
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
                  <div className={`absolute left-0 top-0 size-14 rounded-2xl border-2 border-white/20 grid place-items-center font-bold ${
                    release.type === 'major' 
                      ? 'bg-gradient-to-br from-white to-neutral-300 text-black' 
                      : 'bg-black text-white border-white/40'
                  }`}>
                    {release.version.split('.')[0]}.{release.version.split('.')[1]}
                  </div>
                  
                  {/* Content */}
                  <div className="group bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">
                            {release.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
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
                          className="flex items-start gap-3 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all"
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
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
  onShowGallery,
  onHomeClick,
  onHowItWorks,
  user,
  onRenameChat,
  onDeleteChat,
  onPinChat,
  onChangelog,
  onProfile,
  onLogout,
  onAuthOpen
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeChatMenu, setActiveChatMenu] = useState(null);
  
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

  const chatGroups = groupChatsByDate(chats);
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                     'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  if (isCollapsed) {
  return (
      <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm w-12">
        <div className="p-2">
          <div className="w-full h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
        </div>
        <nav className="px-1.5 text-xs flex-1 space-y-1.5">
          <button 
            onClick={onCreateChat}
            className="w-full h-8 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Новый чат"
          >
            <Plus className="h-3 w-3 text-neutral-400" />
          </button>
          <button 
            onClick={onShowGallery}
            className="w-full h-8 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Создано"
          >
            <Images className="h-3 w-3 text-neutral-400" />
          </button>
          <button 
            onClick={onHomeClick}
            className="w-full h-8 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="На главную"
          >
            <Home className="h-3 w-3 text-neutral-400" />
          </button>
          <button 
            onClick={onHowItWorks}
            className="w-full h-8 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Как это работает"
          >
            <HelpCircle className="h-4 w-4 text-neutral-400" />
          </button>
        </nav>
        <div className="p-3 flex flex-col items-center gap-2">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="size-9 rounded-full grid place-items-center text-xs font-semibold hover:scale-105 transition bg-black border border-white/30 text-white"
            title={user ? 'Профиль' : 'Аноним'}
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </button>
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
    <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm w-72 relative">
      {/* Top: search */}
      <div className="p-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 ring-1 ring-white/10 hover:ring-white/20 transition">
          <Search className="h-3 w-3 text-neutral-400" />
          <input
            placeholder="Поиск"
            className="bg-transparent placeholder:text-neutral-500 text-sm outline-none w-full"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Nav */}
       <nav className="px-1.5 text-sm flex-1 overflow-y-auto custom-scrollbar">
        <AdvancedSectionTitle>Главное</AdvancedSectionTitle>
        <AdvancedNavItem onClick={onCreateChat} Icon={Plus} label="Новый чат" />
        <AdvancedNavItem onClick={onShowGallery} Icon={Images} label="Создано" />
        <AdvancedNavItem onClick={onHomeClick} Icon={Home} label="Вернуться на главную" />
        <AdvancedNavItem onClick={onHowItWorks} Icon={HelpCircle} label="Как это работает" />
        
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

      <div className="mt-auto px-3 py-3 border-t border-white/5 relative">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition flex-1"
          >
            <div className="size-8 rounded-full grid place-items-center text-sm font-semibold bg-black border border-white/30 text-white">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-white truncate">{user?.name || 'Аноним'}</div>
              <div className="text-xs text-neutral-500 truncate">{user?.username || ''}</div>
            </div>
          </button>
          <button 
            onClick={onCollapse}
            className="text-neutral-500 hover:text-neutral-300 transition p-2" 
            title="Свернуть панель"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        
        {/* User menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
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
                  onClick={() => { onChangelog(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                >
                  <FileText className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-white">Список изменений</span>
                </button>
                <div className="border-t border-white/5"></div>
                <button 
                  onClick={() => { onAuthOpen(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                >
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-white">Войти / Регистрация</span>
                </button>
              </>
            )}
          </div>
        )}
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
          className="absolute bg-neutral-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[160px]"
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
  backgroundType, 
  onBackgroundChange, 
  onAttach, 
  attachments = [], 
  modelMenuOpen, 
  onModelMenuToggle, 
  onFilesSelected,
  onSendMessage,
  onSendFromGallery,
  isGenerating = false,
  currentMessage = null,
  currentResult = null,
  messageHistory = [],
  onRate,
  onRegenerate,
  onDownload,
  onImageClick,
  onModelChange,
  showGallery = false,
  setShowGallery,
  galleryImages = [],
  selectedGalleryImage,
  setSelectedGalleryImage,
  galleryModelFilter,
  setGalleryModelFilter,
  onGalleryDelete,
  onGalleryDownload,
  model,
  onModelSelect,
  on3DInfoOpen
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPromoCard, setShowPromoCard] = useState(true);
  const [hasMessage, setHasMessage] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [modelTo3D, setModelTo3D] = useState(null);

  // Показываем сообщения, если есть активное сообщение, результат, история или идет генерация
  const showMessages = currentMessage || currentResult || messageHistory.length > 0 || isGenerating;

  // Обработчик активации 3D режима
  const handle3DActivation = () => {
    // Открываем модальное окно Plan AI 3D
    on3DInfoOpen && on3DInfoOpen();
  };

  // Обработчик открытия 3D модального окна
  const handleOpen3DModal = () => {
    // Открываем модальное окно Plan AI 3D
    on3DInfoOpen && on3DInfoOpen();
  };

  // Сбрасываем modelTo3D после установки
  useEffect(() => {
    if (modelTo3D) {
      const timer = setTimeout(() => {
        setModelTo3D(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modelTo3D]);

  // Gallery component
  const GalleryContent = () => {
    const filteredImages = galleryModelFilter === 'all' 
      ? galleryImages 
      : galleryImages.filter(img => img.model === galleryModelFilter);

    return (
      <div className="flex-1 flex flex-col">
        {/* Gallery Header */}
        <div className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-white">Создано</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">
                  {filteredImages.length} изображений
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Filter Bar */}
            <div className="mb-8 flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => {
                    const filters = ['all', 'techplan', 'cleanup'];
                    const currentIndex = filters.indexOf(galleryModelFilter);
                    const nextIndex = (currentIndex + 1) % filters.length;
                    setGalleryModelFilter(filters[nextIndex]);
                  }}
                  className="flex items-center gap-2 rounded-full px-4 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <span className="text-sm">
                    {galleryModelFilter === 'all' ? 'Все модели' : 
                     galleryModelFilter === 'techplan' ? 'Создание по техплану' :
                     galleryModelFilter === 'cleanup' ? 'Удаление объектов' : 'Все модели'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20 cursor-pointer"
                    onClick={() => setSelectedGalleryImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-sm text-white line-clamp-2 mb-2">{image.prompt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-400">{image.model}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGalleryDownload(image.url, image.id);
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                              title="Скачать"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGalleryDelete(image.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition"
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-neutral-400 mb-2">Нет изображений для выбранной модели</p>
                <button
                  onClick={() => setGalleryModelFilter('all')}
                  className="text-sm text-white/70 hover:text-white underline"
                >
                  Показать все
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedGalleryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute -top-12 right-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image */}
              <div className="rounded-xl overflow-hidden border border-white/20">
                <img
                  src={selectedGalleryImage.url}
                  alt={selectedGalleryImage.prompt}
                  className="w-full h-auto"
                />
              </div>

              {/* Info */}
              <div className="mt-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-6">
                <p className="text-white mb-3">{selectedGalleryImage.prompt}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Модель: {selectedGalleryImage.model}</span>
                  <span className="text-neutral-400">
                    {new Date(selectedGalleryImage.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => onGalleryDownload(selectedGalleryImage.url, selectedGalleryImage.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Скачать</span>
                  </button>
                  <button
                    onClick={() => onGalleryDelete(selectedGalleryImage.id)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 px-4 py-2 transition"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">Удалить</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
      </div>
    );
  };

  return (
    <main className="relative flex flex-col h-screen">
      {/* Gallery View */}
      {showGallery ? (
        <GalleryContent />
      ) : (
        <>
          {/* Сообщения в верхней части */}
          {showMessages && (
        <div className="flex-1 pt-16 overflow-y-auto custom-scrollbar">
          {/* История сообщений */}
          {messageHistory.length > 0 && (
            <div className="space-y-4 px-6 py-4">
              {messageHistory.map((msg, index) => (
                <div key={`${msg.id || msg.messageId}-${index}`} className="max-w-3xl mx-auto">
                  {msg.type === 'user' ? (
                    <AdvancedMessageDisplay
                      isGenerating={false}
                      message={msg}
                      result={null}
                      onRate={onRate}
                      onRegenerate={onRegenerate}
                      onDownload={onDownload}
                      onImageClick={onImageClick}
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
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Текущее сообщение */}
          {(currentMessage || currentResult || isGenerating) && (
            <AdvancedMessageDisplay
              isGenerating={isGenerating}
              message={currentMessage}
              result={currentResult}
              onRate={onRate}
              onRegenerate={onRegenerate}
              onDownload={onDownload}
              onImageClick={onImageClick}
            />
          )}
        </div>
      )}

      {/* Логотип и панель - в центре до первого сообщения */}
      {!showMessages && (
        <div className="flex-1 flex flex-col items-center justify-center">
        <AdvancedLogoMark />
          
          <div className="mx-auto max-w-3xl px-6 w-full mt-8">
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
                setModelFromOutside={modelTo3D}
                additionalButtons={null}
                model={model}
                onModelSelect={onModelSelect}
                on3DInfoOpen={on3DInfoOpen}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
              className="mt-6 w-full flex justify-center"
        >
              {showAdvanced && !showMessages ? (
            <AdvancedAdvancedRow 
              backgroundType={backgroundType}
              onBackgroundChange={onBackgroundChange}
              modelMenuOpen={modelMenuOpen}
              onModelMenuToggle={onModelMenuToggle}
                  openUpward={showMessages}
            />
              ) : showPromoCard && !showMessages ? (
            <AdvancedPromoCard 
              onClose={() => {
                setShowPromoCard(false);
                setShowAdvanced(true);
              }}
              on3DClick={handleOpen3DModal}
            />
          ) : null}
        </motion.div>
      </div>
        </div>
      )}

      {/* Панель с выбором модели - внизу после первого сообщения */}
      {showMessages && (
        <div className="mx-auto max-w-3xl px-6 w-full mt-auto pb-3">
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
              setModelFromOutside={modelTo3D}
              additionalButtons={null}
              backgroundType={backgroundType}
              onBackgroundChange={onBackgroundChange}
              model={model}
              onModelSelect={onModelSelect}
              on3DInfoOpen={on3DInfoOpen}
            />
          </motion.div>
        </div>
      )}

      <AdvancedSuperBanner 
        showMessages={showMessages}
        onUpgradeClick={handleOpen3DModal}
      />

      {/* 3D Mode Modal */}
      <ThreeDModeModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        onActivate={handle3DActivation}
      />
        </>
      )}
    </main>
  );
}


 function AdvancedLogoMark() {
   return (
       <div className="group flex flex-col items-center justify-center gap-2 select-none cursor-pointer">
        <div className="flex items-center justify-center gap-2">
          {/* Plan AI logo - Ultimate Monochrome Luxury */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 400 400" 
            xmlns="http://www.w3.org/2000/svg" 
            aria-label="Plan AI logo"
            className="transition-all duration-700 group-hover:scale-[1.08] translate-y-1"
            style={{ filter: 'drop-shadow(0 0 25px rgba(255,255,255,0.15))' }}
          >
        <defs>
            {/* Ultra-premium gradients */}
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1">
                <animate attributeName="stop-opacity" values="1;0.88;1" dur="4.5s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#e8e8e8" stopOpacity="0.75">
                <animate attributeName="stop-opacity" values="0.75;0.55;0.75" dur="4.5s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
            
            <linearGradient id="secondaryGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92">
                <animate attributeName="stop-opacity" values="0.92;0.78;0.92" dur="4.5s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#d0d0d0" stopOpacity="0.58">
                <animate attributeName="stop-opacity" values="0.58;0.42;0.58" dur="4.5s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
            
            <linearGradient id="accentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96">
                <animate attributeName="stop-opacity" values="0.96;0.82;0.96" dur="4.5s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#f0f0f0" stopOpacity="0.65">
                <animate attributeName="stop-opacity" values="0.65;0.48;0.65" dur="4.5s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
            
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95">
                <animate attributeName="stop-opacity" values="0.95;0.7;0.95" dur="3s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#e0e0e0" stopOpacity="0.4">
                <animate attributeName="stop-opacity" values="0.4;0.2;0.4" dur="3s" repeatCount="indefinite"/>
              </stop>
          </radialGradient>
            
            {/* Elite glow filters */}
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feFlood floodColor="#ffffff" floodOpacity="0.35"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="7" result="blur"/>
              <feFlood floodColor="#ffffff" floodOpacity="0.55"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
        </defs>
          
          {/* Outer orbital ring - elegant rotation */}
          <g className="transition-all duration-1000 ease-out origin-center group-hover:scale-[1.18]">
            <circle 
              cx="200" 
              cy="200" 
              r="165" 
              fill="none" 
              stroke="url(#primaryGrad)" 
              strokeWidth="1.8"
              opacity="0.35"
              className="transition-all duration-1000 group-hover:opacity-60"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 200 200;360 200 200"
                dur="45s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          
          {/* Middle precision ring */}
          <g className="transition-all duration-1000 ease-out origin-center group-hover:scale-[1.14]">
            <circle 
              cx="200" 
              cy="200" 
              r="135" 
              fill="none" 
              stroke="url(#secondaryGrad)" 
              strokeWidth="1.2"
              opacity="0.45"
              strokeDasharray="10 6"
              className="transition-all duration-1000 group-hover:opacity-75"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="360 200 200;0 200 200"
                dur="38s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          
          {/* Core structure - 8 segments explode outward */}
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[-18px] group-hover:translate-y-[-18px]">
            <path 
              d="M 200 200 L 200 95 A 105 105 0 0 1 274.25 125.75 Z" 
              fill="url(#primaryGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[18px] group-hover:translate-y-[-18px]">
            <path 
              d="M 200 200 L 274.25 125.75 A 105 105 0 0 1 305 200 Z" 
              fill="url(#secondaryGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[18px] group-hover:translate-y-[18px]">
            <path 
              d="M 200 200 L 305 200 A 105 105 0 0 1 274.25 274.25 Z" 
              fill="url(#accentGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[18px] group-hover:translate-y-[18px]">
            <path 
              d="M 200 200 L 274.25 274.25 A 105 105 0 0 1 200 305 Z" 
              fill="url(#primaryGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[-18px] group-hover:translate-y-[18px]">
            <path 
              d="M 200 200 L 200 305 A 105 105 0 0 1 125.75 274.25 Z" 
              fill="url(#secondaryGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[-18px] group-hover:translate-y-[18px]">
            <path 
              d="M 200 200 L 125.75 274.25 A 105 105 0 0 1 95 200 Z" 
              fill="url(#accentGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[-18px] group-hover:translate-y-[-18px]">
            <path 
              d="M 200 200 L 95 200 A 105 105 0 0 1 125.75 125.75 Z" 
              fill="url(#primaryGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[-18px] group-hover:translate-y-[-18px]">
            <path 
              d="M 200 200 L 125.75 125.75 A 105 105 0 0 1 200 95 Z" 
              fill="url(#secondaryGrad)"
              opacity="0.88"
              filter="url(#softGlow)"
            />
          </g>
          
          {/* Animated central core - pulsating energy */}
          <g className="transition-all duration-1000 ease-out origin-center group-hover:scale-[1.25]">
            <circle 
              cx="200" 
              cy="200" 
              r="42" 
              fill="url(#coreGrad)"
              filter="url(#strongGlow)"
              className="transition-all duration-1000"
              opacity="0.92"
            >
              <animate attributeName="r" values="42;46;42" dur="3s" repeatCount="indefinite"/>
            </circle>
            
            {/* Inner core ring */}
            <circle 
              cx="200" 
              cy="200" 
              r="30" 
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="1.5"
              opacity="0.6"
              className="transition-all duration-1000 group-hover:opacity-90"
            >
              <animate attributeName="r" values="30;34;30" dur="3s" repeatCount="indefinite"/>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 200 200;-360 200 200"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
            
            {/* Core accent dots */}
            <circle cx="200" cy="170" r="2.5" fill="#ffffff" opacity="0.85">
              <animate attributeName="opacity" values="0.85;0.4;0.85" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="230" cy="200" r="2.5" fill="#ffffff" opacity="0.85">
              <animate attributeName="opacity" values="0.85;0.4;0.85" dur="3s" begin="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="200" cy="230" r="2.5" fill="#ffffff" opacity="0.85">
              <animate attributeName="opacity" values="0.85;0.4;0.85" dur="3s" begin="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="170" cy="200" r="2.5" fill="#ffffff" opacity="0.85">
              <animate attributeName="opacity" values="0.85;0.4;0.85" dur="3s" begin="1.5s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Precision markers - sophisticated expansion */}
          <g className="transition-all duration-1000 ease-out group-hover:translate-y-[-35px] group-hover:opacity-100" opacity="0.65">
            <line x1="200" y1="45" x2="200" y2="68" stroke="url(#accentGrad)" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="200" cy="45" r="2.5" fill="#ffffff" opacity="0.85"/>
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[35px] group-hover:opacity-100" opacity="0.65">
            <line x1="332" y1="200" x2="355" y2="200" stroke="url(#accentGrad)" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="355" cy="200" r="2.5" fill="#ffffff" opacity="0.85"/>
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-y-[35px] group-hover:opacity-100" opacity="0.65">
            <line x1="200" y1="332" x2="200" y2="355" stroke="url(#accentGrad)" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="200" cy="355" r="2.5" fill="#ffffff" opacity="0.85"/>
          </g>
          
          <g className="transition-all duration-1000 ease-out group-hover:translate-x-[-35px] group-hover:opacity-100" opacity="0.65">
            <line x1="45" y1="200" x2="68" y2="200" stroke="url(#accentGrad)" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="45" cy="200" r="2.5" fill="#ffffff" opacity="0.85"/>
        </g>
          </svg>
          
          {/* Premium typography - aligned with logo */}
          <span className="text-6xl font-light tracking-[-0.03em] text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1' }}>
            Plan AI
          </span>
        </div>
        
        {/* Subtitle - centered with animation */}
        <div className="flex items-center justify-center gap-2.5 transition-all duration-700 group-hover:gap-3.5 opacity-70 group-hover:opacity-100">
          <div className="h-[0.5px] w-8 bg-gradient-to-r from-transparent via-white/50 to-white/30 transition-all duration-700 group-hover:w-12"></div>
          <span className="text-[8px] font-medium tracking-[0.3em] text-gray-400/70 uppercase transition-all duration-700 group-hover:text-gray-300/90 group-hover:tracking-[0.35em]">
            ARCHITECTURE INTELLIGENCE
          </span>
          <div className="h-[0.5px] w-8 bg-gradient-to-l from-transparent via-white/50 to-white/30 transition-all duration-700 group-hover:w-12"></div>
        </div>
      </div>
   );
 }

function AdvancedSearchBar({ onAdvanced, onAttach, attachments = [], modelMenuOpen, onModelMenuToggle, onFilesSelected, onSendMessage, isGenerating = false, isAtBottom = false, additionalButtons = null, onImageClick, onModelChange, setModelFromOutside, model, onModelSelect, on3DInfoOpen, backgroundType, onBackgroundChange }) {
  const [query, setQuery] = useState("");
  const [techplanMode, setTechplanMode] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSendTooltip, setShowSendTooltip] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filtersButtonRef = useRef(null);
  const filtersMenuRef = useRef(null);

  // Отслеживаем изменения модели извне
  useEffect(() => {
    if (onModelChange) {
      onModelChange(model);
    }
  }, [model, onModelChange]);

  // Устанавливаем модель извне
  useEffect(() => {
    if (setModelFromOutside) {
      onModelSelect?.(setModelFromOutside);
      // Сбрасываем значение после установки
      if (onModelChange) {
        onModelChange(setModelFromOutside);
      }
    }
  }, [setModelFromOutside, onModelChange, onModelSelect]);
  const fileInputRef = useRef(null);
  // Закрытие всплывающих окон по клику вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const clickedInsideFilters = !!(filtersMenuRef.current && filtersMenuRef.current.contains(target));
      const clickedOnFiltersButton = !!(filtersButtonRef.current && filtersButtonRef.current.contains(target));
      const clickedInsideModelMenu = !!target.closest('[data-model-menu]');
      if (!clickedInsideFilters && !clickedOnFiltersButton && !clickedInsideModelMenu) {
        if (showFilters) setShowFilters(false);
        if (modelMenuOpen) onModelMenuToggle?.(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters, modelMenuOpen, onModelMenuToggle]);

  const canSend = attachments.length > 0 && (
    model === "3d" ? query.trim().length > 0 : 
    model === "cleanup" ? true : 
    techplanMode !== null
  );

  return (
    <div className={`relative z-20 w-full max-w-4xl mx-auto ${isAtBottom ? 'rounded-2xl' : (attachments.length > 0 ? 'rounded-2xl' : 'rounded-full')} bg-white/5 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5`}>
      <div className="flex items-center gap-3 pl-8 md:pl-10 pr-2 py-0.5 min-h-[48px]">
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 group hover:scale-110"
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
              className="ml-1 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 group hover:scale-110"
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
             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 text-white text-sm rounded-md whitespace-nowrap z-50 text-center">
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
         <div className="hidden md:flex items-center gap-3 text-sm pr-0 ml-4">
          <AdvancedModelMenu
            value={model}
            onChange={(m) => {
              if (m === "3d") {
                on3DInfoOpen && on3DInfoOpen();
              } else {
                onModelSelect?.(m);
                onAdvanced?.();
              }
            }}
            isOpen={modelMenuOpen}
            onToggle={onModelMenuToggle}
            openUpward={isAtBottom}
          />

          <div 
            className="relative"
            onMouseEnter={() => !canSend && setShowSendTooltip(true)}
            onMouseLeave={() => setShowSendTooltip(false)}
          >
            <button
              type="button"
              disabled={!canSend || isGenerating}
              className="ml-1 rounded-full p-2 ring-1 ring-white/10 bg-white hover:bg-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group hover:scale-110"
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
                   className="h-5 w-5 text-black"
                >
                  ✷
                </motion.div>
              ) : (
              <svg 
                 className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 text-black"
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
                 className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 text-white text-sm rounded-md whitespace-nowrap z-50 text-center"
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
      
      {/* Выпадающее меню фильтров */}
      {showFilters && (
        <FiltersMenu
          refEl={filtersMenuRef}
          backgroundType={backgroundType}
          onBackgroundChange={(val) => {
            onBackgroundChange?.(val);
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 md:px-6 pb-4">
          <div className="text-xs text-neutral-500 mb-2">Прикрепленные файлы: {attachments.length}</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              return (
              <div key={attachment.id} className="relative group">
                <div 
                  className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onImageClick?.(attachment.url, attachment.name)}
                >
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
              );
            })}
          </div>
        </div>
      )}
      
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
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "text-white border border-white/40"
          : "text-neutral-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

// Выпадающее меню фильтров с вложенным пунктом "Фон страницы"
function FiltersMenu({ backgroundType, onBackgroundChange, onClose, refEl }) {
  const [openBackground, setOpenBackground] = useState(false);

  return (
    <div ref={refEl} className="absolute left-2 bottom-full mb-2 z-50 w-64 rounded-2xl border border-white/10 bg-[#3e3f42] p-2 shadow-2xl">
      <div className="text-xs text-neutral-300 mb-1 px-2">Фильтры</div>
      <div className="space-y-1" data-background-menu>
        <button
          onClick={() => setOpenBackground((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition"
        >
          <Layers className="h-4 w-4 text-white" />
          <span className="text-sm text-white">Фон страницы</span>
          <ChevronDown className={`ml-auto h-3 w-3 text-white opacity-70 transition-transform ${openBackground ? 'rotate-180' : ''}`} />
        </button>

        {openBackground && (
          <div className="mt-1 space-y-1">
            {[
              { id: 'standard', label: 'Стандартный' },
              { id: 'interactive', label: 'Интерактивный' },
              { id: 'alternative', label: 'Альтернативный' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onBackgroundChange?.(opt.id);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition`}
              >
                <span className="text-xs text-white">{opt.label}</span>
                {backgroundType === opt.id && <Check className="ml-auto h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdvancedModelMenu({ value, onChange, isOpen, onToggle, openUpward = false }) {
  const [open, setOpen] = useState(false);
  
  // Используем внешнее состояние, если оно передано
  const isMenuOpen = isOpen !== undefined ? isOpen : open;
  const toggleMenu = (next) => {
    if (onToggle) {
      if (typeof next === 'boolean') onToggle(next); else onToggle(!isMenuOpen);
    } else {
      if (typeof next === 'boolean') setOpen(next); else setOpen(!isMenuOpen);
    }
  };
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
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu();
        }}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        <current.Icon className="h-4 w-4 text-white" />
        <span>{current.label}</span>
        <ChevronDown className="h-4 w-4 text-white opacity-70" />
      </button>
      {isMenuOpen && (
         <div className={`absolute right-0 w-96 min-h-[160px] rounded-2xl border border-white/10 bg-[#3e3f42] p-3 shadow-2xl z-[100] ${
          openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          {items.map((it, idx) => (
            <button
              key={it.key}
              onClick={(e) => {
                e.stopPropagation();
                onChange(it.key);
                toggleMenu(false);
              }}
               className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition`}
            >
              <it.Icon className="h-5 w-5 text-white" />
              <div className="flex-1 text-left">
                <div className="text-xs font-medium text-white">{it.label}</div>
                <div className="text-[10px] text-neutral-400 mt-1">{it.sub}</div>
              </div>
              {value === it.key && it.key !== "3d" && <Check className="h-5 w-5 text-white" />}
              {it.key === "3d" && (
                <div className="px-2 py-1 bg-white/10 rounded-lg border border-white/20">
                  <span className="text-xs font-medium text-white">Скоро</span>
                </div>
              )}
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

function AdvancedPromoCard({ onClose, on3DClick }) {
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
              <div className="text-sm md:text-lg font-semibold leading-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white" />
                Преобразуй 2D в 3D
              </div>
              <div className="text-xs text-neutral-300">Генерируй 2D план с добавлением 3D интерьера</div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={on3DClick}
              className="shrink-0 rounded-lg bg-white/90 text-black px-3 py-1.5 text-xs hover:bg-white transition font-medium"
            >
              Перейти
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для кнопок, которые отображаются внутри панели поиска
function AdvancedInlineButtons({ backgroundType, onBackgroundChange, modelMenuOpen, onModelMenuToggle, openUpward = false }) {
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
    { id: "standard", label: "Стандартный", description: "Чистый фон без частиц", Icon: Layers },
    { id: "interactive", label: "Интерактивный", description: "Фон с частицами и взаимодействием", Icon: Sparkles },
    { id: "alternative", label: "Альтернативный", description: "Космический фон с летающими точками", Icon: Eye }
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
    <>
      <div className="relative" data-background-menu>
        <button 
          onClick={() => {
            setBackgroundMenuOpen((v) => !v);
            setThemesMenuOpen(false);
            onModelMenuToggle?.(false);
          }}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 ring-white/20"
        >
          <Layers className="h-3 w-3 text-white" />
          <span className="text-sm text-white">Фон страницы</span>
          <ChevronDown className="h-3 w-3 text-white opacity-70" />
        </button>
        {backgroundMenuOpen && (
          <div className={`absolute left-0 w-96 min-h-[160px] rounded-2xl border border-white/10 bg-[#3e3f42] p-3 shadow-2xl z-[100] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
            {backgroundOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onBackgroundChange?.(option.id);
                  setBackgroundMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition`}
              >
                <option.Icon className="h-5 w-5 text-white" />
                <div className="flex-1 text-left">
                  <div className="text-xs font-medium text-white">{option.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">{option.description}</div>
                </div>
                {backgroundType === option.id && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>

    </>
  );
}

function AdvancedAdvancedRow({ backgroundType, onBackgroundChange, modelMenuOpen, onModelMenuToggle, openUpward = false }) {
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
    { id: "standard", label: "Стандартный", description: "Чистый фон без частиц", Icon: Layers },
    { id: "interactive", label: "Интерактивный", description: "Фон с частицами и взаимодействием", Icon: Sparkles },
    { id: "alternative", label: "Альтернативный", description: "Космический фон с летающими точками", Icon: Eye }
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
    <div className="w-full max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-3">
      <div className="relative" data-background-menu>
        <button 
          onClick={() => {
            setBackgroundMenuOpen((v) => !v);
            setThemesMenuOpen(false); // Закрываем другое меню
            onModelMenuToggle?.(false); // Закрываем меню модели
          }}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-white/20"
        >
        <Layers className="h-4 w-4 text-white" />
          <span className="text-sm text-white">Фон страницы</span>
          <ChevronDown className="h-3 w-3 text-white opacity-70" />
      </button>
        {backgroundMenuOpen && (
          <div className={`absolute left-0 w-96 min-h-[160px] rounded-2xl border border-white/10 bg-[#3e3f42] p-3 shadow-2xl z-[100] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
            {backgroundOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onBackgroundChange?.(option.id);
                  setBackgroundMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition`}
              >
                <option.Icon className="h-5 w-5 text-white" />
                <div className="flex-1 text-left">
                  <div className="text-xs font-medium text-white">{option.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">{option.description}</div>
                </div>
                {backgroundType === option.id && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function AdvancedSuperBanner({ showMessages = false, onUpgradeClick }) {
  // Не показываем баннер, если панель находится внизу (showMessages = true)
  if (showMessages) return null;
  
  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-lg shadow-2xl"
      >
        <div>
          <div className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white" />
            Plan AI 3D
          </div>
          <div className="text-xs text-neutral-400">Попробуй расширенные возможности</div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUpgradeClick}
          className="rounded-xl bg-white/90 text-black px-4 py-2 text-sm hover:bg-white transition font-medium"
        >
          Скоро
        </motion.button>
      </motion.div>
    </div>
  );
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
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={() => {
              console.warn('Ошибка загрузки изображения в модальном окне:', imageUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="max-w-md max-h-md bg-gray-800 rounded-lg p-8 text-center text-white">
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
  onImageClick
}) {
  if (!isGenerating && !message && !result) return null;

  return (
    <div className="relative z-20 mx-auto max-w-3xl px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Сообщение пользователя */}
        {message && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur px-4 py-3">
              <div className="text-xs text-white whitespace-pre-wrap">{message.text}</div>
              {message.attachments && message.attachments.length > 0 && (
                 <div className="mt-2 flex flex-wrap gap-1.5">
                   {message.attachments.map((att) => (
                     <div key={att.id} className="relative group">
                       <div className="w-12 h-12 rounded-md bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                         {att.url && !att.url.includes('blob:') ? (
                           <img 
                             src={att.url} 
                             alt={att.name}
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               console.warn('Ошибка загрузки прикрепленного изображения:', att.url);
                               e.target.style.display = 'none';
                             }}
                           />
                         ) : (
                           <div className="text-xs text-white/60 text-center px-1">
                             <div className="truncate">{att.name}</div>
                             <div className="text-[10px]">{(att.size / 1024).toFixed(0)}KB</div>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
              )}
              <div className="mt-1.5 text-[10px] text-neutral-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Анимация генерации */}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-lg"
                >
                  ✷
                </motion.div>
                <span className="font-medium">Модель анализирует изображения...</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1.5">
                Обработка фотографий и генерация результата
              </div>
            </div>
          </div>
        )}

        {/* Результат от модели */}
        {result && !isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">AI</span>
                </div>
                <span className="text-xs font-medium text-white">Модель</span>
              </div>
              
              <div className="text-xs text-white whitespace-pre-wrap mb-3">
                {result.text}
              </div>
              
              {/* Сгенерированное изображение */}
              {result.image && !result.image.includes('blob:') && (
                <div className="mb-4">
                  <img 
                    src={result.image} 
                    alt="Результат генерации" 
                    className="w-full max-w-md rounded-lg ring-1 ring-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onImageClick?.(result.image, "Результат генерации")}
                    onError={(e) => {
                      console.warn('Ошибка загрузки изображения результата:', result.image);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Кнопки действий */}
              <div className="flex items-center gap-2 flex-wrap">
                {result.image && (
                  <button
                    onClick={() => onDownload?.(result.image)}
                    className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                    title="Скачать"
                  >
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => onRate?.(result.messageId, result.rating === 'like' ? null : 'like')}
                  className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center ${
                    result.rating === 'like' 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                  title="Лайк"
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => onRate?.(result.messageId, result.rating === 'dislike' ? null : 'dislike')}
                  className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center ${
                    result.rating === 'dislike' 
                      ? "bg-red-500/20 text-red-400" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                  title="Дизлайк"
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => onRegenerate?.(result.messageId)}
                  className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white"
                  title="Повторить"
                >
                  Повторить
                </button>
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
  const [model, setModel] = useState("techplan");
  const [showModelMenu, setShowModelMenu] = useState(false);
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
  const [backgroundType, setBackgroundType] = useState("alternative");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  
  // Gallery states
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      prompt: 'Современный интерьер квартиры с панорамными окнами',
      model: 'DALL-E 3',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
      prompt: 'Минималистичная кухня в скандинавском стиле',
      model: 'Midjourney',
      createdAt: new Date('2024-01-14'),
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      prompt: 'Уютная спальня с деревянными элементами',
      model: 'DALL-E 3',
      createdAt: new Date('2024-01-13'),
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      prompt: 'Современная ванная комната с мраморной отделкой',
      model: 'Stable Diffusion',
      createdAt: new Date('2024-01-12'),
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
      prompt: 'Просторная гостиная с камином',
      model: 'DALL-E 3',
      createdAt: new Date('2024-01-11'),
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      prompt: 'Домашний офис с большим столом',
      model: 'Midjourney',
      createdAt: new Date('2024-01-10'),
    },
  ]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [galleryModelFilter, setGalleryModelFilter] = useState('all');
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
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [is3DInfoModalOpen, setIs3DInfoModalOpen] = useState(false);
  
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
    
    // Создаем сообщение пользователя
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: model === "3d" ? query : 
            model === "techplan" ? `Создание по техплану — ${(techplanMode || "without") === "with" ? "С мебелью" : "Без мебели"}` :
            model === "cleanup" ? "Удаление объектов" :
            "Неизвестная модель",
      attachments: attachments.map((a) => ({ id: a.id, name: a.name, url: a.url })),
      time: new Date().toISOString(),
      // Сохраняем параметры для повторного запроса
      requestParams: {
        model,
        query,
        techplanMode,
        attachments: attachments.map((a) => ({ id: a.id, name: a.name, file: a.file }))
      }
    };

    setAdvancedCurrentMessage(userMessage);
    setAdvancedIsGenerating(true);
    setAdvancedCurrentResult(null);
    
    // Очищаем прикрепленные фотографии сразу после отправки
    clearAllAttachments();

    try {
      let responseText = "";
      let responseImage = null;

      if (model === "techplan" && attachments.length > 0) {
        // Проверяем лимит изображений
        if (attachments.length > 5) {
          throw new Error('Слишком много изображений. Максимум 5 изображений за раз.');
        }

        // Генерация технического плана
        const images = [];
        
        // Конвертируем все файлы в base64
        for (const att of attachments) {
          const fileReader = new FileReader();
          const base64Promise = new Promise((resolve) => {
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.readAsDataURL(att.file);
          });
          images.push(await base64Promise);
        }

        const requestBody = {
          images: images,
          mode: (techplanMode || "without") === "with" ? "withFurniture" : "withoutFurniture"
        };

        // Показываем прогресс для множественных изображений
        if (attachments.length > 1) {
          responseText = `Обрабатываю ${attachments.length} изображений по очереди для снижения нагрузки на сервер...`;
        }

        const response = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: JSON.stringify(requestBody)
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

        // Обработка успешного ответа
        const data = await response.json();
        let responseImages = [];
        
        if (data.success) {
          if (data.result) {
            // Один результат
            responseImages = [data.result.imageUrl];
          } else if (data.results && Array.isArray(data.results)) {
            // Множественные результаты
            responseImages = data.results.map(r => r.imageUrl);
          }
        }
        
        responseImage = responseImages[0] || null;
        responseText = data.message || `Технический план успешно создан в режиме "${(techplanMode || "without") === "with" ? "С мебелью" : "Без мебели"}".`;

        if (!hasUnlimitedAccess) {
          if (user) {
            await refreshUser();
          } else {
            setGuestPlanCount((prev) => prev + 1);
          }
        }
      } else if (model === "cleanup" && attachments.length > 0) {
        // Проверяем лимит изображений
        if (attachments.length > 5) {
          throw new Error('Слишком много изображений. Максимум 5 изображений за раз.');
        }

        // Удаление объектов
        const formData = new FormData();
        attachments.forEach((att) => formData.append('image', att.file));

        // Показываем прогресс для множественных изображений
        if (attachments.length > 1) {
          responseText = `Обрабатываю ${attachments.length} изображений по очереди для снижения нагрузки на сервер...`;
        }

        const response = await fetch(`${API_BASE_URL}/api/remove-objects`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || '';
          let errorMessage = 'Ошибка удаления объектов';
          let errorCode;
          
          try {
            if (contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData?.error || errorMessage;
              errorCode = errorData?.code;
              
              // Специальная обработка ошибок COMETAPI
              if (errorMessage.includes('Сервис генерации временно недоступен') || 
                  errorMessage.includes('No available channels') ||
                  errorMessage.includes('comet_api_error')) {
                errorMessage = 'Сервис генерации временно недоступен. Попробуйте позже.';
              } else if (errorMessage.includes('API_KEY_MISSING')) {
                errorMessage = 'Сервис временно недоступен. Обратитесь к администратору.';
              } else if (errorMessage.includes('PLAN_LIMIT') || errorMessage.includes('GUEST_LIMIT')) {
                errorMessage = 'Лимит генераций исчерпан. Войдите в аккаунт или попробуйте позже.';
              }
            }
          } catch (parseError) {
            console.error('Ошибка парсинга ответа об ошибке:', parseError);
          }
          
          throw new Error(errorMessage);
        }

        // Поддержка множественных результатов
        const contentType2 = response.headers.get('content-type') || '';
        let responseImages2 = [];
        if (contentType2.includes('application/json')) {
          const data = await response.json();
          if (Array.isArray(data?.images)) {
            responseImages2 = data.images;
          }
        } else {
          // Конвертируем blob в base64 для прямого использования
          const imageBlob = await response.blob();
          const blobReader = new FileReader();
          responseImages2 = await new Promise((resolve) => {
            blobReader.onload = () => resolve([blobReader.result]);
            blobReader.readAsDataURL(imageBlob);
          });
        }
        responseImage = responseImages2[0] || null;
        responseText = `Объекты успешно удалены с изображения.`;
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
            // Убираем attachments с blob URL из истории
            attachments: userMessage.attachments?.map(att => ({
              id: att.id,
              name: att.name,
              size: att.size,
              // Не сохраняем blob URL в истории
              url: null
            }))
          },
          { ...aiResponse, type: 'ai', time: new Date().toISOString() }
        ]
      }));
      
      // Автоматически переименовываем чат по модели
      autoRenameChat(activeChatId, model, techplanMode);
      
      // Очищаем текущие сообщения после добавления в историю
      setTimeout(() => {
        setAdvancedCurrentMessage(null);
        setAdvancedCurrentResult(null);
      }, 100);
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
        text: `Ошибка: ${errorMessage}`,
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
            // Убираем attachments с blob URL из истории
            attachments: userMessage.attachments?.map(att => ({
              id: att.id,
              name: att.name,
              size: att.size,
              // Не сохраняем blob URL в истории
              url: null
            }))
          },
          { ...errorResponse, type: 'ai', time: new Date().toISOString() }
        ]
      }));
      
      // Автоматически переименовываем чат по модели даже при ошибке
      autoRenameChat(activeChatId, model, techplanMode);
      
      // Очищаем текущие сообщения после добавления в историю
      setTimeout(() => {
        setAdvancedCurrentMessage(null);
        setAdvancedCurrentResult(null);
      }, 100);
    } finally {
      setAdvancedIsGenerating(false);
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

    // Находим сообщение пользователя с параметрами запроса
    const messageHistory = advancedMessageHistory[activeChatId] || [];
    const userMessage = messageHistory.find(msg => 
      msg.type === 'user' && msg.id === messageId
    );

    if (!userMessage || !userMessage.requestParams) {
      console.error('Не найдены параметры запроса для повторной генерации');
      return;
    }

    const { model, query, techplanMode, attachments } = userMessage.requestParams;

    setAdvancedIsGenerating(true);
    setAdvancedCurrentResult(null);
    
    // Очищаем прикрепленные фотографии сразу после отправки
    clearAllAttachments();

    try {
      let responseImage = null;
      let responseText = '';

      if (model === "techplan" && attachments.length > 0) {
        // Проверяем лимит изображений
        if (attachments.length > 5) {
          throw new Error('Слишком много изображений. Максимум 5 изображений за раз.');
        }

        // Генерация технического плана
        const images = [];
        
        // Конвертируем все файлы в base64
        for (const att of attachments) {
          const fileReader = new FileReader();
          const base64Promise = new Promise((resolve) => {
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.readAsDataURL(att.file);
          });
          images.push(await base64Promise);
        }

        const requestBody = {
          images: images,
          mode: (techplanMode || "without") === "with" ? "withFurniture" : "withoutFurniture"
        };

        // Показываем прогресс для множественных изображений
        if (attachments.length > 1) {
          responseText = `Обрабатываю ${attachments.length} изображений по очереди для снижения нагрузки на сервер...`;
        }

        const response = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: JSON.stringify(requestBody)
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

        // Обработка успешного ответа
        const data = await response.json();
        let responseImages = [];
        
        if (data.success) {
          if (data.result) {
            // Один результат
            responseImages = [data.result.imageUrl];
          } else if (data.results && Array.isArray(data.results)) {
            // Множественные результаты
            responseImages = data.results.map(r => r.imageUrl);
          }
        }
        
        responseImage = responseImages[0] || null;
        responseText = data.message || `Технический план успешно создан в режиме "${(techplanMode || "without") === "with" ? "С мебелью" : "Без мебели"}".`;

        if (!hasUnlimitedAccess) {
          if (user) {
            await refreshUser();
          } else {
            setGuestPlanCount((prev) => prev + 1);
          }
        }
      } else if (model === "cleanup" && attachments.length > 0) {
        // Проверяем лимит изображений
        if (attachments.length > 5) {
          throw new Error('Слишком много изображений. Максимум 5 изображений за раз.');
        }

        // Удаление объектов
        const formData = new FormData();
        attachments.forEach((att) => formData.append('image', att.file));

        // Показываем прогресс для множественных изображений
        if (attachments.length > 1) {
          responseText = `Обрабатываю ${attachments.length} изображений по очереди для снижения нагрузки на сервер...`;
        }

        const response = await fetch(`${API_BASE_URL}/api/remove-objects`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка удаления объектов');
        }

        // Поддержка множественных результатов
        const contentType2 = response.headers.get('content-type') || '';
        let responseImages2 = [];
        if (contentType2.includes('application/json')) {
          const data = await response.json();
          if (Array.isArray(data?.images)) {
            responseImages2 = data.images;
          }
        } else {
          // Конвертируем blob в base64 для прямого использования
          const imageBlob = await response.blob();
          const blobReader = new FileReader();
          responseImages2 = await new Promise((resolve) => {
            blobReader.onload = () => resolve([blobReader.result]);
            blobReader.readAsDataURL(imageBlob);
          });
        }
        responseImage = responseImages2[0] || null;
        responseText = `Объекты успешно удалены с изображения.`;
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
        time: new Date().toISOString()
      };
      
      setAdvancedCurrentResult(newResult);
      
      // Обновляем сообщение в истории для текущего чата
      setAdvancedMessageHistory(prev => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map(msg => 
          msg.id === messageId && msg.type === 'ai' 
            ? { ...newResult, type: 'ai' }
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
      setAdvancedCurrentResult({
        messageId: userMessage.id,
        text: `Ошибка: ${error.message}`,
        image: null,
        rating: null,
        canRegenerate: true,
        time: new Date().toISOString()
      });
    } finally {
      setAdvancedIsGenerating(false);
    }
  };

  const handleAdvancedDownload = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        const images = [];
        
        // Конвертируем файл в base64
        const fileReader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.readAsDataURL(attachments[0].file);
        });
        images.push(await base64Promise);

        const requestBody = {
          images: images,
          mode: planFurniture === "with" ? "withFurniture" : "withoutFurniture"
        };

        const response = await fetch(`${API_BASE_URL}/api/generate-technical-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          const err = new Error(errorData.error || 'Ошибка генерации технического плана');
          if (errorData.code) err.code = errorData.code;
          throw err;
        }

        // Обработка успешного ответа
        const data = await response.json();
        
        if (data.success) {
          if (data.result) {
            // Один результат
            responseImage = data.result.imageUrl;
          } else if (data.results && Array.isArray(data.results)) {
            // Множественные результаты
            responseImage = data.results[0].imageUrl;
          }
        }
        
        responseText = data.message || `Технический план успешно создан в режиме "${planFurniture === "with" ? "С мебелью" : "Без мебели"}".`;

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
          text: `Ошибка: ${errorMessage}`,
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
    
    // Очищаем только текущие сообщения при создании нового чата
    setAdvancedCurrentMessage(null);
    setAdvancedCurrentResult(null);
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
    console.log('clearAllAttachments called');
    setAttachments((prev) => {
      console.log('Previous attachments:', prev);
      // Очищаем blob URL для освобождения памяти
      prev.forEach((item) => {
        if (item.url && item.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(item.url);
          } catch (error) {
            console.warn('Ошибка при освобождении blob URL:', error);
          }
        }
      });
      return [];
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

  // Функция для автоматического переименования чата
  const autoRenameChat = (chatId, model, techplanModeParam = null) => {
    let newTitle = "Новый чат";
    
    switch (model) {
      case "techplan":
        if (techplanModeParam === "with") {
          newTitle = "Создание по техплану — С мебелью";
        } else {
          newTitle = "Создание по техплану — Без мебели";
        }
        break;
      case "cleanup":
        newTitle = "Удаление объектов";
        break;
      case "3d":
        newTitle = "3D генерация";
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
    setShowGallery(false); // Закрываем галерею при создании нового чата
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
  const handleGalleryDelete = (id) => {
    if (confirm('Вы уверены, что хотите удалить это изображение?')) {
      setGalleryImages(galleryImages.filter(img => img.id !== id));
      if (selectedGalleryImage?.id === id) {
        setSelectedGalleryImage(null);
      }
    }
  };

  const handleGalleryDownload = (url, id) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-${id}.jpg`;
    link.click();
  };

  const handleShowGallery = () => {
    setShowGallery(true);
  };

  const handleSendFromGallery = (payload) => {
    // Закрываем галерею
    setShowGallery(false);
    
    // Создаем новый чат (это очистит всю историю)
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
    setValue("");
    setAttachments([]);
    setPlanFurniture(null);
    
    // Очищаем только текущие сообщения
    setAdvancedCurrentMessage(null);
    setAdvancedCurrentResult(null);
    setRemoveDepth(null);
    setHasFirstMessage(false);
    setIsGenerating(false);
    setResponses({});
    
    // Отправляем сообщение в новый чат
    handleAdvancedSendMessage(payload);
  };

  // Advanced style layout (единственный доступный стиль)
    return (
      <div data-style={siteStyle} className="relative h-screen w-full text-neutral-200 antialiased" style={{ backgroundColor: '#161618' }}>
        {backgroundType === "standard" && null /* Стандартный фон - только цвет, без частиц */}
        {backgroundType === "interactive" && <BackgroundParticles />}
        {backgroundType === "alternative" && <AlternativeBackground />}
        <div className={`relative z-10 grid h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'grid-cols-[64px_1fr]' : 'grid-cols-[256px_1fr]'
        }`}>
          <AdvancedSidebar 
            chats={filteredChats}
            activeChatId={activeChatId}
            onChatSelect={(chatId) => {
              setShowGallery(false); // Закрываем галерею при переключении на чат
              setActiveChatId(chatId);
              setHasFirstMessage(chats.find(c => c.id === chatId)?.messages.length > 0);
              setIsGenerating(false);
              setResponses({});
              
              // Очищаем только текущие сообщения при переключении чатов
              setAdvancedCurrentMessage(null);
              setAdvancedCurrentResult(null);
            }}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isCollapsed={isSidebarCollapsed}
            searchResults={searchResults}
            onSettingSelect={handleSettingSelect}
            onCreateChat={handleCreateNewChat}
            onShowGallery={handleShowGallery}
            onHomeClick={handleHomeClick}
            onHowItWorks={() => setIsHowItWorksOpen(true)}
            user={user}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onPinChat={handlePinChat}
            onChangelog={() => setIsChangelogOpen(true)}
            onProfile={handleProfile}
            onLogout={handleLogout}
            onAuthOpen={() => setIsAuthOpen(true)}
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
            onFilesSelected={onFilesSelected}
            onSendMessage={handleAdvancedSendMessage}
            onSendFromGallery={handleSendFromGallery}
            isGenerating={advancedIsGenerating}
            currentMessage={advancedCurrentMessage}
            currentResult={advancedCurrentResult}
            messageHistory={advancedMessageHistory[activeChatId] || []}
            onRate={handleAdvancedRate}
            onRegenerate={handleAdvancedRegenerate}
            onDownload={handleAdvancedDownload}
            onImageClick={handleImageClick}
            onModelChange={setModel}
            showGallery={showGallery}
            setShowGallery={setShowGallery}
            galleryImages={galleryImages}
            selectedGalleryImage={selectedGalleryImage}
            setSelectedGalleryImage={setSelectedGalleryImage}
            galleryModelFilter={galleryModelFilter}
            setGalleryModelFilter={setGalleryModelFilter}
            onGalleryDelete={handleGalleryDelete}
            onGalleryDownload={handleGalleryDownload}
            model={model}
            onModelSelect={setModel}
            on3DInfoOpen={() => setIs3DInfoModalOpen(true)}
          />
          {limitNotice && (
            <div className="mx-auto max-w-3xl w-full px-4 mb-4">
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-xs text-yellow-200">
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
        <HowItWorksModal 
          isOpen={isHowItWorksOpen} 
          onClose={() => setIsHowItWorksOpen(false)} 
        />
        <ChangelogModal 
          isOpen={isChangelogOpen} 
          onClose={() => setIsChangelogOpen(false)} 
        />
        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)}
          user={user}
          backgroundType={backgroundType}
          onBackgroundChange={setBackgroundType}
          on3DInfoOpen={() => setIs3DInfoModalOpen(true)}
          onGrantAccess={handleGrantOrganizationAccess}
          onOpenOrganizationList={handleOpenOrganizationList}
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)}
        />
        <Plan3DInfoModal 
          isOpen={is3DInfoModalOpen} 
          onClose={() => setIs3DInfoModalOpen(false)} 
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
