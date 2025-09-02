import { useState } from 'react';
import RoomCard from './components/RoomCard';
import { generatePlan } from './lib/api';
import type { RoomState, ApiResponse } from './lib/api';
import './App.css';

const initialRooms: RoomState[] = [
  { key: 'room1', name: 'Комната 1', sqm: 0, enabled: false, file: null },
  { key: 'room2', name: 'Комната 2', sqm: 0, enabled: false, file: null },
  { key: 'kitchen', name: 'Кухня', sqm: 0, enabled: false, file: null },
  { key: 'bathroom', name: 'Ванная комната/Санузел', sqm: 0, enabled: false, file: null },
  { key: 'balcony', name: 'Балкон/Лоджия', sqm: 0, enabled: false, file: null },
];

function App() {
  const [rooms, setRooms] = useState<RoomState[]>(initialRooms);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRoomUpdate = (key: string, updates: Partial<RoomState>) => {
    setRooms(prevRooms =>
      prevRooms.map(room => (room.key === key ? { ...room, ...updates } : room))
    );
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setError(null);
    setResult(null);

    const enabledRooms = rooms.filter(r => r.enabled);
    if (enabledRooms.length === 0) {
      setError("Включите хотя бы одну комнату для генерации плана.");
      return;
    }

    const hasInvalidRoom = enabledRooms.some(r => r.sqm <= 0 || !r.file);
    if (hasInvalidRoom) {
      setError("Для каждой включённой комнаты необходимо указать площадь и загрузить фото.");
      return;
    }

    setLoading(true);
    const apiResponse = await generatePlan(rooms);
    setLoading(false);

    if (apiResponse.ok) {
      setResult(apiResponse);
    } else {
      setError(apiResponse.error || 'Произошла неизвестная ошибка.');
    }
  };

  const isGenerateButtonEnabled = rooms.some(r => r.enabled && r.sqm > 0 && r.file);

  return (
    <div className="container">
      <header>
        <h1>Генератор 2D-плана по фото</h1>
        <p>Загрузите фотографии ваших комнат, укажите их площадь, и мы сгенерируем для вас 2D-план.</p>
      </header>
      
      <main>
        <div className="rooms-grid">
          {rooms.map(room => (
            <RoomCard
              key={room.key}
              room={room}
              onUpdate={handleRoomUpdate}
              submitted={submitted}
            />
          ))}
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
