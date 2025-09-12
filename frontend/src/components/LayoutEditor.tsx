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
        const nx = snapTo(drag.start.x + dx);
        const ny = snapTo(drag.start.y + dy);
        setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === drag.key ? { ...w, x: nx, y: ny } : w));
      } else { // resize
        const newLen = Math.max(0.05, snapTo(drag.start.len + (drag.start.rot === 90 ? dy : dx)));
        setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === drag.key ? { ...w, len: newLen } : w));
      }
    } else if (drag.item.type === 'window' && (drag as any).placed === true) {
      // Drag already placed window along its wall inside room
      const room = drag.item.room as RoomState;
      const idx = (drag.item.index as number);
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const side = drag.item.side as 'left' | 'right' | 'top' | 'bottom';
      // compute new pos in 0..1 along the wall axis
      let newPos = 0;
      if (side === 'left' || side === 'right') newPos = Math.max(0, Math.min(1, drag.start.pos + dy / (layout.height || 1)));
      else newPos = Math.max(0, Math.min(1, drag.start.pos + dx / (layout.width || 1)));
      const updated = [ ...(room.windows ?? []) ];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], pos: snapTo(newPos) } as NonNullable<RoomState['windows']>[number];
        onUpdate(room.key, { windows: updated });
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
      if (drag.item.type === 'window' && (drag as any).placed !== true) {
        snapWindowToWall(drag.item);
      }
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

  const snapWindowToWall = (win: FloatingWindow) => {
    const bestSnap = enabledRooms.reduce<{ room: RoomState; side: 'left' | 'right' | 'top' | 'bottom'; pos: number; len: number } | null>((best, room) => {
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      const sides: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
      for (const side of sides) {
        const { x, y, width, height } = layout;
        const isVertical = side === 'left' || side === 'right';
        const roomPos = isVertical ? y : x;
        const roomLen = isVertical ? height : width;
        const winPos = isVertical ? win.y : win.x;
        const winLen = win.len;
        const overlap = Math.max(0, Math.min(roomPos + roomLen, winPos + winLen) - Math.max(roomPos, winPos));
        const distance = Math.abs((isVertical ? win.x : win.y) - (isVertical ? x : y));
        if (overlap > 0.05 && distance < 0.05 && (!best || overlap > best.len)) {
          best = { room, side, pos: (winPos - roomPos) / roomLen, len: winLen / roomLen };
        }
      }
      return best;
    }, null);

    if (bestSnap) {
      const { room, side, pos, len } = bestSnap;
      const newWindow: NonNullable<RoomState['windows']>[number] = { side, pos: Math.max(0, Math.min(1, pos)), len: Math.max(0.05, Math.min(1, len)) };
      const updatedWindows: NonNullable<RoomState['windows']> = [ ...(room.windows ?? []), newWindow ];
      onUpdate(room.key, { windows: updatedWindows });
      setFloatingWindows((ws: FloatingWindow[]) => ws.filter((w: FloatingWindow) => w.id !== win.id));
    }
  };

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
      start: { pos: w.pos }
    } as any);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleDeletePlacedWindow = (room: RoomState, index: number) => {
    const next = [ ...(room.windows ?? []) ];
    next.splice(index, 1);
    onUpdate(room.key, { windows: next });
    setSelectedPlacedWindow(null);
  };

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
        </div>
      )}
      <div
        ref={canvasRef}
        className="layout-canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e: React.MouseEvent) => { if (e.target === canvasRef.current) { setDrag(null); setSelectedPlacedWindow(null); } }}
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
                  const translateX = win.side === 'left' ? 0 : win.side === 'right' ? 100 : win.pos * 100;
                  const translateY = win.side === 'top' ? 0 : win.side === 'bottom' ? 100 : win.pos * 100;
                  const winStyle: React.CSSProperties = {
                    position: 'absolute',
                    backgroundColor: '#a3d1ff',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                    zIndex: 6,
                    pointerEvents: 'auto',
                    transformOrigin: '0 0',
                    transform: `translate(${translateX}%, ${translateY}%) rotate(${isVertical ? 90 : 0}deg)`,
                    width: isVertical ? '8px' : `${win.len * 100}%`,
                    height: isVertical ? `${win.len * 100}%` : '8px',
                    borderRadius: '2px',
                    cursor: 'grab'
                  };
                  const showDelete = selectedPlacedWindow && selectedPlacedWindow.roomKey === room.key && selectedPlacedWindow.index === idx;
                  return (
                    <div key={idx} className="placed-window" style={winStyle}
                      onPointerDown={(e: React.PointerEvent) => handlePlacedWindowPointerDown(e, room, idx)}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedPlacedWindow({ roomKey: room.key, index: idx }); }}
                    >
                      {showDelete && (
                        <button
                          type="button"
                          className="window-delete-btn"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeletePlacedWindow(room, idx); }}
                          title="Удалить окно"
                        >
                          Удалить окно
                        </button>
                      )}
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
    </div>
  );
};

export default LayoutEditor;


