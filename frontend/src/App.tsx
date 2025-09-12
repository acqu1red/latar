import { useMemo, useState } from 'react';
import RoomCard from './components/RoomCard';
import { generatePlan } from './lib/api';
import type { RoomState, ApiResponse, BathroomType, BathroomConfig } from './lib/api';
import './App.css';
import LayoutEditor from './components/LayoutEditor';

const initialRooms: RoomState[] = [  { key: 'hallway', name: 'Прихожая', sqm: 0, enabled: true, file: [], connections: [], layout: null, description: 'Входная зона квартиры' },
  { key: 'room1', name: 'Комната 1', sqm: 0, enabled: false, file: [], connections: [], layout: null, description: 'Жилая комната (спальня, гостиная)' },
  { key: 'room2', name: 'Комната 2', sqm: 0, enabled: false, file: [], connections: [], layout: null, description: 'Дополнительная жилая комната' },
  { key: 'kitchen', name: 'Кухня', sqm: 0, enabled: false, file: [], connections: [], layout: null, description: 'Кухонная зона с техникой' },
  { key: 'bathroom', name: 'Уборная', sqm: 0, enabled: false, file: [], connections: [], layout: null, description: 'Санитарная зона (ванна, туалет)' },
  { key: 'balcony', name: 'Балкон/Лоджия', sqm: 0, enabled: false, file: [], connections: [], layout: null, description: 'Открытая или закрытая терраса' },
];

const initialBathroomConfig: BathroomConfig = {
  type: 'combined',
  bathroom: { key: 'bathroom', name: 'Ванная комната', sqm: 0, enabled: false, file: [], connections: [] },
  toilet: { key: 'toilet', name: 'Санузел', sqm: 0, enabled: false, file: [], connections: [] }
};

function App() {
  const [rooms, setRooms] = useState<RoomState[]>(initialRooms);
  const [bathroomConfig, setBathroomConfig] = useState<BathroomConfig>(initialBathroomConfig);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);

  // Total enabled area for auto sizing
  const totalEnabledSqm = useMemo<number>(() => rooms.filter((r: RoomState) => r.enabled).reduce((s: number, r: RoomState) => s + (r.sqm || 0), 0), [rooms]);

  const recomputeLayoutsByArea = (nextRooms: RoomState[]): RoomState[] => {
    const enabled = nextRooms.filter((r: RoomState) => r.enabled && r.sqm > 0);
    if (enabled.length === 0 || totalEnabledSqm <= 0) return nextRooms;
    const USABLE = 0.86; // доля холста под план (по шир/высоте)
    return nextRooms.map(r => {
      if (!r.enabled || r.sqm <= 0) return r;
      const share = Math.max(0, r.sqm) / Math.max(1e-6, enabled.reduce((s: number, x: RoomState) => s + x.sqm, 0));
      const size = Math.sqrt(share) * USABLE; // нормал. ширина/высота исходя из площади
      const layout = r.layout || { x: Math.random() * (1 - size), y: Math.random() * (1 - size), width: size, height: size };
      return { ...r, layout: { x: layout.x, y: layout.y, width: size, height: size } };
    });
  };

  const handleRoomUpdate = (key: string, updates: Partial<RoomState>) => {
    setRooms((prevRooms: RoomState[]) => {
      const next = prevRooms.map((room: RoomState) => (room.key === key ? { ...room, ...updates } : room));
      // Если изменили площадь — пересчитать размеры автоматически
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

  const handleDownload = () => {
    if (!result?.pngDataUrl && !result?.svgDataUrl) {
      console.error('No image data available for download');
      return;
    }
    
    const dataUrl = result.pngDataUrl || result.svgDataUrl;
    if (!dataUrl) {
      console.error('No valid data URL found');
      return;
    }
    
    const fileExtension = result.mode === 'svg' ? 'svg' : 'png';
    const mimeType = result.mode === 'svg' ? 'image/svg+xml' : 'image/png';
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
    // Always use the new hybrid approach (SVG + DALL-E styling)
    const apiResponse = await generatePlan(allRooms, bathroomConfig);
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
                availableRooms={[...rooms, bathroomConfig.toilet]}
              />
              <RoomCard
                room={bathroomConfig.toilet}
                onUpdate={(_key, updates) => handleBathroomUpdate('toilet', updates)}
                submitted={submitted}
                availableRooms={[...rooms, bathroomConfig.bathroom]}
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
              <LayoutEditor rooms={rooms} onUpdate={handleRoomUpdate} />
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
