import React, { useMemo, useRef, useState } from 'react';
import type { RoomState } from '../lib/api';

interface LayoutEditorProps {
  rooms: RoomState[];
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
}

type FloatingWindow = { id: number; x: number; y: number; len: number; rotation: 0 | 90; type: 'window' };

// Простая канва для расстановки комнат. Координаты нормализованы 0..1
const LayoutEditor: React.FC<LayoutEditorProps> = ({ rooms, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ key: string | number; item: any; type: 'move' | 'resize'; startX: number; startY: number; start: any } | null>(null);
  const [floatingWindows, setFloatingWindows] = useState<FloatingWindow[]>([]);
  const [selectedPlacedWindow, setSelectedPlacedWindow] = useState<{ roomKey: string; index: number } | null>(null);
  type PendingAttach = {
    winId: number;
    type: 'single' | 'between';
    primary: { key: string; name?: string; side: 'left' | 'right' | 'top' | 'bottom'; pos: number; len: number };
    secondary?: { key: string; name?: string; side: 'left' | 'right' | 'top' | 'bottom'; pos: number };
  };
  const [pendingAttach, setPendingAttach] = useState<PendingAttach | null>(null);

  const enabledRooms = useMemo(() => rooms.filter(r => r.enabled), [rooms]);
  const hallway = useMemo(() => rooms.find(r => /прихож|коридор|hall|entry|тамбур/i.test(String(r.name))), [rooms]);
  const [snap] = useState(0.02); // 2% snapping grid

  const handlePointerDown = (e: React.PointerEvent, item: RoomState | FloatingWindow, type: 'move' | 'resize') => {
    const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const isWindow = 'len' in item;

    if (isWindow) {
      setDrag({ key: item.id, item, type, startX: x, startY: y, start: { x: item.x, y: item.y, len: item.len, rot: item.rotation } });
    } else {
      const layout = item.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      setDrag({ key: item.key, item, type, startX: x, startY: y, start: { x: layout.x, y: layout.y, w: layout.width, h: layout.height } });
    }

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / rect.width;
    const currentY = (e.clientY - rect.top) / rect.height;
    const dx = currentX - drag.startX;
    const dy = currentY - drag.startY;
    const snapTo = (v: number) => Math.round(v / snap) * snap;

    if (drag.item.type === 'window' && (drag as any).placed !== true) {
      if (drag.type === 'move') {
        let nx = drag.start.x + dx;
        let ny = drag.start.y + dy;
        // магнит к ближайшей стене комнаты при перетаскивании
        const MAG = 0.02; // дистанция срабатывания магнита
        let best: { x?: number; y?: number; rot?: 0 | 90 } | null = null;
        let candidate: Omit<PendingAttach, 'winId'> | null = null;
        for (const room of enabledRooms) {
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const distLeft = Math.abs(nx - layout.x);
          const distRight = Math.abs(nx - (layout.x + layout.width));
          const distTop = Math.abs(ny - layout.y);
          const distBottom = Math.abs(ny - (layout.y + layout.height));
          const min = Math.min(distLeft, distRight, distTop, distBottom);
          if (min <= MAG) {
            if (min === distLeft) best = { x: layout.x, rot: 90 };
            else if (min === distRight) best = { x: layout.x + layout.width, rot: 90 };
            else if (min === distTop) best = { y: layout.y, rot: 0 };
            else best = { y: layout.y + layout.height, rot: 0 };
            // вычислим кандидата для подтверждения привязки
            candidate = findAttachmentCandidate({ x: nx, y: ny, len: drag.start.len, rot: (best?.rot ?? drag.start.rot) as 0 | 90 });
            break;
          }
        }
        if (best) {
          if (typeof best.x === 'number') nx = best.x;
          if (typeof best.y === 'number') ny = best.y;
        }
        nx = snapTo(nx);
        ny = snapTo(ny);
        setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === (drag.key as number) ? { ...w, x: nx, y: ny, rotation: (best?.rot ?? w.rotation) } : w));
        // показать панель подтверждения, если есть корректный кандидат
        if (candidate) setPendingAttach({ winId: Number(drag.key), ...candidate }); else setPendingAttach(null);
      } else { // resize
        const newLen = Math.max(0.05, snapTo(drag.start.len + (drag.start.rot === 90 ? dy : dx)));
        setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === (drag.key as number) ? { ...w, len: newLen } : w));
        // при изменении длины пересчитаем кандидата
        const fl = floatingWindows.find((w: FloatingWindow) => w.id === (drag.key as number));
        if (fl) {
          const candidate = findAttachmentCandidate({ x: fl.x, y: fl.y, len: newLen, rot: fl.rotation });
          if (candidate) setPendingAttach({ winId: Number(drag.key), ...candidate }); else setPendingAttach(null);
        }
      }
    } else if (drag.item.type === 'window' && (drag as any).placed === true) {
      // Drag already placed window along its wall inside room
      const room = drag.item.room as RoomState;
      const idx = (drag.item.index as number);
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const side = drag.item.side as 'left' | 'right' | 'top' | 'bottom';
      // compute new pos in 0..1 along the wall axis
      if (drag.type === 'move') {
        let newPos = 0;
        if (side === 'left' || side === 'right') newPos = Math.max(0, Math.min(1, drag.start.pos + dy / (layout.height || 1)));
        else newPos = Math.max(0, Math.min(1, drag.start.pos + dx / (layout.width || 1)));
        const updated = [ ...(room.windows ?? []) ];
        if (updated[idx]) {
          updated[idx] = { ...updated[idx], pos: snapTo(newPos) } as NonNullable<RoomState['windows']>[number];
          onUpdate(room.key, { windows: updated });
        }
      } else if (drag.type === 'resize') {
        let newLen = drag.start.len as number;
        if (side === 'left' || side === 'right') newLen = Math.max(0.05, Math.min(1 - drag.start.pos, drag.start.len + dy / (layout.height || 1)));
        else newLen = Math.max(0.05, Math.min(1 - drag.start.pos, drag.start.len + dx / (layout.width || 1)));
        const updated = [ ...(room.windows ?? []) ];
        if (updated[idx]) {
          updated[idx] = { ...updated[idx], len: snapTo(newLen) } as NonNullable<RoomState['windows']>[number];
          onUpdate(room.key, { windows: updated });
        }
      }
    } else { // room
      if (drag.type === 'move') {
        // propose move
        let nx = Math.min(1, Math.max(0, drag.start.x + dx));
        let ny = Math.min(1, Math.max(0, drag.start.y + dy));
        // prevent overlap with other enabled rooms (allow touching)
        const candidate = resolveNoOverlap({ x: nx, y: ny, width: drag.start.w, height: drag.start.h }, drag.key as string);
        nx = snapTo(candidate.x); ny = snapTo(candidate.y);
        onUpdate(drag.key as string, { layout: { x: nx, y: ny, width: candidate.width, height: candidate.height } });
      } else {
        let nw = Math.min(1, Math.max(0.05, drag.start.w + dx));
        let nh = Math.min(1, Math.max(0.05, drag.start.h + dy));
        // prevent overlap during resize
        const candidate = resolveNoOverlap({ x: drag.start.x, y: drag.start.y, width: nw, height: nh }, drag.key as string);
        nw = snapTo(candidate.width); nh = snapTo(candidate.height);
        onUpdate(drag.key as string, { layout: { x: candidate.x, y: candidate.y, width: nw, height: nh } });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (drag) {
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
      // больше не привязываем автоматически — ждём подтверждения пользователя кнопкой
    }
    setDrag(null);
  };

  const handleEntryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RoomState['entrySide'];
    if (hallway) {
      onUpdate(hallway.key, { entrySide: value });
    }
  };

  const handleRotate = (item: RoomState | FloatingWindow) => {
    if ('len' in item) { // FloatingWindow
      setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === item.id ? { ...w, rotation: w.rotation === 90 ? 0 : 90 } : w));
    } else { // RoomState
      const layout = item.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const rotated: RoomState['rotation'] = (item.rotation === 90 ? 0 : 90);
      onUpdate(item.key, { rotation: rotated, layout: { x: layout.x, y: layout.y, width: layout.height, height: layout.width } });
    }
  };

  const handleAddNewWindow = () => {
    setFloatingWindows((ws: FloatingWindow[]) => [...ws, { id: Date.now(), x: 0.5, y: 0.1, len: 0.15, rotation: 0, type: 'window' }]);
  };

  // Поиск кандидата привязки окна к стене комнаты или общей стене двух комнат
  const findAttachmentCandidate = (win: { x: number; y: number; len: number; rot: 0 | 90 }): Omit<PendingAttach, 'winId'> | null => {
    // Строим список всех стен всех включённых комнат и выбираем ближайшую по дистанции
    type Wall = { room: RoomState; side: 'left' | 'right' | 'top' | 'bottom'; coord: number; from: number; to: number; isVertical: boolean };
    const walls: Wall[] = [];
    for (const room of enabledRooms) {
      const l = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      walls.push({ room, side: 'left', coord: l.x, from: l.y, to: l.y + l.height, isVertical: true });
      walls.push({ room, side: 'right', coord: l.x + l.width, from: l.y, to: l.y + l.height, isVertical: true });
      walls.push({ room, side: 'top', coord: l.y, from: l.x, to: l.x + l.width, isVertical: false });
      walls.push({ room, side: 'bottom', coord: l.y + l.height, from: l.x, to: l.x + l.width, isVertical: false });
    }
    let best: null | { wall: Wall; dist: number } = null;
    for (const w of walls) {
      const dist = Math.abs((w.isVertical ? win.x : win.y) - w.coord);
      if (best === null || dist < best.dist) best = { wall: w, dist };
    }
    if (!best) return null;
    const MAG = 0.04; // чуть шире, чтобы комфортно ловить
    if (best.dist > MAG) return null;
    const wall = best.wall;
    const alongLen = wall.isVertical ? (wall.to - wall.from) : (wall.to - wall.from);
    const pos = Math.max(0, Math.min(1, ((wall.isVertical ? win.y : win.x) - wall.from) / (alongLen || 1)));
    const lenNorm = Math.max(0.05, Math.min(1, win.len / (alongLen || 1)));
    // Проверим соседнюю комнату, разделяющую эту стену
    const neighbor = enabledRooms.find(r => r.key !== wall.room.key && r.layout && (
      (wall.isVertical && Math.abs((wall.side === 'left' ? (r.layout!.x + r.layout!.width) : r.layout!.x) - wall.coord) <= 0.001 && !(r.layout!.y >= wall.to || r.layout!.y + r.layout!.height <= wall.from)) ||
      (!wall.isVertical && Math.abs((wall.side === 'top' ? (r.layout!.y + r.layout!.height) : r.layout!.y) - wall.coord) <= 0.001 && !(r.layout!.x >= wall.to || r.layout!.x + r.layout!.width <= wall.from))
    ));
    if (neighbor && neighbor.layout) {
      // между двумя
      const sideB = wall.side === 'left' ? 'right' : wall.side === 'right' ? 'left' : wall.side === 'top' ? 'bottom' : 'top';
      const nb = neighbor.layout;
      const posB = wall.isVertical
        ? Math.max(0, Math.min(1, (win.y - nb.y) / (nb.height || 1)))
        : Math.max(0, Math.min(1, (win.x - nb.x) / (nb.width || 1)));
      return { type: 'between', primary: { key: wall.room.key, name: String(wall.room.name), side: wall.side, pos, len: lenNorm }, secondary: { key: neighbor.key, name: String(neighbor.name), side: sideB as any, pos: posB } };
    }
    return { type: 'single', primary: { key: wall.room.key, name: String(wall.room.name), side: wall.side, pos, len: lenNorm } };
  };

  const handleConfirmAttach = () => {
    if (!pendingAttach) return;
    // Найдём плавающее окно по ID, чтобы взять его ТЕКУЩИЕ координаты
    const floatingWin = floatingWindows.find((w: FloatingWindow) => w.id === pendingAttach.winId);
    if (!floatingWin) return;
    
    // Пересчитаем кандидата привязки на основе ТЕКУЩИХ координат окна
    const currentCandidate = findAttachmentCandidate({ x: floatingWin.x, y: floatingWin.y, len: floatingWin.len, rot: floatingWin.rotation });
    if (!currentCandidate) return;
    
    const findRoom = (key: string) => rooms.find(r => r.key === key) as RoomState | undefined;
    if (currentCandidate.type === 'single') {
      const r = findRoom(currentCandidate.primary.key);
      if (!r) return;
      const newWindow: NonNullable<RoomState['windows']>[number] = {
        side: currentCandidate.primary.side,
        pos: Math.max(0, Math.min(1, currentCandidate.primary.pos)),
        len: Math.max(0.05, Math.min(1, currentCandidate.primary.len))
      };
      onUpdate(r.key, { windows: [ ...(r.windows ?? []), newWindow ] });
    } else if (currentCandidate.type === 'between') {
      const a = findRoom(currentCandidate.primary.key);
      const b = findRoom(currentCandidate.secondary!.key);
      if (a) {
        const newA: NonNullable<RoomState['windows']>[number] = {
          side: currentCandidate.primary.side,
          pos: Math.max(0, Math.min(1, currentCandidate.primary.pos)),
          len: Math.max(0.05, Math.min(1, currentCandidate.primary.len))
        };
        onUpdate(a.key, { windows: [ ...(a.windows ?? []), newA ] });
      }
      if (b) {
        const newB: NonNullable<RoomState['windows']>[number] = {
          side: currentCandidate.secondary!.side,
          pos: Math.max(0, Math.min(1, currentCandidate.secondary!.pos)),
          len: Math.max(0.05, Math.min(1, currentCandidate.primary.len))
        };
        onUpdate(b.key, { windows: [ ...(b.windows ?? []), newB ] });
      }
    }
    setFloatingWindows((ws: FloatingWindow[]) => ws.filter((w: FloatingWindow) => w.id !== pendingAttach.winId));
    setPendingAttach(null);
  };

  const handleCancelAttach = () => setPendingAttach(null);

  const handlePlacedWindowPointerDown = (e: React.PointerEvent, room: RoomState, index: number) => {
    e.stopPropagation();
    setSelectedPlacedWindow({ roomKey: room.key, index });
    const w = (room.windows ?? [])[index];
    if (!w) return;
    const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDrag({
      key: `${room.key}__w${index}`,
      item: { type: 'window', placed: true, room, index, side: w.side },
      type: 'move',
      startX: x,
      startY: y,
      start: { pos: w.pos, len: w.len }
    } as any);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // удаление выполняется через верхнюю панель

  // Prevent overlapping rooms helper
  const resolveNoOverlap = (candidate: { x: number; y: number; width: number; height: number }, movingKey: string) => {
    const others = enabledRooms.filter(r => r.key !== movingKey && r.layout).map(r => ({ key: r.key, ...(r.layout as NonNullable<RoomState['layout']>) }));
    // Clamp within canvas [0,1]
    candidate.x = Math.max(0, Math.min(1 - candidate.width, candidate.x));
    candidate.y = Math.max(0, Math.min(1 - candidate.height, candidate.y));
    let iter = 0;
    while (iter++ < 10) {
      let adjusted = false;
      for (const r of others) {
        const ax1 = candidate.x, ay1 = candidate.y, ax2 = ax1 + candidate.width, ay2 = ay1 + candidate.height;
        const bx1 = r.x, by1 = r.y, bx2 = r.x + r.width, by2 = r.y + r.height;
        const overlapX = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
        const overlapY = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
        if (overlapX > 0 && overlapY > 0) {
          // push out by the minimal axis
          if (overlapX <= overlapY) {
            // move on X
            if (ax1 < bx1) candidate.x = bx1 - candidate.width; else candidate.x = bx2;
            candidate.x = Math.max(0, Math.min(1 - candidate.width, candidate.x));
          } else {
            // move on Y
            if (ay1 < by1) candidate.y = by1 - candidate.height; else candidate.y = by2;
            candidate.y = Math.max(0, Math.min(1 - candidate.height, candidate.y));
          }
          adjusted = true;
        }
      }
      if (!adjusted) break;
    }
    return candidate;
  };

  return (
    <div className="layout-editor">
      {hallway && (
        <div className="layout-controls">
          <div className="entry-side-control">
            <label>Внешний вход:</label>
            <select value={hallway.entrySide || ''} onChange={handleEntryChange}>
              <option value="">Авто</option>
              <option value="left">Слева</option>
              <option value="right">Справа</option>
              <option value="top">Сверху</option>
              <option value="bottom">Снизу</option>
            </select>
          </div>
          <button type="button" className="add-element-btn" onClick={handleAddNewWindow}>Добавить окно</button>
          <button
            type="button"
            className="delete-selected-window-btn"
            onClick={() => {
              if (!selectedPlacedWindow) return;
              const room = rooms.find(r => r.key === selectedPlacedWindow.roomKey) as RoomState | undefined;
              if (!room) return;
              const next = [ ...(room.windows ?? []) ];
              next.splice(selectedPlacedWindow.index, 1);
              onUpdate(room.key, { windows: next });
              setSelectedPlacedWindow(null);
            }}
            disabled={!selectedPlacedWindow}
            title="Удалить выделенное окно"
          >
            Удалить выделенное окно
          </button>
          <button
            type="button"
            className="delete-all-windows-btn"
            onClick={() => {
              // удалить все окна во всех помещениях и сбросить плавающие
              rooms.forEach((r: RoomState) => { if (r.windows && r.windows.length) onUpdate(r.key, { windows: [] }); });
              setFloatingWindows([]);
              setSelectedPlacedWindow(null);
            }}
            title="Удалить все окна"
          >
            Удалить все окна
          </button>
        </div>
      )}
      <div
        ref={canvasRef}
        className="layout-canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e: React.MouseEvent) => { 
          if (e.target === canvasRef.current) { 
            setDrag(null); 
            // НЕ сбрасываем selectedPlacedWindow - оставляем выделение активным
          } 
        }}
      >
        {enabledRooms.map((room: RoomState) => {
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const style: React.CSSProperties = {
            left: `${layout.x * 100}%`,
            top: `${layout.y * 100}%`,
            width: `${layout.width * 100}%`,
            height: `${layout.height * 100}%`,
          };
          return (
            <div key={room.key} className="layout-box" style={style}>
                <div className="layout-box-header">{room.name}</div>
                <div className="layout-box-body" onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, room, 'move')} />
                <div className="layout-resizer" onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, room, 'resize')} />
                <div className="layout-size-hint">{Math.round(layout.width*100)}×{Math.round(layout.height*100)}</div>
                <button type="button" className="layout-rotate" onClick={() => handleRotate(room)} title="Повернуть на 90°">⟳</button>
                
                {(room.windows || []).map((win, idx) => {
                  const isVertical = win.side === 'left' || win.side === 'right';
                  const baseStyle: React.CSSProperties = {
                    position: 'absolute',
                    backgroundColor: '#a3d1ff',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                    zIndex: 6,
                    pointerEvents: 'auto',
                    borderRadius: '2px',
                    cursor: 'grab'
                  };
                  const posStyle: React.CSSProperties = ((): React.CSSProperties => {
                    if (win.side === 'top') {
                      return { top: 0, left: `${win.pos * 100}%`, width: `${win.len * 100}%`, height: '8px' };
                    } else if (win.side === 'bottom') {
                      return { bottom: 0, left: `${win.pos * 100}%`, width: `${win.len * 100}%`, height: '8px' };
                    } else if (win.side === 'left') {
                      return { left: 0, top: `${win.pos * 100}%`, width: '8px', height: `${win.len * 100}%` };
                    } else { // right
                      return { right: 0, top: `${win.pos * 100}%`, width: '8px', height: `${win.len * 100}%` };
                    }
                  })();
                  const winStyle: React.CSSProperties = { ...baseStyle, ...posStyle };
                  const resizerStyle: React.CSSProperties = isVertical
                    ? { position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14 }
                    : { position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 };
                  return (
                    <div key={idx} className="placed-window" style={winStyle}
                      onPointerDown={(e: React.PointerEvent) => handlePlacedWindowPointerDown(e, room, idx)}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (selectedPlacedWindow && selectedPlacedWindow.roomKey === room.key && selectedPlacedWindow.index === idx) {
                          setSelectedPlacedWindow(null);
                        } else {
                          setSelectedPlacedWindow({ roomKey: room.key, index: idx });
                        }
                      }}
                    >
                      <div
                        className="placed-window-resizer"
                        style={resizerStyle}
                        onPointerDown={(e: React.PointerEvent) => {
                          e.stopPropagation();
                          const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
                          const x = (e.clientX - rect.left) / rect.width;
                          const y = (e.clientY - rect.top) / rect.height;
                          setDrag({
                            key: `${room.key}__w${idx}`,
                            item: { type: 'window', placed: true, room, index: idx, side: win.side },
                            type: 'resize',
                            startX: x,
                            startY: y,
                            start: { pos: win.pos, len: win.len }
                          } as any);
                          (e.target as Element).setPointerCapture((e as any).pointerId);
                        }}
                      />
                      {/* Кнопка удаления внутри окна удалена. Удаление управляется из верхней панели. */}
                    </div>
                  );
                })}
            </div>
          );
        })}

        {floatingWindows.map((win: FloatingWindow) => {
          const thickness = 0.015; // canvas units, немного толще визуально
          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${win.x * 100}%`,
            top: `${win.y * 100}%`,
            width: win.rotation === 0 ? `${win.len * 100}%` : `${thickness * 100}%`,
            height: win.rotation === 0 ? `${thickness * 100}%` : `${win.len * 100}%`,
            transform: `translate(-50%, -50%)`,
          };
          return (
            <div key={win.id} className="floating-window" style={style} onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, win, 'move')}>
              <div className="layout-resizer" onPointerDown={(e: React.PointerEvent) => { e.stopPropagation(); handlePointerDown(e, win, 'resize'); }} />
              <button type="button" className="layout-rotate" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRotate(win); }} title="Повернуть на 90°">⟳</button>
            </div>
          );
        })}
      </div>
      {pendingAttach && (
        <div className="attach-window-bar">
          <div className="attach-window-text">
            {pendingAttach.type === 'single'
              ? `Прикрепить окно к помещению ${pendingAttach.primary.name || pendingAttach.primary.key}?`
              : `Прикрепить окно между помещением ${pendingAttach.primary.name || pendingAttach.primary.key} и помещением ${pendingAttach.secondary?.name || pendingAttach.secondary?.key}?`}
          </div>
          <div className="attach-window-actions">
            <button type="button" className="attach-btn" onClick={handleConfirmAttach}>Прикрепить</button>
            <button type="button" className="cancel-btn" onClick={handleCancelAttach}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutEditor;


