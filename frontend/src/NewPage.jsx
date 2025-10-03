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
} from "lucide-react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useAuth } from './AuthContext';

// ===== Helpers =====
const cn = (...c) => c.filter(Boolean).join(" ");

// === Animated liquid backdrop (VENOM, extra dim via prop) ===
function LiquidBackdrop({ dim = 1, enabled = true }) {
  const mountRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    // Disable on mobile devices
    if (window.innerWidth < 768) return;
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    Object.assign(renderer.domElement.style, {
      position: "fixed",
      inset: "0",
      zIndex: "0",
      pointerEvents: "none",
    });
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_dim: { value: dim },
    };

    const vertex = /* glsl */ `
      void main() { gl_Position = vec4(position, 1.0); }
    `;

    // Немного ещё приглушили линии и ввели коэффициент u_dim
    const fragment = /* glsl */ `
      precision highp float;
      uniform vec2 u_resolution; 
      uniform float u_time;
      uniform float u_dim;

      mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

      float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
        vec2 u=f*f*(3.0-2.0*f);
        return mix(a,b,u.x)+ (c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
      }
      float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

      float stripes(vec2 p, float freq, float thickness){
        float s = sin(p.x*freq + fbm(p*2.0)*3.14159);
        float w = fwidth(s) * 1.2;
        return smoothstep(thickness + w, thickness - w, abs(s));
      }

      void main(){
        vec2 res = u_resolution; 
        vec2 uv = gl_FragCoord.xy / res.xy;
        vec2 p = uv - 0.5; p.x *= res.x/res.y; 

        float t = u_time * 0.25;
        vec2 flow = vec2(fbm(p*1.2 + t*0.3), fbm(p*1.4 - t*0.25));
        p += (flow-0.5)*0.35; // elegant autonomous drape

        float a = 0.35 + 0.15*sin(t*0.7);
        p = rot(a)*p;

        float L1 = stripes(p + vec2(0.0, t*0.8), 9.0, 0.06);
        float L2 = stripes(rot(1.2)*p + vec2(0.0, -t*0.6), 15.0, 0.045);
        float L3 = stripes(rot(-0.8)*p + vec2(0.0, t*0.4), 22.0, 0.035);

        float lines = clamp(L1*0.9 + L2*0.8 + L3*0.7, 0.0, 1.0);
        float glow = smoothstep(0.6, 1.0, lines);
        float alpha = (pow(lines, 1.35)*0.06 + glow*0.016) * u_dim; 
        gl_FragColor = vec4(vec3(1.0), alpha);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    let start = performance.now();
    let running = true;

    const onResize = () => {
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      if (!running) return;
      uniforms.u_time.value = (performance.now() - start)/1000.0;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        start = performance.now() - uniforms.u_time.value*1000.0;
        requestAnimationFrame(animate);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    requestAnimationFrame(animate);

    return () => {
      running = false;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      const el = renderer.domElement;
      if (el && el.parentNode) el.parentNode.removeChild(el);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, [enabled, dim]);

  if (!enabled) return null;
  return <div ref={mountRef} />;
}

// === Venom DNA Goo: subtle dark "liquid strands" drifting across the background ===
function VenomDNA({ enabled = true, amount = 3, opacity = 0.14, scale = 1 }) {
  const mountRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    // Disable on mobile devices
    if (window.innerWidth < 768) return;
    const mount = mountRef.current; if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    Object.assign(renderer.domElement.style, {
      position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none'
    });
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_amount: { value: amount },
      u_opacity: { value: opacity },
      u_scale: { value: scale },
    };

    const vtx = /* glsl */`void main(){ gl_Position = vec4(position,1.0); }`;
    const frg = /* glsl */`
      precision highp float; 
      uniform vec2 u_resolution; 
      uniform float u_time; 
      uniform float u_amount; 
      uniform float u_opacity; 
      uniform float u_scale;

      // helpers
      float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

      // gaussian falloff for metaballs
      float bead(vec2 p, vec2 c, float r){
        vec2 d = p - c; 
        float v = exp(-dot(d,d)/(r*r));
        return v;
      }

      // one DNA-like chain field
      float chainField(vec2 p, float seed){
        float N = 12.0; // beads per strand
        float field = 0.0;
        float ang = radians(20.0 + seed*37.0);
        vec2 base = vec2(0.0);
        vec2 sp = rot(ang) * vec2(1.0, 0.0);
        float t = u_time * (0.07 + 0.03*seed);
        for (float i=0.0; i<12.0; i+=1.0){
          float s = i/(N-1.0);             // 0..1 along strand
          // wavy parametric path tilted by angle
          vec2 path = (s*2.2-1.1) * sp;    // along main axis
          float wob = 0.28*sin(6.283*s*3.0 + t*3.0 + seed*5.0);
          path += rot(ang+1.5708) * vec2(0.0, wob);
          // slow drift of whole strand
          vec2 drift = 0.18*vec2(sin(t*0.9+seed*5.0), cos(t*0.6+seed*3.0));
          vec2 c = (path + drift) * u_scale; 
          field += bead(p, c, 0.10);
        }
        return field;
      }

      void main(){
        vec2 res = u_resolution; 
        vec2 uv = (gl_FragCoord.xy / res.xy); 
        vec2 p = uv*2.0 - 1.0; p.x *= res.x/res.y; // -1..1 aspect

        float f = 0.0;
        // a few strands with different seeds
        f += chainField(p, 0.13);
        if (u_amount > 1.0) f += chainField(p*0.98 + vec2(0.03, -0.01), 0.57);
        if (u_amount > 2.0) f += chainField(p*1.02 + vec2(-0.02, 0.02), 0.91);

        // normalize and threshold
        float m = smoothstep(0.65, 0.85, f);
        float alpha = m * u_opacity; // subtle dark ink

        // slight specular glints along edges
        float edge = clamp((f - 0.7)*2.2, 0.0, 1.0);
        vec3 col = mix(vec3(0.0), vec3(0.14), edge*0.25); // tiny grey highlight

        gl_FragColor = vec4(col, alpha);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms, vertexShader: vtx, fragmentShader: frg,
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.NormalBlending
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat);
    scene.add(mesh);

    let start = performance.now();
    let running = true;
    const onResize = () => { uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight); renderer.setSize(window.innerWidth, window.innerHeight); };
    const animate = () => { if(!running) return; uniforms.u_time.value = (performance.now()-start)/1000.0; renderer.render(scene,camera); requestAnimationFrame(animate); };
    const onVis = () => { running = !document.hidden; if (running) { start = performance.now() - uniforms.u_time.value*1000.0; requestAnimationFrame(animate);} };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    requestAnimationFrame(animate);

    return () => {
      running=false; window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis);
      const el=renderer.domElement; if(el&&el.parentNode) el.parentNode.removeChild(el); renderer.dispose(); mesh.geometry.dispose(); mat.dispose();
    };
  }, [enabled, amount, opacity, scale]);
  if (!enabled) return null;
  return <div ref={mountRef} />;
}

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

