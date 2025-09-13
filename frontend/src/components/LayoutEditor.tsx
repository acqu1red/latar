import React, { useMemo, useRef, useState } from 'react';
import type { RoomState } from '../lib/api';

interface LayoutEditorProps {
  rooms: RoomState[];
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
}

// Константы для пиксельной системы
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
const GRID_SIZE = 20;
const WINDOW_MIN_LENGTH = 60;
const WINDOW_MAX_LENGTH = 200;
const SNAP_DISTANCE = 15;

type FloatingWindow = { 
  id: number; 
  x: number; 
  y: number; 
  length: number; 
  rotation: 0 | 90; 
  type: 'window';
  isDragging?: boolean;
  isResizing?: boolean;
};

type WindowAttachment = {
  roomKey: string;
  side: 'left' | 'right' | 'top' | 'bottom';
  position: number; // позиция на стене (0-1)
  length: number; // длина на стене (0-1)
  pixelX: number; // точные пиксельные координаты
  pixelY: number;
  pixelLength: number;
};

// Простая канва для расстановки комнат в пикселях
const LayoutEditor: React.FC<LayoutEditorProps> = ({ rooms, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{
    key: string | number;
    item: any;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    start: any;
    resizeHandle?: string;
  } | null>(null);
  
  const [floatingWindows, setFloatingWindows] = useState<FloatingWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<{ roomKey: string; index: number } | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<{
    windowId: number;
    attachment: WindowAttachment;
  } | null>(null);
  const [snappingRoom, setSnappingRoom] = useState<string | null>(null);

  const enabledRooms = useMemo(() => rooms.filter(r => r.enabled), [rooms]);

  // Конвертация из нормализованных координат в пиксели
  const toPixels = (normalized: { x: number; y: number; width: number; height: number }) => ({
    x: Math.round(normalized.x * CANVAS_WIDTH),
    y: Math.round(normalized.y * CANVAS_HEIGHT),
    width: Math.round(normalized.width * CANVAS_WIDTH),
    height: Math.round(normalized.height * CANVAS_HEIGHT)
  });

  // Конвертация из пикселей в нормализованные координаты
  const toNormalized = (pixels: { x: number; y: number; width: number; height: number }) => ({
    x: pixels.x / CANVAS_WIDTH,
    y: pixels.y / CANVAS_HEIGHT,
    width: pixels.width / CANVAS_WIDTH,
    height: pixels.height / CANVAS_HEIGHT
  });

  // Поиск ближайшей стены для привязки окна
  const findNearestWall = (window: FloatingWindow): WindowAttachment | null => {
    let bestAttachment: WindowAttachment | null = null;
    let minDistance = Infinity;

    for (const room of enabledRooms) {
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      // Проверяем все 4 стены комнаты
      const walls = [
        { side: 'left' as const, x: roomPixels.x, y: roomPixels.y, width: 0, height: roomPixels.height },
        { side: 'right' as const, x: roomPixels.x + roomPixels.width, y: roomPixels.y, width: 0, height: roomPixels.height },
        { side: 'top' as const, x: roomPixels.x, y: roomPixels.y, width: roomPixels.width, height: 0 },
        { side: 'bottom' as const, x: roomPixels.x, y: roomPixels.y + roomPixels.height, width: roomPixels.width, height: 0 }
      ];

      for (const wall of walls) {
        const distance = calculateDistanceToWall(window, wall);
        
        if (distance < minDistance && distance <= SNAP_DISTANCE) {
          minDistance = distance;
          
          // Вычисляем позицию на стене
          let position: number;
          let pixelX: number, pixelY: number, pixelLength: number;
          
          if (wall.side === 'left' || wall.side === 'right') {
            // Вертикальная стена
            const wallLength = wall.height;
            const relativeY = window.y - wall.y;
            position = Math.max(0, Math.min(1, relativeY / wallLength));
            pixelX = wall.x;
            pixelY = wall.y + relativeY;
            pixelLength = Math.min(window.length, wallLength * 0.8);
          } else {
            // Горизонтальная стена
            const wallLength = wall.width;
            const relativeX = window.x - wall.x;
            position = Math.max(0, Math.min(1, relativeX / wallLength));
            pixelX = wall.x + relativeX;
            pixelY = wall.y;
            pixelLength = Math.min(window.length, wallLength * 0.8);
          }

          bestAttachment = {
            roomKey: room.key,
            side: wall.side,
            position,
            length: pixelLength / (wall.side === 'left' || wall.side === 'right' ? wall.height : wall.width),
            pixelX,
            pixelY,
            pixelLength
          };
        }
      }
    }

    return bestAttachment;
  };

  // Вычисление расстояния от окна до стены
  const calculateDistanceToWall = (window: FloatingWindow, wall: any): number => {
    if (wall.side === 'left' || wall.side === 'right') {
      // Вертикальная стена
      const wallX = wall.x;
      const wallY1 = wall.y;
      const wallY2 = wall.y + wall.height;
      
      if (window.y < wallY1) {
        return Math.sqrt((window.x - wallX) ** 2 + (window.y - wallY1) ** 2);
      } else if (window.y > wallY2) {
        return Math.sqrt((window.x - wallX) ** 2 + (window.y - wallY2) ** 2);
      } else {
        return Math.abs(window.x - wallX);
      }
    } else {
      // Горизонтальная стена
      const wallY = wall.y;
      const wallX1 = wall.x;
      const wallX2 = wall.x + wall.width;
      
      if (window.x < wallX1) {
        return Math.sqrt((window.x - wallX1) ** 2 + (window.y - wallY) ** 2);
      } else if (window.x > wallX2) {
        return Math.sqrt((window.x - wallX2) ** 2 + (window.y - wallY) ** 2);
      } else {
        return Math.abs(window.y - wallY);
      }
    }
  };

  // Обработка начала перетаскивания
  const handlePointerDown = (e: React.PointerEvent, item: RoomState | FloatingWindow, type: 'move' | 'resize', resizeHandle?: string) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const isWindow = 'length' in item;

    if (isWindow) {
      setDrag({
        key: item.id,
        item,
        type,
        startX: x,
        startY: y,
        start: { x: item.x, y: item.y, length: item.length, rotation: item.rotation }
      });
      
      // Обновляем состояние окна
      setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
        w.id === item.id 
          ? { ...w, isDragging: type === 'move', isResizing: type === 'resize' }
          : w
      ));
    } else {
      const layout = item.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      setDrag({
        key: item.key,
        item,
        type,
        startX: x,
        startY: y,
        start: { x: roomPixels.x, y: roomPixels.y, width: roomPixels.width, height: roomPixels.height },
        resizeHandle
      });
    }

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // Проверка пересечения комнат
  const checkRoomCollision = (roomKey: string, x: number, y: number, width: number, height: number): boolean => {
    for (const room of enabledRooms) {
      if (room.key === roomKey) continue;
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      // Проверяем пересечение прямоугольников
      if (x < roomPixels.x + roomPixels.width && 
          x + width > roomPixels.x && 
          y < roomPixels.y + roomPixels.height && 
          y + height > roomPixels.y) {
        return true;
      }
    }
    return false;
  };

  // Умное выравнивание
  const smartAlign = (value: number, snapDistance: number = 20): number => {
    const gridSize = GRID_SIZE;
    const snapThreshold = snapDistance;
    
    // Выравнивание по сетке
    const gridSnap = Math.round(value / gridSize) * gridSize;
    if (Math.abs(value - gridSnap) < snapThreshold) {
      return gridSnap;
    }
    
    return value;
  };

  // Обработка движения мыши
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const dx = currentX - drag.startX;
    const dy = currentY - drag.startY;

    if ('length' in drag.item) {
      // Перетаскивание плавающего окна
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - drag.item.length, drag.start.x + dx));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - drag.item.length, drag.start.y + dy));
      
      if (drag.type === 'resize') {
        const newLength = Math.max(WINDOW_MIN_LENGTH, Math.min(WINDOW_MAX_LENGTH, drag.start.length + (drag.item.rotation === 0 ? dx : dy)));
        
        setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
          w.id === drag.item.id 
            ? { ...w, x: newX, y: newY, length: newLength }
            : w
        ));
      } else {
        setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
          w.id === drag.item.id 
            ? { ...w, x: newX, y: newY }
            : w
        ));
      }

      // Проверяем возможность привязки к стене
      const updatedWindow = { ...drag.item, x: newX, y: newY, length: drag.type === 'resize' ? Math.max(WINDOW_MIN_LENGTH, Math.min(WINDOW_MAX_LENGTH, drag.start.length + (drag.item.rotation === 0 ? dx : dy))) : drag.item.length };
      const attachment = findNearestWall(updatedWindow);
      
      if (attachment) {
        setPendingAttachment({ windowId: drag.item.id, attachment });
      } else {
        setPendingAttachment(null);
      }
    } else {
      // Перетаскивание комнаты
      if (drag.type === 'resize') {
        let newX = drag.start.x;
        let newY = drag.start.y;
        let newWidth = drag.start.width;
        let newHeight = drag.start.height;
        
        // Изменяем размер в зависимости от ручки
        switch (drag.resizeHandle) {
          case 'se': // Юго-восток
            newWidth = Math.max(100, Math.min(CANVAS_WIDTH - newX, drag.start.width + dx));
            newHeight = Math.max(100, Math.min(CANVAS_HEIGHT - newY, drag.start.height + dy));
            break;
          case 'sw': // Юго-запад
            newX = Math.max(0, Math.min(drag.start.x + drag.start.width - 100, drag.start.x + dx));
            newWidth = drag.start.width - (newX - drag.start.x);
            newHeight = Math.max(100, Math.min(CANVAS_HEIGHT - newY, drag.start.height + dy));
            break;
          case 'ne': // Северо-восток
            newWidth = Math.max(100, Math.min(CANVAS_WIDTH - newX, drag.start.width + dx));
            newY = Math.max(0, Math.min(drag.start.y + drag.start.height - 100, drag.start.y + dy));
            newHeight = drag.start.height - (newY - drag.start.y);
            break;
          case 'nw': // Северо-запад
            newX = Math.max(0, Math.min(drag.start.x + drag.start.width - 100, drag.start.x + dx));
            newWidth = drag.start.width - (newX - drag.start.x);
            newY = Math.max(0, Math.min(drag.start.y + drag.start.height - 100, drag.start.y + dy));
            newHeight = drag.start.height - (newY - drag.start.y);
            break;
          case 'n': // Север
            newY = Math.max(0, Math.min(drag.start.y + drag.start.height - 100, drag.start.y + dy));
            newHeight = drag.start.height - (newY - drag.start.y);
            break;
          case 's': // Юг
            newHeight = Math.max(100, Math.min(CANVAS_HEIGHT - newY, drag.start.height + dy));
            break;
          case 'e': // Восток
            newWidth = Math.max(100, Math.min(CANVAS_WIDTH - newX, drag.start.width + dx));
            break;
          case 'w': // Запад
            newX = Math.max(0, Math.min(drag.start.x + drag.start.width - 100, drag.start.x + dx));
            newWidth = drag.start.width - (newX - drag.start.x);
            break;
        }
        
        // Умное выравнивание размеров с другими комнатами
        for (const room of enabledRooms) {
          if (room.key === drag.item.key) continue;
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const roomPixels = toPixels(layout);
          
          // Выравнивание ширины
          if (Math.abs(newWidth - roomPixels.width) < 20) {
            newWidth = roomPixels.width;
          }
          // Выравнивание высоты
          if (Math.abs(newHeight - roomPixels.height) < 20) {
            newHeight = roomPixels.height;
          }
        }
        
        // Применяем умное выравнивание
        newX = smartAlign(newX);
        newY = smartAlign(newY);
        newWidth = smartAlign(newWidth);
        newHeight = smartAlign(newHeight);
        
        // Проверяем коллизии только при изменении размера
        if (!checkRoomCollision(drag.item.key, newX, newY, newWidth, newHeight)) {
          const normalized = toNormalized({ x: newX, y: newY, width: newWidth, height: newHeight });
          onUpdate(drag.item.key, { layout: normalized });
        }
      } else {
        // Перемещение комнаты
        let newX = Math.max(0, Math.min(CANVAS_WIDTH - drag.start.width, drag.start.x + dx));
        let newY = Math.max(0, Math.min(CANVAS_HEIGHT - drag.start.height, drag.start.y + dy));
        
        // Умное выравнивание с другими комнатами (оптимизировано)
        let isSnapping = false;
        const snapDistance = 15;
        
        for (const room of enabledRooms) {
          if (room.key === drag.item.key) continue;
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const roomPixels = toPixels(layout);
          
          // Быстрая проверка на близость
          const distanceX = Math.abs(newX - roomPixels.x);
          const distanceY = Math.abs(newY - roomPixels.y);
          
          if (distanceX < snapDistance || distanceY < snapDistance) {
            // Выравнивание по левому краю
            if (distanceX < snapDistance) {
              newX = roomPixels.x;
              isSnapping = true;
            }
            // Выравнивание по правому краю
            if (Math.abs((newX + drag.start.width) - (roomPixels.x + roomPixels.width)) < snapDistance) {
              newX = roomPixels.x + roomPixels.width - drag.start.width;
              isSnapping = true;
            }
            // Выравнивание по верхнему краю
            if (distanceY < snapDistance) {
              newY = roomPixels.y;
              isSnapping = true;
            }
            // Выравнивание по нижнему краю
            if (Math.abs((newY + drag.start.height) - (roomPixels.y + roomPixels.height)) < snapDistance) {
              newY = roomPixels.y + roomPixels.height - drag.start.height;
              isSnapping = true;
            }
          }
        }
        
        // Обновляем состояние выравнивания
        if (isSnapping) {
          setSnappingRoom(drag.item.key);
        } else {
          setSnappingRoom(null);
        }
        
        // Применяем умное выравнивание
        newX = smartAlign(newX);
        newY = smartAlign(newY);
        
        // Проверяем коллизии при перемещении
        if (!checkRoomCollision(drag.item.key, newX, newY, drag.start.width, drag.start.height)) {
          const normalized = toNormalized({ x: newX, y: newY, width: drag.start.width, height: drag.start.height });
          onUpdate(drag.item.key, { layout: normalized });
        }
      }
    }
  };

  // Обработка окончания перетаскивания
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;

    if ('length' in drag.item) {
      // Сбрасываем состояние перетаскивания окна
      setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
        w.id === drag.item.id 
          ? { ...w, isDragging: false, isResizing: false }
          : w
      ));
    }

    // Сбрасываем состояние выравнивания
    setSnappingRoom(null);
    setDrag(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Добавление нового окна
  const addWindow = () => {
    const newWindow: FloatingWindow = {
      id: Date.now(),
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT / 2 - 50,
      length: 100,
      rotation: 0,
      type: 'window'
    };
    setFloatingWindows((prev: FloatingWindow[]) => [...prev, newWindow]);
  };

  // Подтверждение привязки окна
  const confirmAttachment = () => {
    if (!pendingAttachment) return;

    const room = rooms.find(r => r.key === pendingAttachment.attachment.roomKey);
    if (!room) return;

    const newWindow = {
      side: pendingAttachment.attachment.side,
      pos: pendingAttachment.attachment.position,
      len: pendingAttachment.attachment.length
    };

    onUpdate(room.key, {
      windows: [...(room.windows || []), newWindow]
    });

    // Удаляем плавающее окно
    setFloatingWindows((prev: FloatingWindow[]) => prev.filter((w: FloatingWindow) => w.id !== pendingAttachment.windowId));
    setPendingAttachment(null);
  };

  // Отмена привязки окна
  const cancelAttachment = () => {
    setPendingAttachment(null);
  };

  // Удаление выбранного окна
  const deleteSelectedWindow = () => {
    if (!selectedWindow) return;

    const room = rooms.find(r => r.key === selectedWindow.roomKey);
    if (!room || !room.windows) return;

    const updatedWindows = room.windows.filter((_, index) => index !== selectedWindow.index);
    onUpdate(room.key, { windows: updatedWindows });
    setSelectedWindow(null);
  };

  // Удаление всех окон
  const deleteAllWindows = () => {
    for (const room of rooms) {
      if (room.windows && room.windows.length > 0) {
        onUpdate(room.key, { windows: [] });
      }
    }
    setSelectedWindow(null);
  };

  // Обработка клика по установленному окну
  const handlePlacedWindowClick = (roomKey: string, index: number) => {
    if (selectedWindow?.roomKey === roomKey && selectedWindow?.index === index) {
      setSelectedWindow(null);
    } else {
      setSelectedWindow({ roomKey, index });
    }
  };

  return (
    <div className="layout-editor">
      {/* Панель управления */}
      <div className="editor-controls">
        <button 
          className="add-window-btn"
          onClick={addWindow}
        >
          🪟 Добавить окно
        </button>
        
        <button 
          className="delete-selected-window-btn"
          onClick={deleteSelectedWindow}
          disabled={!selectedWindow}
        >
          🗑️ Удалить выбранное окно
        </button>
        
        <button 
          className="delete-all-windows-btn"
          onClick={deleteAllWindows}
        >
          🗑️ Удалить все окна
        </button>
      </div>

      {/* Панель подтверждения привязки */}
      {pendingAttachment && (
        <div className="attachment-panel">
          <div className="attachment-content">
            <p>Прикрепить окно к стене помещения?</p>
            <div className="attachment-buttons">
              <button className="confirm-btn" onClick={confirmAttachment}>
                ✅ Прикрепить
              </button>
              <button className="cancel-btn" onClick={cancelAttachment}>
                ❌ Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Холст */}
      <div
        ref={canvasRef}
        className="layout-canvas"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          position: 'relative',
          background: `
            linear-gradient(to right, #f0f0f0 0px, #f0f0f0 ${GRID_SIZE - 1}px, transparent ${GRID_SIZE - 1}px, transparent ${GRID_SIZE}px),
            linear-gradient(to bottom, #f0f0f0 0px, #f0f0f0 ${GRID_SIZE - 1}px, transparent ${GRID_SIZE - 1}px, transparent ${GRID_SIZE}px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e: React.MouseEvent) => {
          if (e.target === canvasRef.current) {
            setDrag(null);
            setSelectedWindow(null);
          }
        }}
      >
        {/* Комнаты */}
        {enabledRooms.map((room) => {
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const roomPixels = toPixels(layout);
          
          return (
            <div
              key={room.key}
              className={`room ${snappingRoom === room.key ? 'snapping' : ''}`}
              style={{
                position: 'absolute',
                left: roomPixels.x,
                top: roomPixels.y,
                width: roomPixels.width,
                height: roomPixels.height,
                backgroundColor: '#e8f4fd',
                border: '2px solid #4a90e2',
                borderRadius: '6px',
                cursor: 'move',
                transition: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, room, 'move')}
            >
              <div className="room-header">
                <span className="room-name">{room.name}</span>
              </div>
              
              {/* Ручки для изменения размера */}
              <div className="room-resize-handle se" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'se'); }} />
              <div className="room-resize-handle nw" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'nw'); }} />
              <div className="room-resize-handle ne" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'ne'); }} />
              <div className="room-resize-handle sw" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'sw'); }} />
              <div className="room-resize-handle n" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'n'); }} />
              <div className="room-resize-handle s" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 's'); }} />
              <div className="room-resize-handle e" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'e'); }} />
              <div className="room-resize-handle w" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, room, 'resize', 'w'); }} />
              
              {/* Установленные окна */}
              {room.windows?.map((window, index) => (
                <div
                  key={index}
                  className={`placed-window ${selectedWindow?.roomKey === room.key && selectedWindow?.index === index ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    ...getWindowStyle(window, roomPixels),
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: selectedWindow?.roomKey === room.key && selectedWindow?.index === index ? 'scale(1.1)' : 'scale(1)',
                    zIndex: selectedWindow?.roomKey === room.key && selectedWindow?.index === index ? 10 : 1
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handlePlacedWindowClick(room.key, index);
                  }}
                />
              ))}
            </div>
          );
        })}

        {/* Плавающие окна */}
        {floatingWindows.map((window: FloatingWindow) => (
          <div
            key={window.id}
            className={`floating-window ${window.isDragging ? 'dragging' : ''} ${window.isResizing ? 'resizing' : ''}`}
            style={{
            position: 'absolute',
              left: window.x,
              top: window.y,
              width: window.rotation === 0 ? window.length : 20,
              height: window.rotation === 0 ? 20 : window.length,
              backgroundColor: pendingAttachment ? '#ffeb3b' : '#4caf50',
              border: '2px solid #2e7d32',
              borderRadius: '4px',
              cursor: 'move',
              transition: window.isDragging || window.isResizing ? 'none' : 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 20
            }}
            onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, window, 'move')}
          >
            <div className="window-resize-handle" onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, window, 'resize')} />
            <div className="window-label">🪟</div>
            </div>
        ))}
      </div>
    </div>
  );
};

// Получение стилей для установленного окна
const getWindowStyle = (window: any, _roomPixels: any) => {
  const wallThickness = 8;
  
  switch (window.side) {
    case 'left':
      return {
        left: -wallThickness / 2,
        top: `${window.pos * 100}%`,
        width: wallThickness,
        height: `${window.len * 100}%`,
        backgroundColor: '#81c784',
        border: '1px solid #4caf50'
      };
    case 'right':
      return {
        right: -wallThickness / 2,
        top: `${window.pos * 100}%`,
        width: wallThickness,
        height: `${window.len * 100}%`,
        backgroundColor: '#81c784',
        border: '1px solid #4caf50'
      };
    case 'top':
      return {
        top: -wallThickness / 2,
        left: `${window.pos * 100}%`,
        width: `${window.len * 100}%`,
        height: wallThickness,
        backgroundColor: '#81c784',
        border: '1px solid #4caf50'
      };
    case 'bottom':
      return {
        bottom: -wallThickness / 2,
        left: `${window.pos * 100}%`,
        width: `${window.len * 100}%`,
        height: wallThickness,
        backgroundColor: '#81c784',
        border: '1px solid #4caf50'
      };
    default:
      return {};
  }
};

export default LayoutEditor;