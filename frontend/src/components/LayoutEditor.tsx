import React, { useMemo, useRef, useState } from 'react';
import type { RoomState } from '../lib/api';

interface LayoutEditorProps {
  rooms: RoomState[];
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
}

// Простая канва для расстановки комнат. Координаты нормализованы 0..1
const LayoutEditor: React.FC<LayoutEditorProps> = ({ rooms, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ key: string; type: 'move' | 'resize'; startX: number; startY: number; start: { x: number; y: number; w: number; h: number } } | null>(null);
  const [winEditor, setWinEditor] = useState<{ open: boolean; key: string | null; side: 'left'|'right'|'top'|'bottom' | null; pos: number; len: number }>({ open: false, key: null, side: null, pos: 0.5, len: 0.2 });

  const enabledRooms = useMemo(() => rooms.filter(r => r.enabled), [rooms]);
  const hallway = useMemo(() => rooms.find(r => /прихож|коридор|hall|entry|тамбур/i.test(String(r.name))), [rooms]);
  const [snap] = useState(0.02); // 2% snapping grid

  const handlePointerDown = (e: React.PointerEvent, room: RoomState, type: 'move' | 'resize') => {
    const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
    setDrag({ key: room.key, type, startX: x, startY: y, start: { x: layout.x, y: layout.y, w: layout.width, h: layout.height } });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const rect = (canvasRef.current as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const dx = x - drag.startX;
    const dy = y - drag.startY;

    const snapTo = (v: number) => Math.round(v / snap) * snap;
    if (drag.type === 'move') {
      let nx = Math.min(1, Math.max(0, drag.start.x + dx));
      let ny = Math.min(1, Math.max(0, drag.start.y + dy));
      nx = snapTo(nx); ny = snapTo(ny);
      onUpdate(drag.key, { layout: { x: nx, y: ny, width: drag.start.w, height: drag.start.h } });
    } else {
      let nw = Math.min(1, Math.max(0.05, drag.start.w + dx));
      let nh = Math.min(1, Math.max(0.05, drag.start.h + dy));
      nw = snapTo(nw); nh = snapTo(nh);
      onUpdate(drag.key, { layout: { x: drag.start.x, y: drag.start.y, width: nw, height: nh } });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (drag) {
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    }
    setDrag(null);
  };

  const handleEntryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RoomState['entrySide'];
    if (hallway) {
      onUpdate(hallway.key, { entrySide: value });
    }
  };

  const handleRotate = (room: RoomState) => {
    const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
    const rotated: RoomState['rotation'] = (room.rotation === 90 ? 0 : 90);
    // Поворот на 90°: меняем width/height местами, сохраняем левый верхний угол
    onUpdate(room.key, { rotation: rotated, layout: { x: layout.x, y: layout.y, width: layout.height, height: layout.width } });
  };

  const openWindowEditor = (roomKey: string, side: 'left'|'right'|'top'|'bottom') => {
    setWinEditor({ open: true, key: roomKey, side, pos: 0.5, len: 0.22 });
  };

  const applyWindow = () => {
    if (!winEditor.open || !winEditor.key || !winEditor.side) { setWinEditor((s: any) => ({ ...s, open: false })); return; }
    const target = rooms.find(r => r.key === winEditor.key);
    if (!target) { setWinEditor((s: any) => ({ ...s, open: false })); return; }
    const next = [...(target.windows || []) , { side: winEditor.side, pos: Math.max(0.05, Math.min(0.95, winEditor.pos)), len: Math.max(0.05, Math.min(0.8, winEditor.len)) }];
    onUpdate(target.key, { windows: next });
    setWinEditor((s: any) => ({ ...s, open: false }));
  };

  return (
    <div className="layout-editor">
      {hallway && (
        <div className="entry-side-control" style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 600, marginRight: '0.5rem' }}>Внешний вход (сторона прихожей):</label>
          <select value={hallway.entrySide || ''} onChange={handleEntryChange}>
            <option value="">Авто</option>
            <option value="left">Слева</option>
            <option value="right">Справа</option>
            <option value="top">Сверху</option>
            <option value="bottom">Снизу</option>
          </select>
        </div>
      )}
      <div
        ref={canvasRef}
        className="layout-canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {enabledRooms.map((room) => {
          const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
          const style: React.CSSProperties = {
            left: `${layout.x * 100}%`,
            top: `${layout.y * 100}%`,
            width: `${layout.width * 100}%`,
            height: `${layout.height * 100}%`,
            transform: room.rotation === 90 ? 'rotate(0deg)' : 'none'
          };
          return (
            <div key={room.key} className="layout-box" style={style}>
              <div className="layout-box-header">{room.name}</div>
              <div className="layout-box-body" onPointerDown={(e: any) => handlePointerDown(e, room, 'move')} />
              <div className="layout-resizer" onPointerDown={(e: any) => handlePointerDown(e, room, 'resize')} />
              <div className="layout-size-hint">{Math.round(layout.width*100)}×{Math.round(layout.height*100)}</div>
              <button type="button" className="layout-rotate" onClick={() => handleRotate(room)} title="Повернуть на 90°">⟳</button>
              {/* Кнопки добавления окна по сторонам */}
              <button className="add-window-btn top" onClick={() => openWindowEditor(room.key, 'top')}>Добавить окна</button>
              <button className="add-window-btn bottom" onClick={() => openWindowEditor(room.key, 'bottom')}>Добавить окна</button>
              <button className="add-window-btn left" onClick={() => openWindowEditor(room.key, 'left')}>Добавить окна</button>
              <button className="add-window-btn right" onClick={() => openWindowEditor(room.key, 'right')}>Добавить окна</button>
            </div>
          );
        })}
        {winEditor.open && (
          <div className="window-editor-modal">
            <div className="window-editor-card">
              <div className="window-editor-title">Добавить окно — стена: {winEditor.side}</div>
              <label>Позиция (0..1)
                <input type="range" min={0} max={1} step={0.01} value={winEditor.pos} onChange={(e: any) => setWinEditor((s: any) => ({ ...s, pos: Number(e.target.value) }))} />
              </label>
              <label>Длина (0.05..0.8)
                <input type="range" min={0.05} max={0.8} step={0.01} value={winEditor.len} onChange={(e: any) => setWinEditor((s: any) => ({ ...s, len: Number(e.target.value) }))} />
              </label>
              <div className="window-editor-actions">
                <button onClick={() => setWinEditor((s: any) => ({ ...s, open: false }))}>Отмена</button>
                <button onClick={applyWindow}>Готово</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutEditor;


