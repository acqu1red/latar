import React, { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
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

  const enabledRooms = useMemo(() => rooms.filter(r => r.enabled), [rooms]);
  const hallway = useMemo(() => rooms.find(r => /прихож|коридор|hall|entry|тамбур/i.test(String(r.name))), [rooms]);
  const [snap] = useState(0.02); // 2% snapping grid

  const handlePointerDown = (e: ReactPointerEvent, item: RoomState | FloatingWindow, type: 'move' | 'resize') => {
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

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!drag) return;
    const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / rect.width;
    const currentY = (e.clientY - rect.top) / rect.height;
    const dx = currentX - drag.startX;
    const dy = currentY - drag.startY;
    const snapTo = (v: number) => Math.round(v / snap) * snap;

    if (drag.item.type === 'window') {
      if (drag.type === 'move') {
        const nx = snapTo(drag.start.x + dx);
        const ny = snapTo(drag.start.y + dy);
        setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === drag.key ? { ...w, x: nx, y: ny } : w));
      } else { // resize
        const newLen = Math.max(0.05, snapTo(drag.start.len + (drag.start.rot === 90 ? dy : dx)));
        setFloatingWindows((ws: FloatingWindow[]) => ws.map((w: FloatingWindow) => w.id === drag.key ? { ...w, len: newLen } : w));
      }
    } else { // room
      if (drag.type === 'move') {
        let nx = Math.min(1, Math.max(0, drag.start.x + dx));
        let ny = Math.min(1, Math.max(0, drag.start.y + dy));
        nx = snapTo(nx); ny = snapTo(ny);
        onUpdate(drag.key as string, { layout: { x: nx, y: ny, width: drag.start.w, height: drag.start.h } });
      } else {
        let nw = Math.min(1, Math.max(0.05, drag.start.w + dx));
        let nh = Math.min(1, Math.max(0.05, drag.start.h + dy));
        nw = snapTo(nw); nh = snapTo(nh);
        onUpdate(drag.key as string, { layout: { x: drag.start.x, y: drag.start.y, width: nw, height: nh } });
      }
    }
  };

  const handlePointerUp = (e: ReactPointerEvent) => {
    if (drag) {
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
      if (drag.item.type === 'window') {
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
        onClick={(e: any) => { if (e.target === canvasRef.current) setDrag(null); }}
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
                <div className="layout-box-body" onPointerDown={(e: ReactPointerEvent) => handlePointerDown(e, room, 'move')} />
                <div className="layout-resizer" onPointerDown={(e: ReactPointerEvent) => handlePointerDown(e, room, 'resize')} />
                <div className="layout-size-hint">{Math.round(layout.width*100)}×{Math.round(layout.height*100)}</div>
                <button type="button" className="layout-rotate" onClick={() => handleRotate(room)} title="Повернуть на 90°">⟳</button>
                
                {(room.windows || []).map((win, idx) => {
                  const winStyle: React.CSSProperties = {
                    position: 'absolute',
                    backgroundColor: '#a3d1ff',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                    zIndex: 5,
                    pointerEvents: 'none',
                    transformOrigin: '0 0',
                    transform: `translate(${win.side === 'left' ? 0 : win.side === 'right' ? layout.width : win.pos * layout.width}px, ${win.side === 'top' ? 0 : win.side === 'bottom' ? layout.height : win.pos * layout.height}px) rotate(${win.side === 'left' || win.side === 'right' ? 90 : 0}deg)`,
                    width: `${win.len * (win.side === 'left' || win.side === 'right' ? layout.height : layout.width)}px`,
                    height: '4px',
                  };
                  return <div key={idx} className="placed-window" style={winStyle} />;
                })}
            </div>
          );
        })}

        {floatingWindows.map((win: FloatingWindow) => {
          const thickness = 0.02; // canvas units
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
              <button type="button" className="layout-rotate" onClick={(e: any) => { e.stopPropagation(); handleRotate(win); }} title="Повернуть на 90°">⟳</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutEditor;


