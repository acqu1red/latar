import { useState } from 'react';
import RoomCard from './components/RoomCard';
import { generatePlan } from './lib/api';
import type { RoomState, ApiResponse, BathroomType, BathroomConfig } from './lib/api';
import './App.css';
import LayoutEditor from './components/LayoutEditor';

const initialRooms: RoomState[] = [
  { key: 'hallway', name: 'Прихожая', sqm: 0, enabled: true, file: [], layout: null, rotation: 0, description: 'Входная зона квартиры' },
  { key: 'room1', name: 'Комната 1', sqm: 0, enabled: false, file: [], layout: null, rotation: 0, description: 'Жилая комната (спальня, гостиная)' },
  { key: 'room2', name: 'Комната 2', sqm: 0, enabled: false, file: [], layout: null, rotation: 0, description: 'Дополнительная жилая комната' },
  { key: 'kitchen', name: 'Кухня', sqm: 0, enabled: false, file: [], layout: null, rotation: 0, description: 'Кухонная зона с техникой' },
  { key: 'bathroom', name: 'Уборная', sqm: 0, enabled: false, file: [], layout: null, rotation: 0, description: 'Санитарная зона (ванна, туалет)' },
  { key: 'balcony', name: 'Балкон/Лоджия', sqm: 0, enabled: false, file: [], layout: null, rotation: 0, description: 'Открытая или закрытая терраса' },
];

const initialBathroomConfig: BathroomConfig = {
  type: 'combined',
  bathroom: { key: 'bathroom', name: 'Ванная комната', sqm: 0, enabled: false, file: [] },
  toilet: { key: 'toilet', name: 'Санузел', sqm: 0, enabled: false, file: [] }
};

