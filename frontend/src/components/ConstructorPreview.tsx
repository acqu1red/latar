import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Square, Plus } from 'lucide-react';

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  color: string;
}

const ROOM_TEMPLATES = [
  { name: 'Гостиная', width: 120, height: 100, color: '#8b5cf6' },
  { name: 'Спальня', width: 100, height: 100, color: '#3b82f6' },
  { name: 'Кухня', width: 80, height: 100, color: '#10b981' },
  { name: 'Ванная', width: 60, height: 60, color: '#f59e0b' },
  { name: 'Коридор', width: 140, height: 60, color: '#ef4444' },
];

const SNAP_DISTANCE = 5; // Расстояние для прилипания к другим блокам
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

export const ConstructorPreview: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [draggedRoom, setDraggedRoom] = useState<string | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Проверка пересечения с другими комнатами
  const checkCollision = (room: Room, otherRooms: Room[]) => {
    return otherRooms.some(other => {
      if (other.id === room.id) return false;
      return !(
        room.x + room.width <= other.x ||
        room.x >= other.x + other.width ||
        room.y + room.height <= other.y ||
        room.y >= other.y + other.height
      );
    });
  };

  // Функция прилипания к другим блокам
  const snapToRooms = (x: number, y: number, width: number, height: number, otherRooms: Room[]) => {
    let snappedX = x;
    let snappedY = y;

    otherRooms.forEach(other => {
      // Прилипание по горизонтали
      if (Math.abs((x + width) - other.x) < SNAP_DISTANCE && 
          !(y + height <= other.y || y >= other.y + other.height)) {
        snappedX = other.x - width; // Прилипание справа к левому краю
      }
      if (Math.abs(x - (other.x + other.width)) < SNAP_DISTANCE &&
          !(y + height <= other.y || y >= other.y + other.height)) {
        snappedX = other.x + other.width; // Прилипание слева к правому краю
      }

      // Прилипание по вертикали
      if (Math.abs((y + height) - other.y) < SNAP_DISTANCE &&
          !(x + width <= other.x || x >= other.x + other.width)) {
        snappedY = other.y - height; // Прилипание снизу к верхнему краю
      }
      if (Math.abs(y - (other.y + other.height)) < SNAP_DISTANCE &&
          !(x + width <= other.x || x >= other.x + other.width)) {
        snappedY = other.y + other.height; // Прилипание сверху к нижнему краю
      }
    });

    return { x: snappedX, y: snappedY };
  };

  const handleDragStart = (roomId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedRoom(roomId);
  };

  const handleDragNewRoom = (template: typeof ROOM_TEMPLATES[0], e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingNew(true);
    
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      name: template.name,
      color: template.color
    };
    
    setRooms(prev => [...prev, newRoom]);
    setDraggedRoom(newRoom.id);
    setDragOffset({ x: template.width / 2, y: template.height / 2 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedRoom || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x;
    let y = e.clientY - rect.top - dragOffset.y;

    const currentRoom = rooms.find(r => r.id === draggedRoom);
    if (!currentRoom) return;

    // Ограничение в пределах канваса
    x = Math.max(0, Math.min(x, CANVAS_WIDTH - currentRoom.width));
    y = Math.max(0, Math.min(y, CANVAS_HEIGHT - currentRoom.height));

    // Применяем прилипание к другим комнатам
    const otherRooms = rooms.filter(r => r.id !== draggedRoom);
    const snapped = snapToRooms(x, y, currentRoom.width, currentRoom.height, otherRooms);
    x = snapped.x;
    y = snapped.y;

    // Создаем потенциальную новую позицию
    const newRoom = { ...currentRoom, x, y };
    
    // Проверяем коллизии
    if (!checkCollision(newRoom, otherRooms)) {
      setRooms(prev => prev.map(room => 
        room.id === draggedRoom ? newRoom : room
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedRoom(null);
    setIsDraggingNew(false);
  };

  const handleGenerate = () => {
    navigate('/new');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Левая часть - Этапы работы */}
      <div className="space-y-6">
        {/* Этап 1 */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex gap-6 p-6 rounded-md border border-white/10 hover:border-white/30 transition-all duration-500">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <div className="text-white/80 font-bold text-lg">1</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Добавьте комнаты
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Перетащите комнаты из списка справа в рабочую область
              </p>
            </div>
          </div>
        </div>

        {/* Этап 2 */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex gap-6 p-6 rounded-md border border-white/10 hover:border-white/30 transition-all duration-500">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <div className="text-white/80 font-bold text-lg">2</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Расположите помещения
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Перемещайте комнаты и формируйте планировку вашего помещения
              </p>
            </div>
          </div>
        </div>

        {/* Этап 3 */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex gap-6 p-6 rounded-md border border-white/10 hover:border-white/30 transition-all duration-500">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <Sparkles className="h-6 w-6 text-white/80" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Генерируйте с ИИ
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Нажмите кнопку генерации и получите готовую планировку с расстановкой мебели
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Правая часть - Рабочая зона и легенда */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {/* Рабочая область */}
          <div 
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-md border-2 border-white/20 overflow-hidden cursor-default flex-shrink-0"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          >
            {/* Комнаты без подписей */}
            {rooms.map(room => (
              <div
                key={room.id}
                onMouseDown={(e) => handleDragStart(room.id, e)}
                className="absolute cursor-move transition-shadow hover:shadow-lg select-none"
                style={{
                  left: room.x,
                  top: room.y,
                  width: room.width,
                  height: room.height,
                  backgroundColor: room.color + '33',
                  border: `2px solid ${room.color}`,
                  borderRadius: '4px',
                }}
              />
            ))}

            {/* Подсказка если пусто */}
            {rooms.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-md border-2 border-dashed border-white/20">
                    <Plus className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/40 text-sm">
                    Перетащите комнаты сюда
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Панель с типами комнат (Легенда) */}
          <div 
            className="flex flex-col justify-between flex-shrink-0" 
            style={{ width: '180px', height: CANVAS_HEIGHT }}
          >
            {ROOM_TEMPLATES.map((template, index) => (
              <div
                key={index}
                onMouseDown={(e) => handleDragNewRoom(template, e)}
                className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-grab active:cursor-grabbing group"
              >
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: template.color + '33', border: `2px solid ${template.color}` }}
                >
                  <Square className="h-4 w-4" style={{ color: template.color }} />
                </div>
                <span className="text-white text-sm font-medium group-hover:text-white/90 flex-1">
                  {template.name}
                </span>
                <Plus className="h-4 w-4 text-white/40 group-hover:text-white/60 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка генерации под рабочей зоной */}
        <div>
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-md bg-white/10 hover:bg-white/15 text-white font-bold transition-all duration-300 border border-white/20"
          >
            <Sparkles className="h-5 w-5" />
            <span>Сгенерировать</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

