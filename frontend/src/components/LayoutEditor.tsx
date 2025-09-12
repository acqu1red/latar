import React, { useMemo, useRef, useState } from 'react';
import type { RoomState } from '../lib/api';

interface LayoutEditorProps {
  rooms: RoomState[];
  onUpdate: (key: string, updates: Partial<RoomState>) => void;
}

type FloatingWindow = { 
  id: number; 
  x: number; 
  y: number; 
  len: number; 
  rotation: 0 | 90; 
  type: 'window';
  isHovered: boolean;
};

type WindowAttachmentPreview = {
  roomName: string;
  side: 'left' | 'right' | 'top' | 'bottom';
  pos: number;
  len: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Простая канва для расстановки комнат. Координаты нормализованы 0..1
const LayoutEditor: React.FC<LayoutEditorProps> = ({ rooms, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ key: string | number; item: any; type: 'move' | 'resize'; startX: number; startY: number; start: any } | null>(null);
  const [floatingWindows, setFloatingWindows] = useState<FloatingWindow[]>([]);
  const [selectedPlacedWindow, setSelectedPlacedWindow] = useState<{ roomKey: string; index: number } | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<WindowAttachmentPreview | null>(null);
  const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);

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
        nx = snapTo(nx);
        ny = snapTo(ny);
        
        // Обновляем позицию окна
        setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
          w.id === (drag.key as number) ? { ...w, x: nx, y: ny } : w
        ));
        
        // Обновляем превью привязки
        const preview = findNearestWall(nx, ny, drag.start.len);
        setAttachmentPreview(preview);
      } else { // resize
        const newLen = Math.max(0.05, snapTo(drag.start.len + (drag.start.rot === 90 ? dy : dx)));
        setFloatingWindows((prev: FloatingWindow[]) => prev.map((w: FloatingWindow) => 
          w.id === (drag.key as number) ? { ...w, len: newLen } : w
        ));
        
        // Обновляем превью с новой длиной
        const window = floatingWindows.find((w: FloatingWindow) => w.id === (drag.key as number));
        if (window) {
          const preview = findNearestWall(window.x, window.y, newLen);
          setAttachmentPreview(preview);
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

  // Добавить новое плавающее окно
  const handleAddNewWindow = () => {
    const newId = Date.now();
    setFloatingWindows((prev: FloatingWindow[]) => [...prev, { 
      id: newId, 
      x: 0.5, 
      y: 0.2, 
      len: 0.15, 
      rotation: 0, 
      type: 'window',
      isHovered: false
    }]);
  };

  // Найти ближайшую стену для превью привязки
  const findNearestWall = (winX: number, winY: number, winLen: number): WindowAttachmentPreview | null => {
    let closestWall: WindowAttachmentPreview | null = null;
    let minDistance = Infinity;

    for (const room of enabledRooms) {
      const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
      
      // Проверяем все 4 стены комнаты
      const walls = [
        { side: 'left' as const, coord: layout.x, isVertical: true },
        { side: 'right' as const, coord: layout.x + layout.width, isVertical: true },
        { side: 'top' as const, coord: layout.y, isVertical: false },
        { side: 'bottom' as const, coord: layout.y + layout.height, isVertical: false }
      ];

      for (const wall of walls) {
        const distance = Math.abs((wall.isVertical ? winX : winY) - wall.coord);
        
        if (distance < minDistance && distance < 0.05) { // Порог захвата
          const alongAxis = wall.isVertical ? winY : winX;
          const wallStart = wall.isVertical ? layout.y : layout.x;
          const wallEnd = wall.isVertical ? layout.y + layout.height : layout.x + layout.width;
          
          // Проверяем, что окно находится в пределах стены
          if (alongAxis >= wallStart && alongAxis <= wallEnd) {
            const pos = (alongAxis - wallStart) / (wallEnd - wallStart);
            const normalizedLen = winLen / (wallEnd - wallStart);
            
            // Вычисляем позицию превью
            let previewX, previewY, previewWidth, previewHeight;
            if (wall.side === 'left') {
              previewX = layout.x;
              previewY = layout.y + pos * layout.height;
              previewWidth = 8;
              previewHeight = normalizedLen * layout.height;
            } else if (wall.side === 'right') {
              previewX = layout.x + layout.width - 8;
              previewY = layout.y + pos * layout.height;
              previewWidth = 8;
              previewHeight = normalizedLen * layout.height;
            } else if (wall.side === 'top') {
              previewX = layout.x + pos * layout.width;
              previewY = layout.y;
              previewWidth = normalizedLen * layout.width;
              previewHeight = 8;
            } else { // bottom
              previewX = layout.x + pos * layout.width;
              previewY = layout.y + layout.height - 8;
              previewWidth = normalizedLen * layout.width;
              previewHeight = 8;
            }

            closestWall = {
              roomName: String(room.name),
              side: wall.side,
              pos: Math.max(0, Math.min(1, pos)),
              len: Math.max(0.05, Math.min(1, normalizedLen)),
              x: previewX,
              y: previewY,
              width: previewWidth,
              height: previewHeight
            };
            minDistance = distance;
          }
        }
      }
    }

    return closestWall;
  };

  // Прикрепить окно к стене
  const attachWindowToWall = (windowId: number) => {
    const window = floatingWindows.find((w: FloatingWindow) => w.id === windowId);
    if (!window || !attachmentPreview) return;

    // Найдём комнату для привязки
    const targetRoom = enabledRooms.find(room => String(room.name) === attachmentPreview.roomName);
    if (!targetRoom) return;

    // Создаём новое окно
    const newWindow: NonNullable<RoomState['windows']>[number] = {
      side: attachmentPreview.side,
      pos: attachmentPreview.pos,
      len: attachmentPreview.len
    };

    // Обновляем комнату
    onUpdate(targetRoom.key, { 
      windows: [...(targetRoom.windows ?? []), newWindow] 
    });

    // Удаляем плавающее окно
    setFloatingWindows((prev: FloatingWindow[]) => prev.filter((w: FloatingWindow) => w.id !== windowId));
    setAttachmentPreview(null);
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
                  const isSelected = selectedPlacedWindow && selectedPlacedWindow.roomKey === room.key && selectedPlacedWindow.index === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`placed-window ${isSelected ? 'selected' : ''}`} 
                      style={winStyle}
                      onPointerDown={(e: React.PointerEvent) => handlePlacedWindowPointerDown(e, room, idx)}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (isSelected) {
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

        {/* Превью привязки окна */}
        {attachmentPreview && (
          <div 
            className="window-attachment-preview"
            style={{
              position: 'absolute',
              left: `${attachmentPreview.x * 100}%`,
              top: `${attachmentPreview.y * 100}%`,
              width: `${attachmentPreview.width}px`,
              height: `${attachmentPreview.height}px`,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Плавающие окна */}
        {floatingWindows.map((win: FloatingWindow) => {
          const thickness = 12; // px
          const isVertical = win.rotation === 90;
          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${win.x * 100}%`,
            top: `${win.y * 100}%`,
            width: isVertical ? `${thickness}px` : `${win.len * 100}%`,
            height: isVertical ? `${win.len * 100}%` : `${thickness}px`,
            transform: `translate(-50%, -50%)`,
          };
          
          const canAttach = attachmentPreview !== null;
          
          return (
            <div 
              key={win.id} 
              className={`floating-window ${canAttach ? 'can-attach' : ''} ${hoveredWindow === win.id ? 'hovered' : ''}`}
              style={style} 
              onPointerDown={(e: React.PointerEvent) => handlePointerDown(e, win, 'move')}
              onMouseEnter={() => setHoveredWindow(win.id)}
              onMouseLeave={() => setHoveredWindow(null)}
              onDoubleClick={() => canAttach && attachWindowToWall(win.id)}
            >
              <div 
                className="floating-window-resizer" 
                onPointerDown={(e: React.PointerEvent) => { 
                  e.stopPropagation(); 
                  handlePointerDown(e, win, 'resize'); 
                }} 
              />
              <button 
                type="button" 
                className="floating-window-rotate" 
                onClick={(e: React.MouseEvent) => { 
                  e.stopPropagation(); 
                  handleRotate(win); 
                }} 
                title="Повернуть на 90°"
              >
                ⟳
              </button>
              {canAttach && (
                <div className="attach-hint">
                  Дважды кликните для привязки к {attachmentPreview.roomName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutEditor;


