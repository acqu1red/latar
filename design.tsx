import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Mic,
  Image as ImageIcon,
  Folder,
  Paperclip,
  Bell,
  ChevronLeft,
  Send,
  ChevronDown,
  Layers,
  Palette,
  Check,
  ChevronRight,
} from "lucide-react";

/**
 * Plan AI landing (React + Tailwind)
 * 1) Tailwind required
 * 2) npm i framer-motion lucide-react
 * 3) Put this file in app/page.tsx (or pages/index.tsx)
 */

// ==========================
// Small pure helper + tests
// ==========================
export type ModelKey = "3d" | "techplan" | "cleanup";
export type TechplanMode = "with" | "without" | null;

export function computeCanSend(model: ModelKey, query: string, techplanMode: TechplanMode) {
  if (model === "3d") return query.trim().length > 0;
  if (model === "techplan") return techplanMode !== null;
  return false; // cleanup
}

// Lightweight runtime tests (only in browser; run once)
if (typeof window !== "undefined" && !(window as any).__grokTestsDone) {
  (window as any).__grokTestsDone = true;
  console.assert(computeCanSend("3d", "hello", null) === true, "3D: text enables send");
  console.assert(computeCanSend("3d", "   ", null) === false, "3D: empty disables send");
  console.assert(computeCanSend("techplan", "", null) === false, "Techplan: no mode disables send");
  console.assert(computeCanSend("techplan", "", "with") === true, "Techplan: 'with' enables send");
  console.assert(computeCanSend("techplan", "", "without") === true, "Techplan: 'without' enables send");
  console.assert(computeCanSend("cleanup", "anything", null) === false, "Cleanup: disabled");
}

/* =========================
   Background Particles (particles.js + stats.js)
   ========================= */
