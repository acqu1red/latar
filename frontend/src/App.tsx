import { useState } from 'react';
import RoomCard from './components/RoomCard';
import { generatePlan } from './lib/api';
import type { RoomState, ApiResponse, BathroomType, BathroomConfig } from './lib/api';
import './App.css';

const initialRooms: RoomState[] = [
  { key: 'hallway', name: 'Прихожая', sqm: 0, enabled: true, file: [], connections: [] },
  { key: 'room1', name: 'Комната 1', sqm: 0, enabled: false, file: [], connections: [] },
  { key: 'room2', name: 'Комната 2', sqm: 0, enabled: false, file: [], connections: [] },
  { key: 'kitchen', name: 'Кухня', sqm: 0, enabled: false, file: [], connections: [] },
  { key: 'bathroom', name: 'Ванная комната/Санузел', sqm: 0, enabled: false, file: [], connections: [] },
  { key: 'balcony', name: 'Балкон/Лоджия', sqm: 0, enabled: false, file: [], connections: [] },
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

  const handleRoomUpdate = (key: string, updates: Partial<RoomState>) => {
    setRooms(prevRooms =>
      prevRooms.map(room => (room.key === key ? { ...room, ...updates } : room))
    );
  };

  const handleBathroomTypeChange = (type: BathroomType) => {
    setBathroomConfig(prev => ({
      ...prev,
      type,
      bathroom: { ...prev.bathroom, enabled: type === 'combined' },
      toilet: { ...prev.toilet, enabled: type === 'separate' }
    }));
  };

  const handleBathroomUpdate = (key: 'bathroom' | 'toilet', updates: Partial<RoomState>) => {
    setBathroomConfig(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
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
      if (bathroomIndex !== -1) {
        allRooms[bathroomIndex] = { ...bathroomConfig.bathroom, key: 'bathroom', name: 'Ванная комната/Санузел' };
      }
    } else {
      // Убираем обычную ванную и добавляем раздельные
      const filteredRooms = allRooms.filter(r => r.key !== 'bathroom');
      allRooms.splice(0, allRooms.length, ...filteredRooms, bathroomConfig.bathroom, bathroomConfig.toilet);
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
    const apiResponse = await generatePlan(allRooms);
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
      if (bathroomIndex !== -1) {
        allRooms[bathroomIndex] = { ...bathroomConfig.bathroom, key: 'bathroom', name: 'Ванная комната/Санузел' };
      }
    } else {
      const filteredRooms = allRooms.filter(r => r.key !== 'bathroom');
      allRooms.splice(0, allRooms.length, ...filteredRooms, bathroomConfig.bathroom, bathroomConfig.toilet);
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
                onChange={(e) => handleBathroomTypeChange(e.target.value as BathroomType)}
              />
              Совмещенный (ванная + санузел)
            </label>
            <label>
              <input
                type="radio"
                name="bathroomType"
                value="separate"
                checked={bathroomConfig.type === 'separate'}
                onChange={(e) => handleBathroomTypeChange(e.target.value as BathroomType)}
              />
              Раздельный (ванная и санузел отдельно)
            </label>
          </div>
        </div>

        <div className="rooms-grid">
          {rooms.map((room, index) => (
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
                key="bathroom"
                room={bathroomConfig.bathroom}
                onUpdate={(_key, updates) => handleBathroomUpdate('bathroom', updates)}
                submitted={submitted}
                availableRooms={[...rooms, bathroomConfig.toilet]}
              />
              <RoomCard
                key="toilet"
                room={bathroomConfig.toilet}
                onUpdate={(_key, updates) => handleBathroomUpdate('toilet', updates)}
                submitted={submitted}
                availableRooms={[...rooms, bathroomConfig.bathroom]}
              />
            </>
          )}
        </div>

        <div className="actions">
          <button 
            onClick={handleSubmit} 
            disabled={!isGenerateButtonEnabled || loading}
            className="generate-btn"
          >
            {loading ? 'Анализируем и строим...' : 'Генерировать'}
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
            <a 
              href={result.svgDataUrl || result.pngDataUrl} 
              download={`plan.${result.mode === 'svg' ? 'svg' : 'png'}`}
              className="download-btn"
            >
              Скачать {result.mode === 'svg' ? 'SVG' : 'PNG'}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