// === Onboarding hint that points at Settings ===
function StyleHint({ targetRef, show, onClose }) {
  const [pos, setPos] = useState({ top: 120, left: 64 });
  useEffect(() => {
    const update = () => {
      if (!targetRef?.current) return;
      const r = targetRef.current.getBoundingClientRect();
      setPos({ top: r.top + r.height / 2, left: r.right + 12 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [targetRef]);
  if (!show) return null;
  return (
    <motion.div
      className="fixed z-50"
      style={{ top: pos.top, left: pos.left }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="rounded-xl theme-panel theme-border px-3 py-2 text-xs theme-text-muted flex items-center gap-2 shadow-lg">
        <motion.span
          aria-hidden
          initial={{ x: 0 }}
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          ➜
        </motion.span>
        <span>Стиль страницы можно сменить здесь</span>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          OK
        </button>
      </div>
    </motion.div>
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
  { id: "venom", label: "VENOM" },
  { id: "standard", label: "Стандарт" },
];

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
    if (typeof window === "undefined") return STYLE_OPTIONS[0].id; // VENOM by default
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

  // Onboarding hint (first visit)
  const [showStyleHint, setShowStyleHint] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("styleHintDismissed");
  });
  const settingsBtnRef = useRef(null);
  const dismissHint = () => {
    setShowStyleHint(false);
    if (typeof window !== "undefined") localStorage.setItem("styleHintDismissed", "1");
  };

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
    const chat = { id, title: "Новый чат", messages: [] };
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

  return (
    <div data-style={siteStyle} className="min-h-screen themed-root antialiased relative overflow-hidden">
      {/* Liquid background only for VENOM (extra dim) - Desktop only */}
      <LiquidBackdrop enabled={siteStyle === "venom"} dim={0.75} />
      <VenomDNA enabled={siteStyle === "venom"} amount={3} opacity={0.12} scale={0.9} />

      <div className="flex h-screen relative z-10">
        {/* ==== Left rail - Desktop only ==== */}
        <aside className="hidden md:flex w-16 shrink-0 theme-border border-r theme-panel backdrop-blur flex-col items-center justify-between py-4">
          <div className="flex flex-col items-center gap-4">
            {/* По клику на панель — открываем правую панель с чатами */}
            <button onClick={() => openRight("chats")} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-black/10" title="Список чатов">
              <PanelLeft className="h-5 w-5" />
            </button>
            <button onClick={createChat} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-black/10" title="Новый чат">
              <Plus className="h-5 w-5" />
            </button>
            <button onClick={deleteActiveChat} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-black/10" title="Удалить текущий чат">
              <Trash2 className="h-5 w-5" />
            </button>
            <button ref={settingsBtnRef} onClick={() => openRight("settings")} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-black/10" title="Настройки">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-black/20 grid place-items-center text-xs font-semibold">DC</div>
        </aside>

        {/* ==== Main content ==== */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between p-4 theme-border border-b theme-panel">
            <button onClick={() => openRight("chats")} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-black/10" title="Список чатов">
              <PanelLeft className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium">Plan AI</div>
            <button onClick={() => openRight("settings")} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-black/10" title="Настройки">
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
                      <div className="max-w-[85%] md:max-w-[80%] rounded-2xl theme-border theme-panel-muted px-3 py-2">
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
                        <div className="max-w-[85%] md:max-w-[80%] rounded-2xl theme-border theme-panel-muted px-3 py-2">
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
                    <div className="max-w-[80%] rounded-2xl theme-border theme-panel-muted px-3 py-2">
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
                <div className={cn("w-full max-w-2xl rounded-2xl backdrop-blur relative theme-panel theme-border","shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]") }>
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
                              "rounded-xl border px-2 md:px-3 py-2 text-xs md:text-sm",
                              planFurniture === "with" ? "accent-button" : "theme-panel theme-border"
                            )}
                          >
                            С мебелью
                          </button>
                          <button
                            onClick={() => setPlanFurniture("without")}
                            className={cn(
                              "rounded-xl border px-2 md:px-3 py-2 text-xs md:text-sm",
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
                            className={cn("rounded-xl px-3 py-2 text-sm border", removeDepth === "full" ? "accent-button" : "theme-panel theme-border")}
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
                            <div className="absolute right-0 top-10 z-20 w-48 md:w-56 rounded-xl theme-border theme-panel shadow-lg">
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
                            "h-8 w-8 md:h-9 md:w-9 rounded-xl grid place-items-center border",
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
                            <div key={a.id} className="group relative overflow-hidden rounded-xl theme-border theme-panel-muted">
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
                <div className={cn("w-full rounded-2xl backdrop-blur relative theme-panel theme-border","shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]") }>
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
                            "rounded-xl border px-2 md:px-3 py-2 text-xs md:text-sm",
                            planFurniture === "with" ? "accent-button" : "theme-panel theme-border"
                          )}
                        >
                          С мебелью
                        </button>
                        <button
                          onClick={() => setPlanFurniture("without")}
                          className={cn(
                            "rounded-xl border px-2 md:px-3 py-2 text-xs md:text-sm",
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
                          className={cn("rounded-xl px-3 py-2 text-sm border", removeDepth === "full" ? "accent-button" : "theme-panel theme-border")}
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
                          <div className="absolute right-0 top-10 z-20 w-48 md:w-56 rounded-xl theme-border theme-panel shadow-lg">
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
                          "h-8 w-8 md:h-9 md:w-9 rounded-xl grid place-items-center border",
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
                          <div key={a.id} className="group relative overflow-hidden rounded-xl theme-border theme-panel-muted">
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
                    className="w-full rounded-xl border-2 px-3 py-2 text-sm transition-all duration-200 flex items-center gap-2 font-medium new-chat-button"
                  >
                    <Plus className="h-4 w-4"/>
                    Новый чат
                  </button>
                  <button 
                    onClick={deleteActiveChat} 
                    className="w-full rounded-xl theme-border theme-panel px-3 py-2 text-sm hover:opacity-90 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4"/>
                    Удаление чата
                  </button>
                  <button 
                    onClick={() => setRightTab("settings")} 
                    className="w-full rounded-xl theme-border theme-panel px-3 py-2 text-sm hover:opacity-90 flex items-center gap-2"
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
                          className={cn("flex-1 text-left rounded-xl border px-3 py-2 hover:opacity-95", c.id === activeChatId ? "theme-panel" : "theme-panel-muted", "theme-border")}
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
                  className="w-full rounded-xl theme-border theme-panel px-3 py-2 text-sm hover:opacity-90 flex items-center gap-2"
                >
                  <PanelLeft className="h-4 w-4"/>
                  Вернуться к чатам
                </button>
                
                <div className="border-t theme-border pt-3 md:pt-4">
                  <div className="text-sm theme-text-muted mb-2">Профиль</div>
                  <div className="space-y-2">
                    <label className="block text-xs theme-text-muted">Email</label>
                    <input className="w-full rounded-xl theme-border theme-panel px-3 py-2 outline-none text-sm" placeholder="you@example.com" />
                    <label className="block text-xs theme-text-muted mt-3">Пароль</label>
                    <input type="password" className="w-full rounded-xl theme-border theme-panel px-3 py-2 outline-none text-sm" placeholder="••••••••" />
                    <button className="mt-3 rounded-xl theme-border theme-panel px-3 py-2 text-sm hover:opacity-90">Сохранить</button>
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

      {/* Onboarding hint to settings */}
      <StyleHint targetRef={settingsBtnRef} show={showStyleHint} onClose={dismissHint} />

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

        :root[data-style='venom']{
          --bg: #0A0A0A;
          --panel: rgba(18,18,18,0.9);
          --panel-muted: rgba(22,22,22,0.9);
          --border: #262626;
          --text: #F5F5F5;
          --muted: #A0A0A0;
          --accent: #EAEAEA; /* светлая кнопка отправки */
          --accent-contrast: #0A0A0A;
          --accent-hover: #FFFFFF; /* более яркий белый при наведении */
          --hero-accent: #FFFFFF;
          --accent-disabled: var(--panel);
          --accent-disabled-contrast: var(--muted);
        }
        :root[data-style='standard']{
          --bg: #1a1a1a;
          --panel: #2a2a2a;
          --panel-muted: #242424;
          --border: #404040;
          --text: #f8f9fa;
          --muted: #9ca3af;
          --accent: #3b82f6;
          --accent-contrast: #ffffff;
          --accent-hover: #2563eb;
          --hero-accent: #60a5fa;
          --accent-disabled: #374151;
          --accent-disabled-contrast: #6b7280;
        }

        /* legacy helpers (if still referenced somewhere) */
        .bg-neutral-850 { background-color: rgb(38 38 38); }
        .bg-neutral-925 { background-color: rgb(18 18 18); }
      `}</style>
    </div>
  );
}