function BackgroundParticles() {
  useEffect(() => {
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
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

        (window as any).particlesJS("particles-js", {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 } },
            opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: "#7aa2ff", opacity: 0.45, width: 1 },
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
        const StatsC: any = (window as any).Stats;
        if (StatsC) {
          const sInst = new StatsC();
          sInst.setMode(0);
          sInst.domElement.style.position = "absolute";
          sInst.domElement.style.left = "0px";
          sInst.domElement.style.top = "0px";
          document.body.appendChild(sInst.domElement);

          const count = document.querySelector(".js-count-particles") as HTMLElement | null;
          const update = () => {
            sInst.begin();
            sInst.end();
            const pJSDom = (window as any).pJSDom;
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
      {/* счётчик (можно скрыть/удалить) */}
      <div className="count-particles hidden md:block">
        <span className="js-count-particles">--</span> particles
      </div>
      {/* инлайновые стили */}
      <style>{`
        #particles-js{position:fixed;inset:0;width:100%;height:100%;background:transparent;z-index:0;pointer-events:none;}
        canvas{display:block;vertical-align:bottom;}
        .count-particles{
          background:rgba(0,0,34,.6);position:fixed;top:48px;left:0;width:100px;color:#13E8E9;
          font-size:.8em;text-align:left;text-indent:4px;line-height:14px;padding-bottom:2px;font-family:Helvetica,Arial,sans-serif;
          font-weight:bold;border-radius:0 0 3px 0;z-index:50;
        }
        #stats{border-radius:3px 3px 0 0;overflow:hidden;position:fixed!important;top:0;left:0;z-index:50}
      `}</style>
    </>
  );
}

export default function GrokStyleHome() {
  return (
    <div className="relative min-h-screen w-full bg-[#0b0b0e] text-neutral-200 antialiased">
      <BackgroundParticles />
      <div className="relative z-10 grid grid-cols-[260px_1fr] min-h-screen">
        <Sidebar />
        <MainArea />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-sm">
      {/* Top: search */}
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 hover:ring-white/20 transition">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            placeholder="Поиск ⌘K"
            className="bg-transparent placeholder:text-neutral-500 text-sm outline-none w-full"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 text-sm">
        <SectionTitle>Главное</SectionTitle>
        <NavItem active Icon={MessageSquare} label="Чат" />
        <NavItem Icon={Mic} label="Голос" />
        <div className="relative">
          <NavItem Icon={ImageIcon} label="Imagine" />
          <span className="absolute left-[30px] top-2 h-2 w-2 rounded-full bg-sky-400" />
        </div>
        <NavItem Icon={Folder} label="Проекты" />
        <SectionTitle className="mt-2">История</SectionTitle>
        <HistoryLink label="Вчера" />
        <HistoryLink label="Анализ противоречий в зако…" />
        <HistoryLink label="Пробелы в законах против т…" />
        <HistoryLink label="Тенденции уголовной полити…" />
        <HistoryDate label="September" />
        <HistoryLink label="Гражданско-правовое регули…" />
        <HistoryLink label="Смежные права: понятие, об…" />
        <HistoryDate label="May" />
        <HistoryLink label="Защита прав безработных: а…" />
        <HistoryLink label="Анализ нового закона о зан…" />
        <HistoryDate label="April" />
        <HistoryLink label="Психологический тест на ос…" />
      </nav>

      <div className="mt-auto px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-white/10 grid place-items-center">D</div>
        </div>
        <button className="text-neutral-500 hover:text-neutral-300 transition" title="Свернуть">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-2 pb-1 pt-4 text-[11px] uppercase tracking-wider text-neutral-500 ${className}`}>
      {children}
    </div>
  );
}

function NavItem({
  Icon,
  label,
  active,
}: {
  Icon: any;
  label: string;
  active?: boolean;
}) {
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

function HistoryLink({ label }: { label: string }) {
  return (
    <a className="block py-1.5 px-3 text-neutral-400 hover:text-neutral-200 hover:bg-white/5 rounded-md truncate cursor-pointer">
      {label}
    </a>
  );
}

function HistoryDate({ label }: { label: string }) {
  return (
    <div className="px-3 pt-4 pb-1 text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
  );
}

function MainArea() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <main className="relative">
      <TopBar />

      <div className="mx-auto max-w-3xl px-6 pt-20">
        <LogoMark />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <SearchBar onAdvanced={() => setShowAdvanced(true)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="mt-6"
        >
          {showAdvanced ? <AdvancedRow /> : <PromoCard />}
        </motion.div>
      </div>

      <SuperBanner />
    </main>
  );
}

function TopBar() {
  return (
    <div className="flex h-14 items-center justify-end px-6 border-b border-white/5 bg-black/10 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-neutral-400">Приватный</span>
        <button className="rounded-full p-2 hover:bg-white/5" title="Уведомления">
          <Bell className="h-5 w-5 text-neutral-300" />
        </button>
      </div>
    </div>
  );
}

function LogoMark() {
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

// ==========================
// Search Bar
// ==========================
function SearchBar({ onAdvanced }: { onAdvanced?: () => void }) {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState<ModelKey>("techplan"); // default: techplan, no option selected
  const [techplanMode, setTechplanMode] = useState<TechplanMode>(null);

  const canSend = computeCanSend(model, query, techplanMode);

  return (
    <div className="relative z-20 mt-8 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <div className="flex items-center gap-3 px-4 md:px-6">
        <Paperclip className="h-5 w-5 text-neutral-400" />

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
            <ToggleChip
              label="С мебелью"
              active={techplanMode === "with"}
              onClick={() => {
                setTechplanMode("with");
                onAdvanced?.();
              }}
            />
            <ToggleChip
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
          <ModelMenu
            value={model}
            onChange={(m) => {
              setModel(m);
              onAdvanced?.();
            }}
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
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
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

// ==========================
// Model Menu (dropdown) with inline SVG icons (no CDN dependency)
// ==========================
function ModelMenu({
  value,
  onChange,
}: {
  value: ModelKey;
  onChange: (m: ModelKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const items: { key: ModelKey; label: string; sub: string; Icon: any }[] = [
    { key: "techplan", label: "Создание по техплану", sub: "Перерисовать 2D план из фото техплана", Icon: IconTechplan },
    { key: "cleanup", label: "Удаление объектов", sub: "Очистить фото комнаты от мебели и мусора", Icon: IconCleanup },
    { key: "3d", label: "3D план", sub: "Сгенерировать 3D-просмотр из данных плана", Icon: Icon3D },
  ];

  const current = items.find((i) => i.key === value)!;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
      >
        <current.Icon className="h-4 w-4" />
        <span>{current.label}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 z-40 w-[360px] rounded-2xl bg-[#2a2d36] text-neutral-100 shadow-2xl ring-1 ring-white/10 overflow-hidden">
          {items.map((it, idx) => (
            <button
              key={it.key}
              onClick={() => {
                onChange(it.key);
                setOpen(false);
              }}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/10 ${idx !== items.length - 1 ? "border-b border-white/10" : ""}`}
            >
              <it.Icon className="mt-0.5 h-5 w-5 text-neutral-200" />
              <div className="flex-1">
                <div className="text-[15px] font-medium">{it.label}</div>
                <div className="text-xs text-neutral-300">{it.sub}</div>
              </div>
              {value === it.key && <Check className="h-5 w-5" />}
            </button>
          ))}
          {/* Optional footer row like in screenshot */}
          <div className="px-4 py-2 text-xs text-neutral-300 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="opacity-80">Индивидуальные настройки</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-70" />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline SVG icons to avoid CDN icon fetch issues