function App() {
  const [rooms, setRooms] = useState<RoomState[]>(initialRooms);
  const [bathroomConfig, setBathroomConfig] = useState<BathroomConfig>(initialBathroomConfig);
  const [loading, setLoading] = useState(false);
  const [globalWindows, setGlobalWindows] = useState<{ roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number }[]>([]);
  const [globalDoors, setGlobalDoors] = useState<{ roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number; type: 'entrance'|'interior' }[]>([]);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);


  const recomputeLayoutsByArea = (nextRooms: RoomState[]): RoomState[] => {
    const enabled = nextRooms.filter((r: RoomState) => r.enabled);
    if (enabled.length === 0) return nextRooms;
    
    // Размеры канвы в пикселях (соответствуют LayoutEditor)
    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 700;
    const USABLE_WIDTH = CANVAS_WIDTH * 0.9;

    // Грубая сеточная авто-раскладка без пересечений
    const total = enabled.reduce((s: number, x: RoomState) => s + (x.sqm || 20), 0);
    const BASE_MIN = 100;
    const BASE_MAX = 200;
    const referenceTotal = Math.max(BASE_MIN, Math.min(BASE_MAX, total));
    let cursorX = 20, cursorY = 20, rowH = 0;
    const GAP = 10;

    const computed = nextRooms.map(r => {
      if (!r.enabled) return r;
      const MIN_DIM = 80; // минимальная видимая величина в пикселях
      const MAX_DIM = 300; // максимальная величина в пикселях
      const sqm = r.sqm || 20; // если площадь не задана, используем 20 кв.м
      let edge = Math.sqrt(Math.max(0, sqm) / referenceTotal) * USABLE_WIDTH;
      let w = Math.max(MIN_DIM, Math.min(MAX_DIM, edge));
      let h = w;
      // Предположительная ориентация
      const degree = (r.rotation ?? 0);
      if (degree === 90) [w, h] = [h, w];
      if (cursorX + w > CANVAS_WIDTH - 20) { cursorX = 20; cursorY += rowH + GAP; rowH = 0; }
      const layout = { 
        x: cursorX / CANVAS_WIDTH, 
        y: cursorY / CANVAS_HEIGHT, 
        width: Math.min(CANVAS_WIDTH - 40, w) / CANVAS_WIDTH, 
        height: Math.min(CANVAS_HEIGHT - 40, h) / CANVAS_HEIGHT 
      };
      cursorX += layout.width * CANVAS_WIDTH + GAP; 
      rowH = Math.max(rowH, layout.height * CANVAS_HEIGHT);
      return { ...r, layout };
    });


    // Финальное устранение перекрытий: раздвижка
    for (let i = 0; i < computed.length; i++) {
      for (let j = i + 1; j < computed.length; j++) {
        const a = computed[i], b = computed[j];
        if (!a.enabled || !b.enabled || !a.layout || !b.layout) continue;
        const ax1 = a.layout.x, ay1 = a.layout.y, ax2 = ax1 + a.layout.width, ay2 = ay1 + a.layout.height;
        const bx1 = b.layout.x, by1 = b.layout.y, bx2 = bx1 + b.layout.width, by2 = by1 + b.layout.height;
        const overlapX = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
        const overlapY = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
        const gapNorm = GAP / CANVAS_WIDTH;
        if (overlapX > 0 && overlapY > 0) {
          if (overlapX >= overlapY) {
            if (ay1 < by1) b.layout.y = Math.min(1 - b.layout.height - gapNorm, ay2 + gapNorm); 
            else a.layout.y = Math.min(1 - a.layout.height - gapNorm, by2 + gapNorm);
          } else {
            if (ax1 < bx1) b.layout.x = Math.min(1 - b.layout.width - gapNorm, ax2 + gapNorm); 
            else a.layout.x = Math.min(1 - a.layout.width - gapNorm, bx2 + gapNorm);
          }
        }
      }
    }

    return computed;
  };

  const handleRoomUpdate = (key: string, updates: Partial<RoomState>) => {
    setRooms((prevRooms: RoomState[]) => {
      const next = prevRooms.map((room: RoomState) => (room.key === key ? { ...room, ...updates } : room));
      // Если изменили площадь — пересчитать авто‑раскладку
      if (Object.prototype.hasOwnProperty.call(updates, 'sqm')) {
        return recomputeLayoutsByArea(next);
      }
      return next;
    });
  };

  const handleBathroomTypeChange = (type: BathroomType) => {
    setBathroomConfig((prev: BathroomConfig) => ({
      ...prev,
      type,
      bathroom: { ...prev.bathroom, enabled: type === 'combined' },
      toilet: { ...prev.toilet, enabled: type === 'separate' }
    }));
  };

  const handleBathroomUpdate = (key: 'bathroom' | 'toilet', updates: Partial<RoomState>) => {
    setBathroomConfig((prev: BathroomConfig) => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const handleWindowsUpdate = (windows: { roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number }[]) => {
    console.log('App: Received windows update:', windows);
    setGlobalWindows(windows);
  };

  const handleDoorsUpdate = (doors: { roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number; type: 'entrance'|'interior' }[]) => {
    console.log('App: Received doors update:', doors);
    setGlobalDoors(doors);
  };

  const handleDownload = () => {
    if (!result?.pngDataUrl && !result?.svgDataUrl) {
      console.error('No image data available for download');
      return;
    }
    
    const dataUrl = result.svgDataUrl || result.pngDataUrl;
    if (!dataUrl) {
      console.error('No valid data URL found');
      return;
    }
    
    const fileExtension = 'svg';
    const mimeType = 'image/svg+xml';
    const fileName = `plan.${fileExtension}`;
    
    try {
      // Validate data URL format
      const expectedPrefix = `data:${mimeType};base64,`;
      if (!dataUrl.startsWith(expectedPrefix)) {
        console.error('Invalid data URL format. Expected:', expectedPrefix, 'Got:', dataUrl.substring(0, 50));
        return;
      }
      
      // Extract base64 data and validate
      const base64Data = dataUrl.substring(expectedPrefix.length);
      if (!base64Data || base64Data.length === 0) {
        console.error('Empty base64 data');
        return;
      }
      
      // Test if base64 is valid
      try {
        atob(base64Data.substring(0, 100)); // Test first 100 chars
      } catch (e) {
        console.error('Invalid base64 data:', e);
        return;
      }
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download initiated successfully for:', fileName);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(dataUrl, '_blank');
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setError(null);
    setResult(null);

    // Собираем все комнаты включая санузел
    const allRooms = [...rooms];
    
    if (bathroomConfig.type === 'combined') {
      // Заменяем обычную ванную на совмещенную
      const bathroomIndex = allRooms.findIndex(r => r.key === 'bathroom');
      if (bathroomIndex !== -1 && bathroomConfig.bathroom.enabled) {
        allRooms[bathroomIndex] = { ...bathroomConfig.bathroom, key: 'bathroom', name: 'Уборная' };
      }
    } else {
      // Убираем обычную ванную и добавляем раздельные
      const filteredRooms = allRooms.filter(r => r.key !== 'bathroom');
      const additionalRooms = [];
      if (bathroomConfig.bathroom.enabled) additionalRooms.push(bathroomConfig.bathroom);
      if (bathroomConfig.toilet.enabled) additionalRooms.push(bathroomConfig.toilet);
      allRooms.splice(0, allRooms.length, ...filteredRooms, ...additionalRooms);
    }

    const enabledRooms = allRooms.filter(r => r.enabled);
    if (enabledRooms.length === 0) {
      setError("Включите хотя бы одну комнату для генерации плана.");
      return;
    }

    const hasInvalidRoom = enabledRooms.some(r => r.sqm <= 0 || r.file.length === 0);
    if (hasInvalidRoom) {
      setError("Для каждой включённой комнаты необходимо указать площадь и загрузить хотя бы одно фото.");
      return;
    }

    setLoading(true);
    // Добавляем данные окон и дверей к комнатам
    // Окна и двери привязываются к конкретным комнатам через roomKey
    const allRoomsWithWindowsAndDoors = allRooms.map(room => {
      // Фильтруем окна и двери по привязке к конкретной комнате
      const roomWindows = globalWindows.filter((w: { roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number }) => w.roomKey === room.key).map((w: { roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number }) => ({
        side: w.side,
        pos: w.pos,
        len: w.len
      }));
      const roomDoors = globalDoors.filter((d: { roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number; type: 'entrance'|'interior' }) => d.roomKey === room.key).map((d: { roomKey: string; side: 'left'|'right'|'top'|'bottom'; pos: number; len: number; type: 'entrance'|'interior' }) => ({
        side: d.side,
        pos: d.pos,
        len: d.len,
        type: d.type
      }));
      
      return {
        ...room,
        windows: roomWindows,
        doors: roomDoors
      };
    });

    console.log('Sending to API - Global windows:', globalWindows);
    console.log('Sending to API - Global doors:', globalDoors);
    console.log('Sending to API - Rooms with windows/doors:', allRoomsWithWindowsAndDoors.map(r => ({ 
      key: r.key, 
      name: r.name, 
      windows: r.windows?.length || 0, 
      doors: r.doors?.length || 0 
    })));

    // Always use the new hybrid approach (SVG + DALL-E styling)
    const apiResponse = await generatePlan(allRoomsWithWindowsAndDoors, bathroomConfig);
    setLoading(false);

    if (apiResponse.ok) {
      setResult(apiResponse);
    } else {
      setError(apiResponse.error || 'Произошла неизвестная ошибка.');
    }
  };

  const isGenerateButtonEnabled = (() => {
    const allRooms = [...rooms];
    
    if (bathroomConfig.type === 'combined') {
      const bathroomIndex = allRooms.findIndex(r => r.key === 'bathroom');
      if (bathroomIndex !== -1 && bathroomConfig.bathroom.enabled) {
        allRooms[bathroomIndex] = { ...bathroomConfig.bathroom, key: 'bathroom', name: 'Уборная' };
      }
    } else {
      const filteredRooms = allRooms.filter(r => r.key !== 'bathroom');
      const additionalRooms = [];
      if (bathroomConfig.bathroom.enabled) additionalRooms.push(bathroomConfig.bathroom);
      if (bathroomConfig.toilet.enabled) additionalRooms.push(bathroomConfig.toilet);
      allRooms.splice(0, allRooms.length, ...filteredRooms, ...additionalRooms);
    }
    
    return allRooms.some(r => r.enabled && r.sqm > 0 && r.file.length > 0);
  })();

  return (
    <div className="container">
      <header>
        <h1>Генератор 2D-плана по фото</h1>
        <p>Загрузите фотографии ваших комнат, укажите их площадь, и мы сгенерируем для вас 2D-план.</p>
      </header>
      
      <main>

        <div className="bathroom-type-selector">
          <h3>Тип санузла:</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="bathroomType"
                value="combined"
                checked={bathroomConfig.type === 'combined'}
                onChange={(e: any) => handleBathroomTypeChange(e.target.value as BathroomType)}
              />
              Совмещенный (ванная + санузел)
            </label>
            <label>
              <input
                type="radio"
                name="bathroomType"
                value="separate"
                checked={bathroomConfig.type === 'separate'}
                onChange={(e: any) => handleBathroomTypeChange(e.target.value as BathroomType)}
              />
              Раздельный (ванная и санузел отдельно)
            </label>
          </div>
        </div>

        <div className="rooms-grid">
          {rooms.map((room: RoomState, index: number) => (
            <div
              key={room.key}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RoomCard
                room={room}
                onUpdate={handleRoomUpdate}
                submitted={submitted}
                availableRooms={rooms}
              />
            </div>
          ))}
          
          {bathroomConfig.type === 'separate' && (
            <>
              <RoomCard
                room={bathroomConfig.bathroom}
                onUpdate={(_key, updates) => handleBathroomUpdate('bathroom', updates)}
                submitted={submitted}
                availableRooms={rooms}
              />
              <RoomCard
                room={bathroomConfig.toilet}
                onUpdate={(_key, updates) => handleBathroomUpdate('toilet', updates)}
                submitted={submitted}
                availableRooms={rooms}
              />
            </>
          )}
        </div>

        {/* Collapsible Layout Editor — placed below rooms and above the Generate button */}
        <div className={`constructor-wrapper ${editorOpen ? 'open' : 'closed'}`}>
          <button
            type="button"
            className={`constructor-toggle ${editorOpen ? 'active' : ''}`}
            onClick={() => setEditorOpen((o: boolean) => !o)}
          >
            {editorOpen ? 'Скрыть конструктор расположения' : 'Открыть конструктор расположения'}
          </button>
          <div className="constructor-panel" aria-hidden={!editorOpen}>
            <div className="constructor-panel-inner">
              <h3>Мини‑конструктор расположения комнат</h3>
              <p className="constructor-hint">Перетаскивайте и меняйте размер. Размеры автоматически подстраиваются под площадь (м²), позиции — настраивайте вручную.</p>
              <LayoutEditor 
                rooms={rooms} 
                onUpdate={handleRoomUpdate}
                onWindowsUpdate={handleWindowsUpdate}
                onDoorsUpdate={handleDoorsUpdate}
              />
            </div>
          </div>
        </div>

        <div className="actions">
          <button 
            onClick={handleSubmit} 
            disabled={!isGenerateButtonEnabled || loading}
            className="generate-btn"
          >
            {loading ? 'Анализируем фото и генерируем план...' : 'Генерировать план'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="spinner"></div>}

        {result?.ok && (
          <div className="result-container">
            <h2>Ваш план готов!</h2>
            <img 
              src={result.svgDataUrl || result.pngDataUrl} 
              alt="Generated Floor Plan" 
              className="result-image"
            />
            <button 
              onClick={handleDownload}
              className="download-btn"
            >
              Скачать {result.mode === 'svg' ? 'SVG' : 'PNG'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
