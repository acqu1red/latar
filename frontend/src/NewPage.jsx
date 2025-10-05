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
  Key,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

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

// Модальное окно "3D режим" - Премиум дизайн
function ThreeDModeModal({ isOpen, onClose, onActivate }) {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" 
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
                onActivate();
                onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" 
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
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-8">
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

// Модальное окно "Настройки" - Премиум дизайн
function SettingsModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'security', label: 'Безопасность', icon: Settings },
    { id: 'interface', label: 'Интерфейс', icon: Palette }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" 
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
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                Настройки
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Управление вашим аккаунтом
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black font-medium'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-8">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="group bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-16 rounded-full bg-gradient-to-br from-white to-neutral-400 grid place-items-center text-2xl font-bold text-black">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Личная информация</h3>
                    <p className="text-neutral-400 text-sm">Обновите данные вашего профиля</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Имя
                    </label>
                    <input 
                      type="text" 
                      defaultValue={user?.name || ''} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <input 
                      type="email" 
                      defaultValue={user?.email || ''} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-600"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Изменить пароль</h3>
                <p className="text-neutral-400 text-sm mb-6">Убедитесь, что ваш пароль надежный и уникальный</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-2">Текущий пароль</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-2">Новый пароль</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-2">Подтвердите пароль</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">Двухфакторная аутентификация</h3>
                <p className="text-neutral-400 text-sm mb-4">Добавьте дополнительный уровень защиты</p>
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
                  Включить 2FA
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'interface' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6">Персонализация</h3>
                
                <div className="space-y-6">
                  <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        <Palette className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium block">Фоновые эффекты</span>
                        <span className="text-neutral-400 text-sm">Интерактивные частицы на фоне</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-white transition-all"></div>
                      <div className="absolute left-1 top-1 bg-black w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        <Save className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium block">Автосохранение чатов</span>
                        <span className="text-neutral-400 text-sm">Сохранять историю автоматически</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-white transition-all"></div>
                      <div className="absolute left-1 top-1 bg-black w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        <Bell className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium block">Уведомления</span>
                        <span className="text-neutral-400 text-sm">Получать важные обновления</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-white transition-all"></div>
                      <div className="absolute left-1 top-1 bg-black w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-white/10"
          >
            Сохранить изменения
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Модальное окно "Список изменений" - Премиум дизайн
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" 
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
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-8">
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
  onHomeClick,
  onHowItWorks,
  user,
  onRenameChat,
  onDeleteChat,
  onPinChat,
  onSettings,
  onChangelog,
  onProfile,
  onLogout
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
      <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm w-16">
        <div className="p-3">
          <div className="w-full h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
        </div>
        <nav className="px-2 text-sm flex-1 space-y-2">
          <button 
            onClick={onCreateChat}
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Новый чат"
          >
            <Plus className="h-4 w-4 text-neutral-400" />
          </button>
          <button 
            onClick={onHomeClick}
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="На главную"
          >
            <Home className="h-4 w-4 text-neutral-400" />
          </button>
          <button 
            onClick={onHowItWorks}
            className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Как это работает"
          >
            <HelpCircle className="h-4 w-4 text-neutral-400" />
          </button>
        </nav>
        <div className="p-3 flex flex-col items-center gap-2">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-xs font-semibold text-white hover:scale-105 transition"
            title="Профиль"
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
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
    <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm w-64 relative">
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
      <nav className="px-2 text-sm flex-1 overflow-y-auto">
        <AdvancedSectionTitle>Главное</AdvancedSectionTitle>
        <AdvancedNavItem onClick={onCreateChat} Icon={Plus} label="Новый чат" />
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
            <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-sm font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-white truncate">{user?.name || 'Пользователь'}</div>
              <div className="text-xs text-neutral-500 truncate">{user?.email || ''}</div>
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
            <button 
              onClick={() => { onSettings(); setUserMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
            >
              <Settings className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-white">Настройки</span>
            </button>
            <button 
              onClick={() => { onChangelog(); setUserMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
            >
              <FileText className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-white">Список изменений</span>
            </button>
            <button 
              onClick={() => { onProfile(); setUserMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
            >
              <User className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-white">Личный кабинет</span>
            </button>
            <div className="border-t border-white/5"></div>
            <button 
              onClick={() => { onLogout(); setUserMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition text-left"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">Выйти</span>
            </button>
          </div>
        )}
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

function AdvancedNavItem({ Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
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

function AdvancedHistoryLinkWithMenu({ chat, active = false, onClick, onRename, onDelete, onPin, isMenuOpen, setMenuOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  
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
          className={`flex-1 text-left py-1.5 px-3 rounded-md truncate cursor-pointer transition min-h-[32px] ${
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
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!isMenuOpen); }}
          className={`p-1.5 hover:bg-white/10 rounded-md transition flex-shrink-0 min-h-[32px] flex items-center justify-center ${
            isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <MoreVertical className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[160px]">
          <button
            onClick={(e) => { e.stopPropagation(); onRename(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left"
          >
            <Edit2 className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-sm text-white">Переименовать</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left"
          >
            <Pin className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-sm text-white">{chat.pinned ? 'Открепить' : 'Закрепить'}</span>
          </button>
          <div className="border-t border-white/5"></div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 transition text-left"
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

function AdvancedMainArea({ 
  backgroundType, 
  onBackgroundChange, 
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
  onModelChange
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
    // Переключаем модель на 3D план
    setModelTo3D("3d");
  };

  // Обработчик открытия 3D модального окна
  const handleOpen3DModal = () => {
    setIs3DModalOpen(true);
    setShowPromoCard(false);
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

  return (
    <main className="relative flex flex-col min-h-screen">
      <AdvancedTopBar />

      {/* Сообщения в верхней части */}
      {showMessages && (
        <div className="flex-1 pt-16">
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
              additionalButtons={showMessages ? (
                <AdvancedInlineButtons
                  backgroundType={backgroundType}
                  onBackgroundChange={onBackgroundChange}
                  modelMenuOpen={modelMenuOpen}
                  onModelMenuToggle={onModelMenuToggle}
                  openUpward={showMessages}
                />
              ) : null}
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
       <div className="group flex flex-col items-center justify-center gap-3 select-none cursor-pointer">
        <div className="flex items-center justify-center gap-3">
          {/* Plan AI logo - Ultimate Monochrome Luxury */}
          <svg 
            width="84" 
            height="84" 
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
          <span className="text-7xl font-light tracking-[-0.03em] text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1' }}>
            Plan AI
          </span>
        </div>
        
        {/* Subtitle - centered with animation */}
        <div className="flex items-center justify-center gap-2.5 transition-all duration-700 group-hover:gap-3.5 opacity-70 group-hover:opacity-100">
          <div className="h-[0.5px] w-8 bg-gradient-to-r from-transparent via-white/50 to-white/30 transition-all duration-700 group-hover:w-12"></div>
          <span className="text-[9px] font-medium tracking-[0.35em] text-gray-400/70 uppercase transition-all duration-700 group-hover:text-gray-300/90 group-hover:tracking-[0.42em]">
            ARCHITECTURE INTELLIGENCE
          </span>
          <div className="h-[0.5px] w-8 bg-gradient-to-l from-transparent via-white/50 to-white/30 transition-all duration-700 group-hover:w-12"></div>
        </div>
      </div>
   );
 }

function AdvancedSearchBar({ onAdvanced, onAttach, attachments = [], modelMenuOpen, onModelMenuToggle, onFilesSelected, onSendMessage, isGenerating = false, isAtBottom = false, additionalButtons = null, onImageClick, onModelChange, setModelFromOutside }) {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState("techplan");
  const [techplanMode, setTechplanMode] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSendTooltip, setShowSendTooltip] = useState(false);

  // Отслеживаем изменения модели извне
  useEffect(() => {
    if (onModelChange) {
      onModelChange(model);
    }
  }, [model, onModelChange]);

  // Устанавливаем модель извне
  useEffect(() => {
    if (setModelFromOutside) {
      setModel(setModelFromOutside);
      // Сбрасываем значение после установки
      if (onModelChange) {
        onModelChange(setModelFromOutside);
      }
    }
  }, [setModelFromOutside, onModelChange]);
  const fileInputRef = useRef(null);

  const canSend = attachments.length > 0 && (model === "3d" ? query.trim().length > 0 : techplanMode !== null);

  return (
    <div className="relative z-20 w-full max-w-2xl mx-auto rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <div className="flex items-center gap-3 px-4 md:px-6">
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group hover:scale-110"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Paperclip className="h-5 w-5 text-neutral-400 hover:text-neutral-200 transition-transform duration-200 group-hover:scale-110" />
          </button>
          
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
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap z-50 text-center">
              Прикрепить
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </div>
          )}
        </div>

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

        {model === "remove" && (
          <div className="flex-1 py-3 md:py-4 flex items-center gap-2">
            <div className="text-sm text-neutral-400">Удаление объектов</div>
          </div>
        )}

        {model === "cleanup" && (
          <div className="flex-1 py-3 md:py-4 flex items-center gap-2">
            <div className="text-sm text-neutral-400">Удаление объектов</div>
          </div>
        )}

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
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap z-50 text-center"
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
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 md:px-6 pb-4">
          <div className="text-xs text-neutral-500 mb-2">Прикрепленные файлы: {attachments.length}</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              console.log('AdvancedSearchBar rendering attachment:', attachment);
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

function AdvancedModelMenu({ value, onChange, isOpen, onToggle, openUpward = false }) {
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
        <div className={`absolute right-0 w-64 min-h-[200px] rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-[100] ${
          openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
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
    <>
      <button className="flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10">
        <ImageIcon className="h-4 w-4" />
        <span className="text-sm">Параметры плана</span>
      </button>

      <div className="relative" data-background-menu>
        <button 
          onClick={() => {
            setBackgroundMenuOpen((v) => !v);
            setThemesMenuOpen(false);
            onModelMenuToggle?.(false);
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
        >
          <Layers className="h-4 w-4" />
          <span className="text-sm">Фон страницы</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
        {backgroundMenuOpen && (
          <div className={`absolute left-0 w-64 min-h-[200px] rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-[100] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
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
            setBackgroundMenuOpen(false);
            onModelMenuToggle?.(false);
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
        >
          <Palette className="h-4 w-4" />
          <span className="text-sm">{bg ? `Фон: ${bg}` : "Фоны"}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
        {themesMenuOpen && (
          <div className={`absolute left-0 w-64 min-h-[200px] rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-[100] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
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
    <div className="w-full max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-3">
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
          <div className={`absolute left-0 w-64 min-h-[200px] rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-[100] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
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
          <div className={`absolute left-0 w-64 min-h-[200px] rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl z-[100] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
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
          Улучшить
        </motion.button>
      </motion.div>
    </div>
  );
}

// === Image Modal Component ===
function ImageModal({ isOpen, imageUrl, imageAlt, onClose }) {
  if (!isOpen) return null;

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
        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
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
    <div className="relative z-20 mx-auto max-w-4xl px-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* Сообщение пользователя */}
        {message && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur px-6 py-4">
              <div className="text-sm text-white whitespace-pre-wrap">{message.text}</div>
              {message.attachments && message.attachments.length > 0 && (
                 <div className="mt-3 flex flex-wrap gap-2">
                   {message.attachments.map((att) => (
                     <div key={att.id} className="relative group">
                       <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                         <img 
                           src={att.url} 
                           alt={att.name}
                           className="w-full h-full object-cover"
                         />
                       </div>
                     </div>
                   ))}
                 </div>
              )}
              <div className="mt-2 text-xs text-neutral-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Анимация генерации */}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-6 py-4">
              <div className="flex items-center gap-3 text-sm text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  ✷
                </motion.div>
                <span className="font-medium">Модель анализирует изображения...</span>
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Обработка фотографий и генерация результата
              </div>
            </div>
          </div>
        )}

        {/* Результат от модели */}
        {result && !isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <span className="text-sm font-medium text-white">Модель</span>
              </div>
              
              <div className="text-sm text-white whitespace-pre-wrap mb-4">
                {result.text}
              </div>
              
              {/* Сгенерированное изображение */}
              {result.image && (
                <div className="mb-4">
                  <img 
                    src={result.image} 
                    alt="Результат генерации" 
                    className="w-full max-w-md rounded-lg ring-1 ring-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onImageClick?.(result.image, "Результат генерации")}
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
  const [backgroundType, setBackgroundType] = useState("alternative");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  // Advanced message system states
  const [advancedCurrentMessage, setAdvancedCurrentMessage] = useState(null);
  const [advancedCurrentResult, setAdvancedCurrentResult] = useState(null);
  const [advancedIsGenerating, setAdvancedIsGenerating] = useState(false);
  const [advancedMessageHistory, setAdvancedMessageHistory] = useState([]);

  // Image modal state
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', alt: '' });
  
  // Modal states
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Navigate
  const navigate = useNavigate();

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

  // Advanced message system handlers
  const handleAdvancedSendMessage = async (payload) => {
    const { model, query, techplanMode, attachments } = payload;
    
    // Создаем сообщение пользователя
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: model === "3d" ? query : 
            model === "techplan" ? `Создание по техплану — ${techplanMode === "with" ? "С мебелью" : "Без мебели"}` :
            "Удаление объектов",
      attachments: attachments.map((a) => ({ id: a.id, name: a.name, url: a.url })),
      time: new Date().toISOString(),
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
        // Генерация технического плана
        const formData = new FormData();
        formData.append('image', attachments[0].file);
        formData.append('mode', techplanMode === "with" ? "withFurniture" : "withoutFurniture");

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
        responseText = `Технический план успешно создан в режиме "${techplanMode === "with" ? "С мебелью" : "Без мебели"}".`;
      } else {
        // Обычная обработка для других моделей
        responseText = `Вот результат обработки вашего запроса "${userMessage.text}".`;
      }
      
      const aiResponse = {
        messageId: userMessage.id,
        text: responseText,
        image: responseImage,
        rating: null,
        canRegenerate: true
      };

      setAdvancedCurrentResult(aiResponse);
      
      // Добавляем сообщения в историю
      setAdvancedMessageHistory(prev => [
        ...prev,
        { ...userMessage, type: 'user' },
        { ...aiResponse, type: 'ai', time: new Date().toISOString() }
      ]);
      
      // Очищаем текущие сообщения после добавления в историю
      setTimeout(() => {
        setAdvancedCurrentMessage(null);
        setAdvancedCurrentResult(null);
      }, 100);
    } catch (error) {
      console.error('Ошибка генерации:', error);
      const errorResponse = {
        messageId: userMessage.id,
        text: `Ошибка: ${error.message}`,
        rating: null,
        canRegenerate: true
      };

      setAdvancedCurrentResult(errorResponse);
      
      // Добавляем сообщения в историю даже при ошибке
      setAdvancedMessageHistory(prev => [
        ...prev,
        { ...userMessage, type: 'user' },
        { ...errorResponse, type: 'ai', time: new Date().toISOString() }
      ]);
      
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
    
    // Обновляем рейтинг в истории
    setAdvancedMessageHistory(prev => 
      prev.map(msg => 
        msg.messageId === messageId && msg.type === 'ai' 
          ? { ...msg, rating }
          : msg
      )
    );
  };

  const handleAdvancedRegenerate = async (messageId) => {
    setAdvancedIsGenerating(true);
    
    // Симуляция повторной генерации
    setTimeout(() => {
      setAdvancedIsGenerating(false);
      const updatedResult = {
        messageId,
        text: "Обновленный результат генерации",
        rating: null,
        canRegenerate: true
      };
      
      setAdvancedCurrentResult(updatedResult);
      
      // Обновляем сообщение в истории
      setAdvancedMessageHistory(prev => 
        prev.map(msg => 
          msg.messageId === messageId && msg.type === 'ai' 
            ? { ...updatedResult, type: 'ai', time: new Date().toISOString() }
            : msg
        )
      );
    }, 2000);
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
    
    // Очищаем историю сообщений при создании нового чата
    setAdvancedMessageHistory([]);
    setAdvancedCurrentMessage(null);
    setAdvancedCurrentResult(null);
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

  const clearAllAttachments = () => {
    console.log('clearAllAttachments called');
    setAttachments((prev) => {
      console.log('Previous attachments:', prev);
      // НЕ очищаем URL, так как они используются в сообщениях
      // prev.forEach((item) => URL.revokeObjectURL(item.url));
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

  // Chat management handlers
  const handleCreateNewChat = () => {
    createChat();
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  const handleRenameChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    const newTitle = prompt('Введите новое название чата:', chat?.title || 'Новый чат');
    if (newTitle !== null && newTitle.trim() !== '') {
      setChats(chats.map(c => 
        c.id === chatId ? { ...c, title: newTitle.trim() } : c
      ));
    }
  };
  
  const handleDeleteChat = (chatId) => {
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      setChats(chats.filter(c => c.id !== chatId));
      if (activeChatId === chatId && chats.length > 1) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats[0]?.id || null);
      }
      
      // Очищаем историю сообщений при удалении чата
      setAdvancedMessageHistory([]);
      setAdvancedCurrentMessage(null);
      setAdvancedCurrentResult(null);
    }
  };
  
  const handlePinChat = (chatId) => {
    setChats(chats.map(c => 
      c.id === chatId ? { ...c, pinned: !c.pinned } : c
    ));
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleProfile = () => {
    navigate('/profile');
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
              
              // Очищаем историю сообщений при переключении чатов
              setAdvancedMessageHistory([]);
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
            onHomeClick={handleHomeClick}
            onHowItWorks={() => setIsHowItWorksOpen(true)}
            user={user}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onPinChat={handlePinChat}
            onSettings={() => setIsSettingsOpen(true)}
            onChangelog={() => setIsChangelogOpen(true)}
            onProfile={handleProfile}
            onLogout={handleLogout}
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
            isGenerating={advancedIsGenerating}
            currentMessage={advancedCurrentMessage}
            currentResult={advancedCurrentResult}
            messageHistory={advancedMessageHistory}
            onRate={handleAdvancedRate}
            onRegenerate={handleAdvancedRegenerate}
            onDownload={handleAdvancedDownload}
            onImageClick={handleImageClick}
            onModelChange={setModel}
          />
        </div>
        
        {/* Image Modal */}
        <ImageModal
          isOpen={imageModal.isOpen}
          imageUrl={imageModal.url}
          imageAlt={imageModal.alt}
          onClose={handleImageModalClose}
        />
        
        {/* Feature Modals */}
        <HowItWorksModal 
          isOpen={isHowItWorksOpen} 
          onClose={() => setIsHowItWorksOpen(false)} 
        />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          user={user}
        />
        <ChangelogModal 
          isOpen={isChangelogOpen} 
          onClose={() => setIsChangelogOpen(false)} 
        />
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