function IconTechplan({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16M4 9h10M4 13h16M4 17h8" />
    </svg>
  );
}
function IconCleanup({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
    </svg>
  );
}
function Icon3D({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
      <path d="M12 7l7 4M12 7L5 11M12 21V7" />
    </svg>
  );
}

function PromoCard() {
  return (
    <div className="relative z-10 overflow-hidden rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-[#171b24] via-[#141827] to-[#0c0e14] mx-auto max-w-2xl">
      {/* Full-bleed media area inside a narrower card */}
      <div className="relative w-full h-56 md:h-80">
        {/* TIP: помести свой файл в /public/promo-floor.jpg для локального билда */}
        <img
          alt="promo"
          className="absolute inset-0 h-full w-full object-cover"
          src="/promo-floor.jpg"
        />
        {/* subtle 2D grid / circuit overlay for 2D/3D plan vibe */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px),repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
      </div>

      {/* Text and CTA perfectly aligned */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="rounded-md inline-block bg-black/60 px-2.5 py-1 text-xs ring-1 ring-white/10 mb-2">Реклама функции</div>
            <div className="text-base md:text-xl font-semibold leading-tight">Вообрази что угодно</div>
            <div className="text-xs md:text-sm text-neutral-300">Фотореалистичные 2D/3D планы квартир в стиле Plan AI</div>
          </div>
          <button className="shrink-0 rounded-lg bg-white/90 text-black px-4 py-2 text-xs md:text-sm hover:bg-white transition">Перейти</button>
        </div>
      </div>
    </div>
  );
}

function AdvancedRow() {
  const [bgOpen, setBgOpen] = useState(false);
  const [bg, setBg] = useState<string | null>(null);

  const bgOptions = [
    "Тёмный премиум",
    "Светлый",
    "VENOM",
    "DNA-liquid",
    "Графит",
    "Шахматный",
    "Чистый",
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Chip 1: Параметры плана */}
      <button className="flex items-center gap-2 rounded-full px-5 py-3 ring-1 ring-white/10 bg-white/5 hover:bg-white/10">
        <ImageIcon className="h-5 w-5" />
        <span className="text-base">Параметры плана</span>
      </button>

      {/* Chip 2: Слои */}
      <button className="flex items-center gap-2 rounded-full px-5 py-3 ring-1 ring-white/10 bg-white/5 hover:bg-white/10">
        <Layers className="h-5 w-5" />
        <span className="text-base">Слои</span>
      </button>

      {/* Chip 3: Фоны (dropdown) */}
      <div className="relative">
        <button
          onClick={() => setBgOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full px-5 py-3 ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
        >
          <Palette className="h-5 w-5" />
          <span className="text-base">{bg ? `Фон: ${bg}` : "Фоны"}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
        {bgOpen && (
          <div className="absolute left-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0b0b0e] p-1 shadow-xl">
            {bgOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setBg(opt);
                  setBgOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 ${
                  bg === opt ? "bg-white/10" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SuperBanner() {
  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-20">
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-lg shadow-2xl">
        <div>
          <div className="text-sm font-medium">Grok 3D</div>
          <div className="text-xs text-neutral-400">Разблокируй расширенные возможности</div>
        </div>
        <button className="rounded-xl bg-white/90 text-black px-4 py-2 text-sm hover:bg-white transition">Улучшить</button>
      </div>
    </div>
  );
}
