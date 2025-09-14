import React, { useMemo, useRef, useState } from 'react';
import type { RoomState } from '../lib/api';

interface LayoutEditorProps {
  rooms: RoomState[];
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
  onWindowsUpdate?: (windows: { side: 'left'|'right'|'top'|'bottom'; pos: number; len: number }[]) => void;
  onDoorsUpdate?: (doors: { side: 'left'|'right'|'top'|'bottom'; pos: number; len: number; type: 'entrance'|'interior' }[]) => void;
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
  isRotating?: boolean;
  attachedTo?: WindowAttachment;
};

type Door = {
  id: number;
  x: number;
  y: number;
  length: number;
  rotation: 0 | 90;
  type: 'entrance' | 'interior';
  isDragging?: boolean;
  isResizing?: boolean;
  attachedTo?: {
    room1Key: string;
    room2Key?: string;
    side: 'left' | 'right' | 'top' | 'bottom';
    position: number;
  };
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
const LayoutEditor: React.FC<LayoutEditorProps> = ({ rooms, onUpdate, onWindowsUpdate, onDoorsUpdate }) => {
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
  
  // Состояние для дверей
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [doorCreationMode, setDoorCreationMode] = useState<'none' | 'entrance' | 'interior'>('none');
  const [hasEntranceDoor, setHasEntranceDoor] = useState<boolean>(false);

  const enabledRooms = useMemo(() => rooms.filter(r => r.enabled), [rooms]);


  // Функция для определения всех пересечений с конкретным помещением
  const getRoomOverlaps = (targetRoom: RoomState): RoomState[] => {
    const targetLayout = targetRoom.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
    const targetPixels = toPixels(targetLayout);
    
    return enabledRooms.filter(room => {
      if (room.key === targetRoom.key) return false;
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      // Проверяем пересечение прямоугольников
      return targetPixels.x < roomPixels.x + roomPixels.width && 
             targetPixels.x + targetPixels.width > roomPixels.x && 
             targetPixels.y < roomPixels.y + roomPixels.height && 
             targetPixels.y + targetPixels.height > roomPixels.y;
    });
  };


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

  // Функции для конвертации окон и дверей в формат для SVG
  const convertWindowsToSvgFormat = () => {
    return floatingWindows.map((window: FloatingWindow) => {
      const attachment = window.attachedTo;
      if (!attachment) return null;
      
      // Находим комнату, к которой прикреплено окно
      const room = enabledRooms.find(r => r.key === attachment.roomKey);
      if (!room) return null;
      
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      // Вычисляем длину относительно стены комнаты
      const wallLength = attachment.side === 'left' || attachment.side === 'right' ? roomPixels.height : roomPixels.width;
      const normalizedLength = Math.min(1, window.length / wallLength);
      
      return {
        side: attachment.side,
        pos: attachment.position,
        len: normalizedLength
      };
    }).filter(Boolean);
  };

  const convertDoorsToSvgFormat = () => {
    return doors.map((door: Door) => {
      const attachment = door.attachedTo;
      if (!attachment) return null;
      
      // Находим комнату, к которой прикреплена дверь
      const room = enabledRooms.find(r => r.key === attachment.room1Key);
      if (!room) return null;
      
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      // Вычисляем длину относительно стены комнаты
      const wallLength = attachment.side === 'left' || attachment.side === 'right' ? roomPixels.height : roomPixels.width;
      const normalizedLength = Math.min(1, door.length / wallLength);
      
      return {
        side: attachment.side,
        pos: attachment.position,
        len: normalizedLength,
        type: door.type
      };
    }).filter(Boolean);
  };

  // Обновляем данные при изменении окон и дверей
  React.useEffect(() => {
    if (onWindowsUpdate) {
      const windowsData = convertWindowsToSvgFormat();
      console.log('Updating windows data:', windowsData);
      onWindowsUpdate(windowsData);
    }
  }, [floatingWindows, enabledRooms, onWindowsUpdate]);

  React.useEffect(() => {
    if (onDoorsUpdate) {
      const doorsData = convertDoorsToSvgFormat();
      console.log('Updating doors data:', doorsData);
      onDoorsUpdate(doorsData);
    }
  }, [doors, enabledRooms, onDoorsUpdate]);

  // Функции для работы с дверями
  const addDoor = (type: 'entrance' | 'interior') => {
    const newDoor: Door = {
      id: Date.now(),
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT / 2 - 50,
      length: 80,
      rotation: 0,
      type,
      isDragging: false,
      isResizing: false
    };
    
    setDoors((prev: Door[]) => [...prev, newDoor]);
    setDoorCreationMode('none');
    
    if (type === 'entrance') {
      setHasEntranceDoor(true);
    }
    
    // Принудительно обновляем данные
    setTimeout(() => {
      if (onDoorsUpdate) {
        const doorsData = convertDoorsToSvgFormat();
        console.log('Force updating doors data after add:', doorsData);
        onDoorsUpdate(doorsData);
      }
    }, 100);
  };

  const deleteDoor = (doorId: number) => {
    setDoors((prev: Door[]) => {
      const door = prev.find((d: Door) => d.id === doorId);
      if (door?.type === 'entrance') {
        setHasEntranceDoor(false);
      }
      return prev.filter((d: Door) => d.id !== doorId);
    });
    setSelectedDoor(null);
  };

  const detachDoor = (doorId: number) => {
    setDoors((prev: Door[]) => prev.map((door: Door) => 
      door.id === doorId 
        ? { ...door, attachedTo: undefined }
        : door
    ));
  };

  // Функция для поиска ближайшей стены для прикрепления двери
  const findNearestWallForDoor = (door: Door): { room1Key: string; room2Key?: string; side: 'left' | 'right' | 'top' | 'bottom'; position: number } | null => {
    let bestAttachment: { room1Key: string; room2Key?: string; side: 'left' | 'right' | 'top' | 'bottom'; position: number } | null = null;
    let minDistance = Infinity;

    console.log('Finding wall for door:', { x: door.x, y: door.y, length: door.length, rotation: door.rotation });

    for (const room of enabledRooms) {
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      console.log(`Checking room ${room.name}:`, roomPixels);
      
      // Проверяем стены в зависимости от поворота двери
      let walls;
      if (door.rotation === 0) {
        // Горизонтальная дверь - может привязываться к верхним и нижним стенам
        walls = [
          { side: 'top' as const, x: roomPixels.x, y: roomPixels.y, width: roomPixels.width, height: 0 },
          { side: 'bottom' as const, x: roomPixels.x, y: roomPixels.y + roomPixels.height, width: roomPixels.width, height: 0 }
        ];
      } else {
        // Вертикальная дверь - может привязываться к левым и правым стенам
        walls = [
          { side: 'left' as const, x: roomPixels.x, y: roomPixels.y, width: 0, height: roomPixels.height },
          { side: 'right' as const, x: roomPixels.x + roomPixels.width, y: roomPixels.y, width: 0, height: roomPixels.height }
        ];
      }

      for (const wall of walls) {
        const distance = calculateDistanceToWall({ x: door.x, y: door.y, length: door.length, rotation: door.rotation } as FloatingWindow, wall);
        console.log(`Wall ${wall.side} distance:`, distance);
        
        if (distance < minDistance && distance <= SNAP_DISTANCE) {
          minDistance = distance;
          
          // Вычисляем позицию на стене
          let position: number;
          
          if (wall.side === 'left' || wall.side === 'right') {
            // Вертикальная стена
            const wallLength = wall.height;
            const relativeY = door.y - wall.y;
            position = Math.max(0, Math.min(1, relativeY / wallLength));
          } else {
            // Горизонтальная стена
            const wallLength = wall.width;
            const relativeX = door.x - wall.x;
            position = Math.max(0, Math.min(1, relativeX / wallLength));
          }

          bestAttachment = {
            room1Key: room.key,
            side: wall.side,
            position
          };
          console.log('Found attachment:', bestAttachment);
        }
      }
    }

    console.log('Final attachment:', bestAttachment);
    return bestAttachment;
  };

  // Поиск ближайшей стены для привязки окна
  const findNearestWall = (window: FloatingWindow): WindowAttachment | null => {
    let bestAttachment: WindowAttachment | null = null;
    let minDistance = Infinity;

    for (const room of enabledRooms) {
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const roomPixels = toPixels(layout);
      
      // Проверяем стены в зависимости от поворота окна
      let walls;
      if (window.rotation === 0) {
        // Горизонтальное окно - может привязываться к верхним и нижним стенам
        walls = [
          { side: 'top' as const, x: roomPixels.x, y: roomPixels.y, width: roomPixels.width, height: 0 },
          { side: 'bottom' as const, x: roomPixels.x, y: roomPixels.y + roomPixels.height, width: roomPixels.width, height: 0 }
        ];
      } else {
        // Вертикальное окно - может привязываться к левым и правым стенам
        walls = [
          { side: 'left' as const, x: roomPixels.x, y: roomPixels.y, width: 0, height: roomPixels.height },
          { side: 'right' as const, x: roomPixels.x + roomPixels.width, y: roomPixels.y, width: 0, height: roomPixels.height }
        ];
      }

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
  const handlePointerDown = (e: React.PointerEvent, item: RoomState | FloatingWindow | Door, type: 'move' | 'resize', resizeHandle?: string) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const isWindow = 'length' in item && 'type' in item && item.type === 'window';
    const isDoor = 'length' in item && 'type' in item && (item.type === 'entrance' || item.type === 'interior');

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
    } else if (isDoor) {
      setDrag({
        key: item.id,
        item,
        type,
        startX: x,
        startY: y,
        start: { x: item.x, y: item.y, length: item.length, rotation: item.rotation }
      });
      
      // Обновляем состояние двери
      setDoors((prev: Door[]) => prev.map((d: Door) => 
        d.id === item.id 
          ? { ...d, isDragging: type === 'move', isResizing: type === 'resize' }
          : d
      ));
    } else if ('layout' in item && 'key' in item) {
      // Это комната
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


  // Проверка наложения помещений (может быть полезна для будущих функций)

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

  // Поворот плавающего окна на 90 градусов
  const rotateFloatingWindow = (windowId: number) => {
    setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => {
      if (w.id === windowId) {
        const newRotation = w.rotation === 0 ? 90 : 0;
        return { ...w, rotation: newRotation, isRotating: true };
      }
      return w;
    }));
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
      // Перетаскивание плавающего окна или двери
      let newX = drag.start.x;
      let newY = drag.start.y;
      let newLength = drag.start.length;
      
      if (drag.type === 'resize') {
        // Растягивание окна или двери
        if (drag.item.rotation === 0) {
          // Горизонтальное - растягиваем по X
          newLength = Math.max(WINDOW_MIN_LENGTH, Math.min(WINDOW_MAX_LENGTH, drag.start.length + dx));
        } else {
          // Вертикальное - растягиваем по Y
          newLength = Math.max(WINDOW_MIN_LENGTH, Math.min(WINDOW_MAX_LENGTH, drag.start.length + dy));
        }
      } else {
        // Перемещение окна или двери
        newX = Math.max(0, Math.min(CANVAS_WIDTH - (drag.item.rotation === 0 ? newLength : 8), drag.start.x + dx));
        newY = Math.max(0, Math.min(CANVAS_HEIGHT - (drag.item.rotation === 0 ? 8 : newLength), drag.start.y + dy));
      }
      
      // Обновляем состояние в зависимости от типа элемента
      if ('type' in drag.item && drag.item.type === 'window') {
        setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
          w.id === drag.item.id 
            ? { ...w, x: newX, y: newY, length: newLength }
            : w
        ));

        // Проверяем возможность привязки окна к стене
        const updatedWindow = { ...drag.item, x: newX, y: newY, length: newLength };
        const attachment = findNearestWall(updatedWindow);
        
        if (attachment) {
          setPendingAttachment({ windowId: drag.item.id, attachment });
          // Автоматически прикрепляем окно к стене
          setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
            w.id === drag.item.id 
              ? { ...w, attachedTo: attachment }
              : w
          ));
        } else {
          setPendingAttachment(null);
          // Открепляем окно от стены
          setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
            w.id === drag.item.id 
              ? { ...w, attachedTo: undefined }
              : w
          ));
        }
      } else if ('type' in drag.item && (drag.item.type === 'entrance' || drag.item.type === 'interior')) {
        setDoors((prev: Door[]) => prev.map((d: Door) => 
          d.id === drag.item.id 
            ? { ...d, x: newX, y: newY, length: newLength }
            : d
        ));

        // Проверяем возможность привязки двери к стене
        const updatedDoor = { ...drag.item, x: newX, y: newY, length: newLength };
        const attachment = findNearestWallForDoor(updatedDoor);
        
        if (attachment) {
          // Автоматически прикрепляем дверь к стене
          setDoors((prev: Door[]) => prev.map((d: Door) => 
            d.id === drag.item.id 
              ? { ...d, attachedTo: attachment }
              : d
          ));
        } else {
          // Открепляем дверь от стены
          setDoors((prev: Door[]) => prev.map((d: Door) => 
            d.id === drag.item.id 
              ? { ...d, attachedTo: undefined }
              : d
          ));
        }
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
        
        // Магнитное притяжение стен при изменении размера
        let isSnapping = false;
        const snapDistance = 20;
        
        for (const room of enabledRooms) {
          if (room.key === drag.item.key) continue;
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const roomPixels = toPixels(layout);
          
          // Проверяем выравнивание стен при изменении размера
          const alignments = [
            // Левая стена к левой стене
            { type: 'left-to-left', distance: Math.abs(newX - roomPixels.x), snapX: roomPixels.x, snapY: newY },
            // Левая стена к правой стене
            { type: 'left-to-right', distance: Math.abs(newX - (roomPixels.x + roomPixels.width)), snapX: roomPixels.x + roomPixels.width, snapY: newY },
            // Правая стена к левой стене
            { type: 'right-to-left', distance: Math.abs((newX + newWidth) - roomPixels.x), snapX: roomPixels.x - newWidth, snapY: newY },
            // Правая стена к правой стене
            { type: 'right-to-right', distance: Math.abs((newX + newWidth) - (roomPixels.x + roomPixels.width)), snapX: roomPixels.x + roomPixels.width - newWidth, snapY: newY },
            // Верхняя стена к верхней стене
            { type: 'top-to-top', distance: Math.abs(newY - roomPixels.y), snapX: newX, snapY: roomPixels.y },
            // Верхняя стена к нижней стене
            { type: 'top-to-bottom', distance: Math.abs(newY - (roomPixels.y + roomPixels.height)), snapX: newX, snapY: roomPixels.y + roomPixels.height },
            // Нижняя стена к верхней стене
            { type: 'bottom-to-top', distance: Math.abs((newY + newHeight) - roomPixels.y), snapX: newX, snapY: roomPixels.y - newHeight },
            // Нижняя стена к нижней стене
            { type: 'bottom-to-bottom', distance: Math.abs((newY + newHeight) - (roomPixels.y + roomPixels.height)), snapX: newX, snapY: roomPixels.y + roomPixels.height - newHeight }
          ];
          
          // Находим ближайшее выравнивание
          const closestAlignment = alignments.reduce((closest, current) => 
            current.distance < closest.distance ? current : closest
          );
          
          if (closestAlignment.distance < snapDistance) {
            newX = closestAlignment.snapX;
            newY = closestAlignment.snapY;
            isSnapping = true;
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
        newWidth = smartAlign(newWidth);
        newHeight = smartAlign(newHeight);
        
        // Применяем изменения без проверки коллизий
        const normalized = toNormalized({ x: newX, y: newY, width: newWidth, height: newHeight });
        onUpdate(drag.item.key, { layout: normalized });
      } else {
        // Перемещение комнаты
        let newX = Math.max(0, Math.min(CANVAS_WIDTH - drag.start.width, drag.start.x + dx));
        let newY = Math.max(0, Math.min(CANVAS_HEIGHT - drag.start.height, drag.start.y + dy));
        
        // Магнитное притяжение стен
        let isSnapping = false;
        const snapDistance = 20;
        
        for (const room of enabledRooms) {
          if (room.key === drag.item.key) continue;
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const roomPixels = toPixels(layout);
          
          // Проверяем все возможные выравнивания стен
          const alignments = [
            // Левая стена к левой стене
            { type: 'left-to-left', distance: Math.abs(newX - roomPixels.x), snapX: roomPixels.x, snapY: newY },
            // Левая стена к правой стене
            { type: 'left-to-right', distance: Math.abs(newX - (roomPixels.x + roomPixels.width)), snapX: roomPixels.x + roomPixels.width, snapY: newY },
            // Правая стена к левой стене
            { type: 'right-to-left', distance: Math.abs((newX + drag.start.width) - roomPixels.x), snapX: roomPixels.x - drag.start.width, snapY: newY },
            // Правая стена к правой стене
            { type: 'right-to-right', distance: Math.abs((newX + drag.start.width) - (roomPixels.x + roomPixels.width)), snapX: roomPixels.x + roomPixels.width - drag.start.width, snapY: newY },
            // Верхняя стена к верхней стене
            { type: 'top-to-top', distance: Math.abs(newY - roomPixels.y), snapX: newX, snapY: roomPixels.y },
            // Верхняя стена к нижней стене
            { type: 'top-to-bottom', distance: Math.abs(newY - (roomPixels.y + roomPixels.height)), snapX: newX, snapY: roomPixels.y + roomPixels.height },
            // Нижняя стена к верхней стене
            { type: 'bottom-to-top', distance: Math.abs((newY + drag.start.height) - roomPixels.y), snapX: newX, snapY: roomPixels.y - drag.start.height },
            // Нижняя стена к нижней стене
            { type: 'bottom-to-bottom', distance: Math.abs((newY + drag.start.height) - (roomPixels.y + roomPixels.height)), snapX: newX, snapY: roomPixels.y + roomPixels.height - drag.start.height }
          ];
          
          // Находим ближайшее выравнивание
          const closestAlignment = alignments.reduce((closest, current) => 
            current.distance < closest.distance ? current : closest
          );
          
          if (closestAlignment.distance < snapDistance) {
            newX = closestAlignment.snapX;
            newY = closestAlignment.snapY;
            isSnapping = true;
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
        
        // Применяем изменения без проверки коллизий
        const normalized = toNormalized({ x: newX, y: newY, width: drag.start.width, height: drag.start.height });
        onUpdate(drag.item.key, { layout: normalized });
      }
    }
  };

  // Обработка окончания перетаскивания
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;

    if ('length' in drag.item) {
      if ('type' in drag.item && drag.item.type === 'window') {
        // Сбрасываем состояние перетаскивания окна
        setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
          w.id === drag.item.id 
            ? { ...w, isDragging: false, isResizing: false, isRotating: false }
            : w
        ));
      } else if ('type' in drag.item && (drag.item.type === 'entrance' || drag.item.type === 'interior')) {
        // Сбрасываем состояние перетаскивания двери
        setDoors((prev: Door[]) => prev.map((d: Door) => 
          d.id === drag.item.id 
            ? { ...d, isDragging: false, isResizing: false }
            : d
        ));
      }
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
      type: 'window',
      isDragging: false,
      isResizing: false,
      isRotating: false
    };
    setFloatingWindows((prev: FloatingWindow[]) => [...prev, newWindow]);
    
    // Принудительно обновляем данные
    setTimeout(() => {
      if (onWindowsUpdate) {
        const windowsData = convertWindowsToSvgFormat();
        console.log('Force updating windows data after add:', windowsData);
        onWindowsUpdate(windowsData);
      }
    }, 100);
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

        <button 
          className="debug-attach-btn"
          onClick={() => {
            console.log('Current windows:', floatingWindows);
            console.log('Current doors:', doors);
            console.log('Windows data for SVG:', convertWindowsToSvgFormat());
            console.log('Doors data for SVG:', convertDoorsToSvgFormat());
          }}
        >
          🔍 Отладка данных
        </button>

        <button 
          className="force-attach-btn"
          onClick={() => {
            // Принудительно прикрепляем все окна к ближайшим стенам
            setFloatingWindows((prev: FloatingWindow[]) => prev.map((window: FloatingWindow) => {
              const attachment = findNearestWall(window);
              return { ...window, attachedTo: attachment || undefined };
            }));
            
            // Принудительно прикрепляем все двери к ближайшим стенам
            setDoors((prev: Door[]) => prev.map((door: Door) => {
              const attachment = findNearestWallForDoor(door);
              return { ...door, attachedTo: attachment || undefined };
            }));
          }}
        >
          🔗 Прикрепить все к стенам
        </button>

        {/* Кнопки управления дверями */}
        <div className="door-controls">
          <button 
            className="add-door-btn"
            onClick={() => setDoorCreationMode(doorCreationMode === 'none' ? 'menu' : 'none')}
          >
            🚪 Добавить дверь
          </button>
          
          {doorCreationMode === 'menu' && (
            <div className="door-menu">
              {!hasEntranceDoor && (
                <button 
                  className="add-entrance-door-btn"
                  onClick={() => addDoor('entrance')}
                >
                  🏠 Входная дверь
                </button>
              )}
              <button 
                className="add-interior-door-btn"
                onClick={() => addDoor('interior')}
              >
                🚪 Межкомнотная дверь
              </button>
            </div>
          )}
        </div>
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
          const overlappingRooms = getRoomOverlaps(room);
          const hasOverlaps = overlappingRooms.length > 0;
          
          return (
            <div
              key={room.key}
              className={`room ${snappingRoom === room.key ? 'snapping' : ''} ${hasOverlaps ? 'overlapping' : ''}`}
              style={{
                position: 'absolute',
                left: roomPixels.x,
                top: roomPixels.y,
                width: roomPixels.width,
                height: roomPixels.height,
                backgroundColor: hasOverlaps ? 'rgba(232, 244, 253, 0.6)' : '#e8f4fd',
                border: hasOverlaps ? '3px solid #1976d2' : '2px solid #4a90e2',
                borderRadius: '6px',
                cursor: 'move',
                transition: 'none',
                boxShadow: hasOverlaps 
                  ? '0 0 0 2px #1976d2, 0 4px 16px rgba(25, 118, 210, 0.4), inset 0 0 0 1px rgba(25, 118, 210, 0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: hasOverlaps ? 20 : 10
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
            className={`floating-window ${window.isDragging ? 'dragging' : ''} ${window.isResizing ? 'resizing' : ''} ${window.isRotating ? 'rotating' : ''}`}
            style={{
            position: 'absolute',
              left: window.x,
              top: window.y,
              width: window.rotation === 0 ? window.length : 8,
              height: window.rotation === 0 ? 8 : window.length,
              backgroundColor: pendingAttachment ? '#ffeb3b' : '#4caf50',
              border: '2px solid #2e7d32',
              borderRadius: '4px',
              cursor: 'move',
              transition: window.isDragging || window.isResizing || window.isRotating ? 'none' : 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 20
            }}
            onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, window, 'move')}
            onDoubleClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              rotateFloatingWindow(window.id);
            }}
            title="Перетаскивать: перемещение, двойной клик: поворот, ручки: растягивание"
          >
            
            {/* Ручки растягивания длины */}
            {window.rotation === 0 ? (
              // Горизонтальное окно - ручки слева и справа
              <>
                <div 
                  className="floating-window-resize-handle floating-window-resize-left"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, window, 'resize');
                  }}
                />
                <div 
                  className="floating-window-resize-handle floating-window-resize-right"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, window, 'resize');
                  }}
                />
              </>
            ) : (
              // Вертикальное окно - ручки сверху и снизу
              <>
                <div 
                  className="floating-window-resize-handle floating-window-resize-top"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, window, 'resize');
                  }}
                />
                <div 
                  className="floating-window-resize-handle floating-window-resize-bottom"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, window, 'resize');
                  }}
                />
              </>
            )}
            
            <div className="window-label">🪟</div>
            </div>
        ))}

        {/* Двери */}
        {doors.map((door: Door) => (
          <div
            key={door.id}
            className={`door ${door.isDragging ? 'dragging' : ''} ${door.isResizing ? 'resizing' : ''} ${door.attachedTo ? 'attached' : ''} ${selectedDoor === door.id ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: door.x,
              top: door.y,
              width: door.rotation === 0 ? door.length : 8,
              height: door.rotation === 0 ? 8 : door.length,
              backgroundColor: door.type === 'entrance' ? '#ff9800' : '#9c27b0',
              border: door.attachedTo ? '3px solid #4caf50' : '2px solid #673ab7',
              borderRadius: '4px',
              cursor: 'move',
              transition: door.isDragging || door.isResizing ? 'none' : 'all 0.3s ease',
              boxShadow: door.attachedTo 
                ? '0 0 0 2px #4caf50, 0 4px 16px rgba(76, 175, 80, 0.4)'
                : '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 25
            }}
            onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, door, 'move')}
            onDoubleClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedDoor(selectedDoor === door.id ? null : door.id);
            }}
            title={`${door.type === 'entrance' ? 'Входная' : 'Межкомнотная'} дверь. Перетаскивать: перемещение, двойной клик: управление, ручки: растягивание`}
          >
            {/* Ручки растягивания длины */}
            {door.rotation === 0 ? (
              // Горизонтальная дверь - ручки слева и справа
              <>
                <div 
                  className="door-resize-handle door-resize-left"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, door, 'resize');
                  }}
                />
                <div 
                  className="door-resize-handle door-resize-right"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, door, 'resize');
                  }}
                />
              </>
            ) : (
              // Вертикальная дверь - ручки сверху и снизу
              <>
                <div 
                  className="door-resize-handle door-resize-top"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, door, 'resize');
                  }}
                />
                <div 
                  className="door-resize-handle door-resize-bottom"
                  onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    handlePointerDown(e, door, 'resize');
                  }}
                />
              </>
            )}
            
            <div className="door-label">
              {door.type === 'entrance' ? '🏠' : '🚪'}
            </div>
          </div>
        ))}

        {/* Панель управления выбранной дверью */}
        {selectedDoor && (
          <div className="door-control-panel">
            <div className="door-control-content">
              <p>Управление дверью</p>
              <div className="door-control-buttons">
                <button 
                  className="delete-door-btn"
                  onClick={() => deleteDoor(selectedDoor)}
                >
                  🗑️ Удалить
                </button>
                {doors.find((d: Door) => d.id === selectedDoor)?.attachedTo && (
                  <button 
                    className="detach-door-btn"
                    onClick={() => detachDoor(selectedDoor)}
                  >
                    🔗 Открепить
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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