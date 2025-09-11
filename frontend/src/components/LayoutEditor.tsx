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

  const enabledRooms = useMemo(() => rooms.filter(r => r.enabled), [rooms]);
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

  return (
    <div className="layout-editor">
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
          };
          return (
            <div key={room.key} className="layout-box" style={style}>
              <div className="layout-box-header">{room.name}</div>
              <div className="layout-box-body" onPointerDown={(e: any) => handlePointerDown(e, room, 'move')} />
              <div className="layout-resizer" onPointerDown={(e: any) => handlePointerDown(e, room, 'resize')} />
              <div className="layout-size-hint">{Math.round(layout.width*100)}×{Math.round(layout.height*100)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutEditor;


