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

  // Initialize particles.js for VENOM style
  useEffect(() => {
    if (siteStyle === "venom" && typeof window !== "undefined") {
      // Load particles.js script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.onload = () => {
        if (window.particlesJS) {
          window.particlesJS("particles-js", {
            "particles": {
              "number": {
                "value": 80,
                "density": {
                  "enable": true,
                  "value_area": 800
                }
              },
              "color": {
                "value": "#ffffff"
              },
              "shape": {
                "type": "circle",
                "stroke": {
                  "width": 0,
                  "color": "#000000"
                },
                "polygon": {
                  "nb_sides": 5
                },
                "image": {
                  "src": "img/github.svg",
                  "width": 100,
                  "height": 100
                }
              },
              "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                  "enable": false,
                  "speed": 1,
                  "opacity_min": 0.1,
                  "sync": false
                }
              },
              "size": {
                "value": 3,
                "random": true,
                "anim": {
                  "enable": false,
                  "speed": 40,
                  "size_min": 0.1,
                  "sync": false
                }
              },
              "line_linked": {
                "enable": true,
                "distance": 200,
                "color": "#ffffff",
                "opacity": 0.6,
                "width": 1
              },
              "move": {
                "enable": true,
                "speed": 4,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                  "enable": true,
                  "rotateX": 600,
                  "rotateY": 1200
                }
              }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "grab"
                },
                "onclick": {
                  "enable": true,
                  "mode": "push"
                },
                "resize": true
              },
              "modes": {
                "grab": {
                  "distance": 200,
                  "line_linked": {
                    "opacity": 1
                  }
                },
                "bubble": {
                  "distance": 400,
                  "size": 40,
                  "duration": 2,
                  "opacity": 8,
                  "speed": 3
                },
                "repulse": {
                  "distance": 200,
                  "duration": 0.4
                },
                "push": {
                  "particles_nb": 4
                },
                "remove": {
                  "particles_nb": 2
                }
              }
            },
            "retina_detect": true
          });
        }
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [siteStyle]);

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
      {/* Particles background for VENOM style */}
      {siteStyle === "venom" && <div id="particles-js" className="fixed inset-0 z-0" />}

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

        /* ---- particles.js styles ---- */
        #particles-js {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: transparent;
          background-image: url("");
          background-repeat: no-repeat;
          background-size: cover;
          background-position: 50% 50%;
        }

        /* ---- stats.js ---- */
        .count-particles {
          background: #000022;
          position: absolute;
          top: 48px;
          left: 0;
          width: 80px;
          color: #13E8E9;
          font-size: .8em;
          text-align: left;
          text-indent: 4px;
          line-height: 14px;
          padding-bottom: 2px;
          font-family: Helvetica, Arial, sans-serif;
          font-weight: bold;
        }

        .js-count-particles {
          font-size: 1.1em;
        }

        #stats, .count-particles {
          -webkit-user-select: none;
          margin-top: 5px;
          margin-left: 5px;
        }

        #stats {
          border-radius: 3px 3px 0 0;
          overflow: hidden;
        }

        .count-particles {
          border-radius: 0 0 3px 3px;
        }

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

        /* legacy helpers (if still referenced somewhere) */
        .bg-neutral-850 { background-color: rgb(38 38 38); }
        .bg-neutral-925 { background-color: rgb(18 18 18); }
      `}</style>
    </div>
  );
}
