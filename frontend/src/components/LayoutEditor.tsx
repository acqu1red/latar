import React, { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { RoomState } from '../lib/api';

interface LayoutEditorProps {
  rooms: RoomState[];
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
}

// Простая канва для расстановки комнат. Координаты нормализованы 0..1
const LayoutEditor: React.FC<LayoutEditorProps> = ({ rooms, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ key: string; type: 'move' | 'resize'; startX: number; startY: number; start: { x: number; y: number; w: number; h: number } } | null>(null);
  const [selectedRoomKey, setSelectedRoomKey] = useState<string | null>(null);
  const [windowModal, setWindowModal] = useState<{ isOpen: boolean; room: RoomState | null }>({ isOpen: false, room: null });

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

  const handlePointerUp = (e: React.PointerEvent, room: RoomState) => {
    if (drag) {
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
      setDrag(null);
    } else {
      // Если не было перетаскивания, считаем это кликом для выделения
      setSelectedRoomKey(room.key);
    }
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

  const handleOpenWindowEditor = () => {
    const room = rooms.find(r => r.key === selectedRoomKey);
    if (room) {
      setWindowModal({ isOpen: true, room });
    }
  };

  const handleSaveWindows = (key: string, windows: RoomState['windows']) => {
    onUpdate(key, { windows });
    setWindowModal({ isOpen: false, room: null });
    setSelectedRoomKey(null);
  };

  const handleCloseWindowEditor = () => {
    setWindowModal({ isOpen: false, room: null });
    setSelectedRoomKey(null);
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
        onPointerCancel={() => setDrag(null)}
        onClick={(e: any) => { if (e.target === canvasRef.current) setSelectedRoomKey(null); }}
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
            <div
              key={room.key}
              className={`layout-box ${selectedRoomKey === room.key ? 'selected' : ''}`}
              style={style}
              onPointerUp={(e: React.PointerEvent) => handlePointerUp(e, room)}
            >
              <div className="layout-box-header">{room.name}</div>
              <div className="layout-box-body" onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, room, 'move')} />
              <div className="layout-resizer" onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, room, 'resize')} />
              <div className="layout-size-hint">{Math.round(layout.width*100)}×{Math.round(layout.height*100)}</div>
              <button type="button" className="layout-rotate" onClick={() => handleRotate(room)} title="Повернуть на 90°">⟳</button>
              {selectedRoomKey === room.key && (
                <button className="add-window-prompt-btn" onClick={handleOpenWindowEditor}>
                  Добавить окно?
                </button>
              )}
            </div>
          );
        })}
      </div>
      {windowModal.isOpen && windowModal.room && (
        <WindowEditorModal
          room={windowModal.room}
          onSave={handleSaveWindows}
          onClose={handleCloseWindowEditor}
        />
      )}
    </div>
  );
};

interface WindowEditorModalProps {
  room: RoomState;
  onSave: (key: string, windows: RoomState['windows']) => void;
  onClose: () => void;
}

const WindowEditorModal: React.FC<WindowEditorModalProps> = ({ room, onSave, onClose }) => {
  const [windows, setWindows] = useState(room.windows || []);
  const [activeWall, setActiveWall] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [currentPos, setCurrentPos] = useState(0.5);
  const [currentLen, setCurrentLen] = useState(0.22);

  const handleWallClick = (side: 'top' | 'bottom' | 'left' | 'right') => {
    setActiveWall(side);
    setCurrentPos(0.5);
    setCurrentLen(0.22);
  };

  const handleAddWindow = () => {
    if (!activeWall) return;
    setWindows([...windows, { side: activeWall, pos: currentPos, len: currentLen }]);
    setActiveWall(null);
  };

  const handleResetWall = () => {
    if (activeWall) {
      setWindows(windows.filter((w: { side: string; pos: number; len: number }) => w.side !== activeWall));
    }
  };

  const handleSave = () => onSave(room.key, windows);
  const handleResetAll = () => setWindows(room.windows || []);

  return (
    <div className="window-editor-overlay" onClick={onClose}>
      <div className="window-editor-modal" onClick={(e: any) => e.stopPropagation()}>
        <h3>Редактор окон: {room.name}</h3>
        <div className="window-editor-canvas">
          <div className="window-editor-room">
            {windows.map((w: { side: string; pos: number; len: number }, i: number) => (
                <div key={i} className={`window-preview ${w.side}`} style={{
                    ...(w.side === 'top' || w.side === 'bottom' ? { left: `${w.pos * 100}%`, width: `${w.len * 100}%` } : {}),
                    ...(w.side === 'left' || w.side === 'right' ? { top: `${w.pos * 100}%`, height: `${w.len * 100}%` } : {}),
                }} />
            ))}
            <div className="wall wall-top" onClick={() => handleWallClick('top')} />
            <div className="wall wall-bottom" onClick={() => handleWallClick('bottom')} />
            <div className="wall wall-left" onClick={() => handleWallClick('left')} />
            <div className="wall wall-right" onClick={() => handleWallClick('right')} />
            {activeWall && (
              <div className={`wall-settings ${activeWall}`}>
                  <h4>Стена: {activeWall}</h4>
                  <label>Позиция <input type="range" min={0.05} max={0.95} step={0.01} value={currentPos} onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPos(parseFloat(e.target.value))} /></label>
                  <label>Длина <input type="range" min={0.1} max={0.8} step={0.01} value={currentLen} onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentLen(parseFloat(e.target.value))} /></label>
                  <div className="wall-settings-actions">
                      <button onClick={handleResetWall}>Сбросить</button>
                      <button onClick={handleAddWindow}>Готово</button>
                  </div>
              </div>
            )}
          </div>
        </div>
        <div className="window-editor-actions">
            <button onClick={handleResetAll} className="secondary">Сбросить всё</button>
            <button onClick={handleSave} className="primary">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default LayoutEditor;


