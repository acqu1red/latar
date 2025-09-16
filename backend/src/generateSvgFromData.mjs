

/**
 * Generates precise SVG floor plan from room data and layout coordinates
 * @param {Array} rooms - Array of room objects with layout, analysis, and connection data
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{svgDataUrl: string, pngDataUrl: string}>} Generated floor plan
 */
export async function generateSvgFromData(rooms, totalSqm) {
    // Размеры канвы конструктора (соответствуют LayoutEditor)
    const CONSTRUCTOR_WIDTH = 1000;
    const CONSTRUCTOR_HEIGHT = 700;
    
    // Размеры SVG (увеличиваем для качества)
    const SVG_SCALE = 2;
    const CANVAS_WIDTH = CONSTRUCTOR_WIDTH * SVG_SCALE;
    const CANVAS_HEIGHT = CONSTRUCTOR_HEIGHT * SVG_SCALE;
    const MARGIN = 20 * SVG_SCALE;
    
    // Единая толщина стен для внешних и внутренних стен
    const WALL_THICKNESS = 6 * SVG_SCALE;
    const ICON_STROKE = 2 * SVG_SCALE;
    const ICON_STROKE_COLOR = '#2F2F2F';
    const ICON_FILL_LIGHT = '#F5F6F9';

    // Функция для создания схематичного окна с 4 линиями и перегородками
    function createLayeredWindow(x, y, length, depth, orientation) {
        const isHorizontal = orientation === 'horizontal';
        
        // Используем переданную глубину как ширину окна
        const WINDOW_WIDTH = depth; // ширина окна = переданная глубина
        const lineColor = '#2F2F2F';
        
        // Адаптивная толщина линий в зависимости от ширины окна
        const lineThickness = Math.max(1, Math.min(3, WINDOW_WIDTH / 15)); // 1-3px в зависимости от ширины окна
        
        let windowGroup = `<g>`;
        
        if (isHorizontal) {
            // Горизонтальное окно (top/bottom стены)
            // Линии должны полностью покрывать длину окна без щелей
            
            // 1. Внешние границы окна (полная длина без отступов)
            windowGroup += `
                <line x1="${x}" y1="${y + 1}" x2="${x + length}" y2="${y + 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x}" y1="${y + WINDOW_WIDTH - 1}" x2="${x + length}" y2="${y + WINDOW_WIDTH - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 2. Внутренние линии (полная длина без отступов)
            const middleY1 = y + (WINDOW_WIDTH * 0.25);
            const middleY2 = y + (WINDOW_WIDTH * 0.75);
            
            windowGroup += `
                <line x1="${x}" y1="${middleY1}" x2="${x + length}" y2="${middleY1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x}" y1="${middleY2}" x2="${x + length}" y2="${middleY2}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 3. Вертикальные перегородки (строго внутри внутренних линий)
            const mullionCount = Math.max(1, Math.min(2, Math.floor(length / 100)));
            const mullionSpacing = length / (mullionCount + 1);
            
            for (let i = 1; i <= mullionCount; i++) {
                const mullionX = x + i * mullionSpacing;
                windowGroup += `
                    <line x1="${mullionX}" y1="${middleY1}" x2="${mullionX}" y2="${middleY2}" 
                          stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                `;
            }
            
        } else {
            // Вертикальное окно (left/right стены)
            // Линии должны полностью покрывать длину окна без щелей
            
            // 1. Внешние границы окна (полная длина без отступов)
            windowGroup += `
                <line x1="${x}" y1="${y + 1}" x2="${x}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x + WINDOW_WIDTH}" y1="${y + 1}" x2="${x + WINDOW_WIDTH}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 2. Внутренние линии (полная длина без отступов)
            const middleX1 = x + (WINDOW_WIDTH * 0.25);
            const middleX2 = x + (WINDOW_WIDTH * 0.75);
            
            windowGroup += `
                <line x1="${middleX1}" y1="${y + 1}" x2="${middleX1}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${middleX2}" y1="${y + 1}" x2="${middleX2}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 3. Горизонтальные перегородки (строго внутри внутренних линий)
            const mullionCount = Math.max(1, Math.min(2, Math.floor(length / 100)));
            const mullionSpacing = length / (mullionCount + 1);
            
            for (let i = 1; i <= mullionCount; i++) {
                const mullionY = y + i * mullionSpacing;
                windowGroup += `
                    <line x1="${middleX1}" y1="${mullionY}" x2="${middleX2}" y2="${mullionY}" 
                          stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                `;
            }
        }
        
        windowGroup += `</g>`;
        return windowGroup;
    }

    // Convert normalized coordinates (0-1) to pixel coordinates
    // Строго используем размеры из конструктора
    const pixelRooms = rooms.map(room => {
        const layout = room.layout || { x: 0, y: 0, width: 0.2, height: 0.2 };
        const pixelRoom = {
            ...room,
            // Прямое масштабирование из конструктора в SVG
            pixelX: MARGIN + layout.x * CONSTRUCTOR_WIDTH * SVG_SCALE,
            pixelY: MARGIN + layout.y * CONSTRUCTOR_HEIGHT * SVG_SCALE,
            pixelWidth: layout.width * CONSTRUCTOR_WIDTH * SVG_SCALE,
            pixelHeight: layout.height * CONSTRUCTOR_HEIGHT * SVG_SCALE,
            // Используем данные дверей и окон из конструктора
            doors: Array.isArray(room.doors) ? [...room.doors] : [],
            windows: Array.isArray(room.windows) ? [...room.windows] : [],
            entrySide: room.entrySide || null,
        };
        
        
        return pixelRoom;
    });

    // Определяем константы для проверок
    const EPS = 1;
    
    // Определяем границы всего плана для выявления внешних стен (перемещаем сразу после pixelRooms)
    const planBounds = {
        left: Math.min(...pixelRooms.map(r => r.pixelX)),
        right: Math.max(...pixelRooms.map(r => r.pixelX + r.pixelWidth)),
        top: Math.min(...pixelRooms.map(r => r.pixelY)),
        bottom: Math.max(...pixelRooms.map(r => r.pixelY + r.pixelHeight))
    };

    // Минимальная коррекция только для сглаживания углов (не более 3 пикселей)
    const MINIMAL_CORRECTION = 3 * SVG_SCALE;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const applyMinimalCorrection = () => {
        // Только легкое выравнивание стен для сглаживания углов
        const vEdges = [];
        const hEdges = [];
        pixelRooms.forEach((r, idx) => {
            vEdges.push({ idx, kind: 'left', value: r.pixelX });
            vEdges.push({ idx, kind: 'right', value: r.pixelX + r.pixelWidth });
            hEdges.push({ idx, kind: 'top', value: r.pixelY });
            hEdges.push({ idx, kind: 'bottom', value: r.pixelY + r.pixelHeight });
        });

        const alignEdges = (edges, isVertical) => {
            edges.sort((a, b) => a.value - b.value);
            let group = [];
            const applyGroup = (grp) => {
                if (grp.length <= 1) return;
                const first = grp[0].value;
                const last = grp[grp.length - 1].value;
                if (last - first > MINIMAL_CORRECTION) return;
                const avg = grp.reduce((s, e) => s + e.value, 0) / grp.length;
                grp.forEach(e => {
                    const r = pixelRooms[e.idx];
                    if (isVertical) {
                        const shift = (e.kind === 'left') ? (avg - r.pixelX) : (avg - (r.pixelX + r.pixelWidth));
                        // Ограничиваем сдвиг максимум 3 пикселями
                        const limitedShift = Math.max(-MINIMAL_CORRECTION, Math.min(MINIMAL_CORRECTION, shift));
                        r.pixelX += limitedShift;
                    } else {
                        const shift = (e.kind === 'top') ? (avg - r.pixelY) : (avg - (r.pixelY + r.pixelHeight));
                        // Ограничиваем сдвиг максимум 3 пикселями
                        const limitedShift = Math.max(-MINIMAL_CORRECTION, Math.min(MINIMAL_CORRECTION, shift));
                        r.pixelY += limitedShift;
                    }
                });
            };

            for (let i = 0; i < edges.length; i++) {
                if (group.length === 0) group.push(edges[i]);
                else if (Math.abs(edges[i].value - group[0].value) <= MINIMAL_CORRECTION) group.push(edges[i]);
                else { applyGroup(group); group = [edges[i]]; }
            }
            applyGroup(group);
        };

        alignEdges(vEdges, true);
        alignEdges(hEdges, false);

        // Клампим положения в рабочую область. Ширину/высоту НЕ ТРОГАЕМ!
        pixelRooms.forEach(r => {
            r.pixelX = clamp(r.pixelX, MARGIN, CANVAS_WIDTH - MARGIN - r.pixelWidth);
            r.pixelY = clamp(r.pixelY, MARGIN, CANVAS_HEIGHT - MARGIN - r.pixelHeight);
        });
    };

    applyMinimalCorrection();

    // Логирование данных для отладки
    console.log('Room data before SVG generation:');
    pixelRooms.forEach(room => {
        console.log(`Room ${room.key} (${room.name}):`, {
            position: { x: room.pixelX, y: room.pixelY, width: room.pixelWidth, height: room.pixelHeight },
            windows: room.windows?.map(w => ({ side: w.side, pos: w.pos, len: w.len })) || [],
            doors: room.doors?.map(d => ({ side: d.side, pos: d.pos, len: d.len, type: d.type })) || []
        });
    });

    // Infer doors from user connections and geometric adjacency
    const addDoorIfMissing = (room, side, posNorm) => {
        const existing = (room.doors || []).some(d => d.side === side && Math.abs((d.pos ?? 0.5) - posNorm) < 0.08);
        if (!existing) {
            room.doors = [...(room.doors || []), { side, pos: clamp(posNorm, 0.05, 0.95) }];
        }
    };

    const inferDoorsFromConnections = () => {
        const DOOR_EPS = 18; // adjacency tolerance
        pixelRooms.forEach(a => {
            const connections = Array.isArray(a.connections) ? a.connections : [];
            connections.forEach(key => {
                const b = pixelRooms.find(r => r.key === key);
                if (!b) return;
                const aLeft = a.pixelX, aRight = a.pixelX + a.pixelWidth, aTop = a.pixelY, aBottom = a.pixelY + a.pixelHeight;
                const bLeft = b.pixelX, bRight = b.pixelX + b.pixelWidth, bTop = b.pixelY, bBottom = b.pixelY + b.pixelHeight;

                // Vertical adjacency (A right near B left)
                if (Math.abs(aRight - bLeft) <= DOOR_EPS) {
                    const y1 = Math.max(aTop, bTop);
                    const y2 = Math.min(aBottom, bBottom);
                    const overlap = y2 - y1;
                    if (overlap > 60) {
                        const mid = (y1 + y2) / 2;
                        const posA = (mid - aTop) / a.pixelHeight;
                        const posB = (mid - bTop) / b.pixelHeight;
                        addDoorIfMissing(a, 'right', posA);
                        addDoorIfMissing(b, 'left', posB);
                    }
                }
                // Vertical adjacency (B right near A left)
                if (Math.abs(bRight - aLeft) <= DOOR_EPS) {
                    const y1 = Math.max(aTop, bTop);
                    const y2 = Math.min(aBottom, bBottom);
                    const overlap = y2 - y1;
                    if (overlap > 60) {
                        const mid = (y1 + y2) / 2;
                        const posA = (mid - aTop) / a.pixelHeight;
                        const posB = (mid - bTop) / b.pixelHeight;
                        addDoorIfMissing(a, 'left', posA);
                        addDoorIfMissing(b, 'right', posB);
                    }
                }
                // Horizontal adjacency (A bottom near B top)
                if (Math.abs(aBottom - bTop) <= DOOR_EPS) {
                    const x1 = Math.max(aLeft, bLeft);
                    const x2 = Math.min(aRight, bRight);
                    const overlap = x2 - x1;
                    if (overlap > 60) {
                        const mid = (x1 + x2) / 2;
                        const posA = (mid - aLeft) / a.pixelWidth;
                        const posB = (mid - bLeft) / b.pixelWidth;
                        addDoorIfMissing(a, 'bottom', posA);
                        addDoorIfMissing(b, 'top', posB);
                    }
                }
                // Horizontal adjacency (B bottom near A top)
                if (Math.abs(bBottom - aTop) <= DOOR_EPS) {
                    const x1 = Math.max(aLeft, bLeft);
                    const x2 = Math.min(aRight, bRight);
                    const overlap = x2 - x1;
                    if (overlap > 60) {
                        const mid = (x1 + x2) / 2;
                        const posA = (mid - aLeft) / a.pixelWidth;
                        const posB = (mid - bLeft) / b.pixelWidth;
                        addDoorIfMissing(a, 'top', posA);
                        addDoorIfMissing(b, 'bottom', posB);
                    }
                }
            });
        });
    };

    inferDoorsFromConnections();

    // Guarantee exactly one apartment entry via hallway: внешний вход только в прихожей
    const hallway = pixelRooms.find(r => /прихож|коридор|hall|entry|тамбур/i.test(String(r.name)));
    if (hallway) {
        // Функция для проверки прилегания к другому помещению в определенном сегменте стены
        const touchesNeighborInSegment = (x1, y1, x2, y2, excludeKey) => pixelRooms.some(r => r.key !== excludeKey && !(r.pixelX >= x2 || r.pixelX + r.pixelWidth <= x1 || r.pixelY >= y2 || r.pixelY + r.pixelHeight <= y1));
        
        // Функция для поиска свободных сегментов стены (где нет прилеганий)
        const findFreeSegments = (side) => {
            const segments = [];
            const segmentCount = 8; // Разбиваем стену на 8 сегментов для более точного определения
            
            for (let i = 0; i < segmentCount; i++) {
                const start = i / segmentCount;
                const end = (i + 1) / segmentCount;
                
                let isFree = false;
                if (side === 'left') {
                    const x1 = hallway.pixelX - 1;
                    const x2 = hallway.pixelX;
                    const y1 = hallway.pixelY + start * hallway.pixelHeight;
                    const y2 = hallway.pixelY + end * hallway.pixelHeight;
                    isFree = !touchesNeighborInSegment(x1, y1, x2, y2, hallway.key);
                } else if (side === 'right') {
                    const x1 = hallway.pixelX + hallway.pixelWidth;
                    const x2 = hallway.pixelX + hallway.pixelWidth + 1;
                    const y1 = hallway.pixelY + start * hallway.pixelHeight;
                    const y2 = hallway.pixelY + end * hallway.pixelHeight;
                    isFree = !touchesNeighborInSegment(x1, y1, x2, y2, hallway.key);
                } else if (side === 'top') {
                    const x1 = hallway.pixelX + start * hallway.pixelWidth;
                    const x2 = hallway.pixelX + end * hallway.pixelWidth;
                    const y1 = hallway.pixelY - 1;
                    const y2 = hallway.pixelY;
                    isFree = !touchesNeighborInSegment(x1, y1, x2, y2, hallway.key);
                } else if (side === 'bottom') {
                    const x1 = hallway.pixelX + start * hallway.pixelWidth;
                    const x2 = hallway.pixelX + end * hallway.pixelWidth;
                    const y1 = hallway.pixelY + hallway.pixelHeight;
                    const y2 = hallway.pixelY + hallway.pixelHeight + 1;
                    isFree = !touchesNeighborInSegment(x1, y1, x2, y2, hallway.key);
                }
                
                if (isFree) {
                    segments.push({ start, end, center: (start + end) / 2 });
                }
            }
            return segments;
        };

        // Не создаем автоматически входную дверь - только те, что добавлены в конструкторе
    }

    let svgContent = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ECECEC; shape-rendering: crispEdges;">
<defs>
  <pattern id="wallHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="12" height="12" fill="#2F2F2F"/>
    <rect y="6" width="12" height="6" fill="#3C3C3C"/>
  </pattern>
  <pattern id="windowStripe" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="#FFFFFF"/>
    <rect x="0" y="2" width="6" height="2" fill="#CFCFCF"/>
  </pattern>
  <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#D7CCC8;stop-opacity:1" />
    <stop offset="50%" style="stop-color:#BCAAA4;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#A1887F;stop-opacity:1" />
  </linearGradient>
</defs>
<rect width="100%" height="100%" fill="#ECECEC"/>`;

    // Функция для определения пересечения двух помещений
    // Комнаты считаются пересекающимися только если они действительно накладываются друг на друга
    const checkRoomOverlap = (room1, room2) => {
        // Используем строгую проверку без допусков - комнаты пересекаются только если действительно накладываются
        const hasHorizontalOverlap = room1.pixelX < room2.pixelX + room2.pixelWidth && 
                                    room1.pixelX + room1.pixelWidth > room2.pixelX;
        const hasVerticalOverlap = room1.pixelY < room2.pixelY + room2.pixelHeight && 
                                  room1.pixelY + room1.pixelHeight > room2.pixelY;
        
        // Комнаты пересекаются только если есть пересечение и по горизонтали, и по вертикали
        return hasHorizontalOverlap && hasVerticalOverlap;
    };

    // Функция для определения всех пересечений с конкретным помещением
    const getRoomOverlaps = (targetRoom) => {
        return pixelRooms.filter(room => 
            room !== targetRoom && checkRoomOverlap(targetRoom, room)
        );
    };

    // Рисуем полы комнат (без стен) с учетом наложений и окон
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, name, sqm, windows = [] } = room;
        const overlappingRooms = getRoomOverlaps(room);
        const hasOverlaps = overlappingRooms.length > 0;
        
        // Основной прямоугольник помещения
        const fillColor = hasOverlaps ? 'rgba(232, 244, 253, 0.6)' : '#FFFFFF';
        const strokeColor = hasOverlaps ? '#1976d2' : 'none';
        const strokeWidth = hasOverlaps ? '3' : '0';
        
        svgContent += `\n<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
        
        // Дополнительные прямоугольники для окон - расширяем фон помещения
        windows.forEach(window => {
            const pos = typeof window.pos === 'number' ? window.pos : 0.5;
            const len = typeof window.len === 'number' ? window.len : 0.2;
            const WINDOW_WIDTH = 40; // Используем максимальную ширину для фона
            
            if (window.side === 'top') {
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                const y = pixelY - WINDOW_WIDTH / 2;
                svgContent += `\n<rect x="${startX}" y="${y}" width="${winLength}" height="${WINDOW_WIDTH}" fill="${fillColor}" stroke="none"/>`;
            } else if (window.side === 'bottom') {
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                const y = pixelY + pixelHeight + WINDOW_WIDTH / 2;
                svgContent += `\n<rect x="${startX}" y="${y - WINDOW_WIDTH}" width="${winLength}" height="${WINDOW_WIDTH}" fill="${fillColor}" stroke="none"/>`;
            } else if (window.side === 'left') {
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                const x = pixelX - WINDOW_WIDTH / 2;
                svgContent += `\n<rect x="${x}" y="${startY}" width="${WINDOW_WIDTH}" height="${winLength}" fill="${fillColor}" stroke="none"/>`;
            } else if (window.side === 'right') {
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                const x = pixelX + pixelWidth + WINDOW_WIDTH / 2;
                svgContent += `\n<rect x="${x - WINDOW_WIDTH}" y="${startY}" width="${WINDOW_WIDTH}" height="${winLength}" fill="${fillColor}" stroke="none"/>`;
            }
        });
        
        // Дополнительная обводка для наложенных помещений
        if (hasOverlaps) {
            svgContent += `\n<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" fill="none" stroke="#1976d2" stroke-width="2" stroke-dasharray="5,5" opacity="0.8"/>`;
        }
        
        // Индикатор наложения
        if (hasOverlaps) {
            const iconX = pixelX + pixelWidth - 20;
            const iconY = pixelY + 20;
            svgContent += `\n<text x="${iconX}" y="${iconY}" font-family="Arial, sans-serif" font-size="16" fill="#1976d2">🔗</text>`;
        }
    });

    // Рисуем двери (если есть данные о дверях)
    console.log('SVG Generation - Checking for doors in rooms:', rooms.map(r => ({ 
        key: r.key, 
        name: r.name, 
        doors: r.doors?.length || 0,
        doorsData: r.doors 
    })));
    



    // Построим единый слой стен по уникальным рёбрам
    const edges = [];
    const addEdge = (orientation, fixCoord, start, end) => {
        if (end - start <= 0) return;
        // Попробуем слить с существующим ребром (совпадают ориентация и фиксированная координата)
        for (const e of edges) {
            if (e.o === orientation && Math.abs(e.c - fixCoord) <= EPS) {
                // Перекрытие диапазонов
                if (!(end <= e.s || start >= e.e)) {
                    e.s = Math.min(e.s, start);
                    e.e = Math.max(e.e, end);
                    return;
                }
            }
        }
        edges.push({ o: orientation, c: fixCoord, s: start, e: end });
    };
    pixelRooms.forEach(r => {
        const x1 = r.pixelX, x2 = r.pixelX + r.pixelWidth;
        const y1 = r.pixelY, y2 = r.pixelY + r.pixelHeight;
        addEdge('v', x1, y1, y2); // left
        addEdge('v', x2, y1, y2); // right
        addEdge('h', y1, x1, x2); // top
        addEdge('h', y2, x1, x2); // bottom
    });
    
    // Функция для определения толщины стены в зависимости от позиции
    const getWallThickness = (edge, segmentStart, segmentEnd) => {
        const segmentMid = (segmentStart + segmentEnd) / 2;
        
        // Находим комнаты, которые касаются этой части стены
        const roomsAtSegment = pixelRooms.filter(r => {
            if (edge.o === 'v') { // вертикальная стена
                const touchesWall = Math.abs(edge.c - r.pixelX) < EPS || Math.abs(edge.c - (r.pixelX + r.pixelWidth)) < EPS;
                const overlapsVertically = segmentMid >= r.pixelY && segmentMid <= r.pixelY + r.pixelHeight;
                return touchesWall && overlapsVertically;
            } else { // горизонтальная стена
                const touchesWall = Math.abs(edge.c - r.pixelY) < EPS || Math.abs(edge.c - (r.pixelY + r.pixelHeight)) < EPS;
                const overlapsHorizontally = segmentMid >= r.pixelX && segmentMid <= r.pixelX + r.pixelWidth;
                return touchesWall && overlapsHorizontally;
            }
        });
        
        // Проверяем, есть ли среди комнат балкон/лоджия
        const hasBalconyRoom = roomsAtSegment.some(r => 
            r.key === 'balcony' || r.name.toLowerCase().includes('балкон') || r.name.toLowerCase().includes('лоджия')
        );
        
        // Определяем, является ли эта часть стены внешней
        let isExternalPart = false;
        
        // Проверяем, является ли стена внешней по границам плана
        if (edge.o === 'v') { // вертикальная стена
            isExternalPart = Math.abs(edge.c - planBounds.left) < EPS || Math.abs(edge.c - planBounds.right) < EPS;
        } else { // горизонтальная стена
            isExternalPart = Math.abs(edge.c - planBounds.top) < EPS || Math.abs(edge.c - planBounds.bottom) < EPS;
        }
        
        // Дополнительная проверка: если стена не внешняя по границам, но касается только одной комнаты,
        // то это тоже может быть внешняя стена (комната выходит за пределы других комнат)
        if (!isExternalPart && roomsAtSegment.length === 1) {
            // Проверяем, есть ли комната с другой стороны стены
            const room = roomsAtSegment[0];
            let hasRoomOnOtherSide = false;
            
            if (edge.o === 'v') { // вертикальная стена
                const wallX = edge.c;
                const otherSideX = wallX > room.pixelX + room.pixelWidth / 2 ? wallX + EPS : wallX - EPS;
                hasRoomOnOtherSide = pixelRooms.some(r => 
                    r !== room && 
                    otherSideX >= r.pixelX && otherSideX <= r.pixelX + r.pixelWidth &&
                    segmentMid >= r.pixelY && segmentMid <= r.pixelY + r.pixelHeight
                );
            } else { // горизонтальная стена
                const wallY = edge.c;
                const otherSideY = wallY > room.pixelY + room.pixelHeight / 2 ? wallY + EPS : wallY - EPS;
                hasRoomOnOtherSide = pixelRooms.some(r => 
                    r !== room && 
                    otherSideY >= r.pixelY && otherSideY <= r.pixelY + r.pixelHeight &&
                    segmentMid >= r.pixelX && segmentMid <= r.pixelX + r.pixelWidth
                );
            }
            
            // Если нет комнаты с другой стороны, это внешняя стена
            if (!hasRoomOnOtherSide) {
                isExternalPart = true;
            }
        }
        
        // Фиксированные толщины стен - синхронизированы с окнами
        if (isExternalPart && !hasBalconyRoom) {
            return 40; // Внешние стены - 40px (как окна)
        } else {
            return 20; // Межкомнатные стены - 20px (как окна)
        }
    };

    // Собираем информацию об окнах и дверях для исключения их из рисования стен
    const windowSegments = [];
    const doorSegments = [];
    
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, windows = [], doors = [] } = room;
        
        // Обрабатываем окна
        windows.forEach(window => {
            const pos = typeof window.pos === 'number' ? window.pos : 0.5;
            const len = typeof window.len === 'number' ? window.len : 0.2;
            
            if (window.side === 'top') {
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                windowSegments.push({ orientation: 'h', coord: pixelY, start: startX, end: startX + winLength });
            } else if (window.side === 'bottom') {
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                windowSegments.push({ orientation: 'h', coord: pixelY + pixelHeight, start: startX, end: startX + winLength });
            } else if (window.side === 'left') {
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                windowSegments.push({ orientation: 'v', coord: pixelX, start: startY, end: startY + winLength });
            } else if (window.side === 'right') {
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                windowSegments.push({ orientation: 'v', coord: pixelX + pixelWidth, start: startY, end: startY + winLength });
            }
        });
        
        // Обрабатываем двери
        doors.forEach(door => {
            const pos = typeof door.pos === 'number' ? door.pos : 0.5;
            const len = typeof door.len === 'number' ? door.len : 0.2;
            
            if (door.side === 'top') {
                const startX = pixelX + pos * pixelWidth;
                const doorLength = len * pixelWidth;
                doorSegments.push({ orientation: 'h', coord: pixelY, start: startX, end: startX + doorLength });
            } else if (door.side === 'bottom') {
                const startX = pixelX + pos * pixelWidth;
                const doorLength = len * pixelWidth;
                doorSegments.push({ orientation: 'h', coord: pixelY + pixelHeight, start: startX, end: startX + doorLength });
            } else if (door.side === 'left') {
                const startY = pixelY + pos * pixelHeight;
                const doorLength = len * pixelHeight;
                doorSegments.push({ orientation: 'v', coord: pixelX, start: startY, end: startY + doorLength });
            } else if (door.side === 'right') {
                const startY = pixelY + pos * pixelHeight;
                const doorLength = len * pixelHeight;
                doorSegments.push({ orientation: 'v', coord: pixelX + pixelWidth, start: startY, end: startY + doorLength });
            }
        });
    });

    // Временно убираем дорисовывание стен до окон



    // Draw windows: объемные многослойные окна с подоконниками и перегородками
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, windows = [] } = room;

        if (windows.length > 0) {
            console.log(`Drawing layered windows for room ${room.key} (${room.name}):`, {
                position: { x: pixelX, y: pixelY, width: pixelWidth, height: pixelHeight },
                windows: windows.map(w => ({ side: w.side, pos: w.pos, len: w.len }))
            });
        }

        windows.forEach(window => {
            // Правильное позиционирование окон на стенах
            const pos = typeof window.pos === 'number' ? window.pos : 0.5;
            const len = typeof window.len === 'number' ? window.len : 0.2;
            
            // Определяем тип стены для выбора ширины окна
            const windowStartX = pixelX + pos * pixelWidth;
            const windowEndX = windowStartX + len * pixelWidth;
            const windowStartY = pixelY + pos * pixelHeight;
            const windowEndY = windowStartY + len * pixelHeight;
            
            // Создаем фиктивный edge для определения типа стены
            let mockEdge;
            if (window.side === 'left' || window.side === 'right') {
                mockEdge = { o: 'v', c: window.side === 'left' ? pixelX : pixelX + pixelWidth };
            } else {
                mockEdge = { o: 'h', c: window.side === 'top' ? pixelY : pixelY + pixelHeight };
            }
            
            const wallThickness = getWallThickness(mockEdge, 
                window.side === 'left' || window.side === 'right' ? windowStartY : windowStartX,
                window.side === 'left' || window.side === 'right' ? windowEndY : windowEndX
            );
            
            // Параметры окна - используем ту же ширину, что и стена
            const WINDOW_WIDTH = wallThickness; // ширина окна = ширина стены
            const windowDepth = WINDOW_WIDTH; // глубина окна = ширина окна

            if (window.side === 'top') {
                // Окно на верхней стене - центрировано на стене
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                const y = pixelY - WINDOW_WIDTH / 2; // Окно центрировано на стене
                
                // Создаем проход в стене (белая линия)
                svgContent += `\n<line x1="${startX}" y1="${pixelY}" x2="${startX + winLength}" y2="${pixelY}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем окно - начинается на стене и идет внутрь комнаты
                const windowGroup = createLayeredWindow(
                    startX, y, winLength, windowDepth, 'horizontal'
                );
                svgContent += windowGroup;
                
            } else if (window.side === 'bottom') {
                // Окно на нижней стене - центрировано на стене
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                const y = pixelY + pixelHeight - WINDOW_WIDTH / 2; // Окно центрировано на стене
                
                // Создаем проход в стене (белая линия)
                svgContent += `\n<line x1="${startX}" y1="${pixelY + pixelHeight}" x2="${startX + winLength}" y2="${pixelY + pixelHeight}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем окно - начинается на стене и идет внутрь комнаты
                const windowGroup = createLayeredWindow(
                    startX, y, winLength, windowDepth, 'horizontal'
                );
                svgContent += windowGroup;
                
            } else if (window.side === 'left') {
                // Окно на левой стене - начинается на стене
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                const x = pixelX - WINDOW_WIDTH; // Окно начинается на стене и идет наружу
                
                // Создаем проход в стене (белая линия)
                svgContent += `\n<line x1="${pixelX}" y1="${startY}" x2="${pixelX}" y2="${startY + winLength}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем окно - начинается на стене и идет наружу
                // Для вертикальных окон: x, y, length (по Y), depth (по X), orientation
                const windowGroup = createLayeredWindow(
                    x, startY, winLength, windowDepth, 'vertical'
                );
                svgContent += windowGroup;
                
            } else if (window.side === 'right') {
                // Окно на правой стене - начинается на стене
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                const x = pixelX + pixelWidth; // Окно начинается на стене и идет наружу
                
                // Создаем проход в стене (белая линия)
                svgContent += `\n<line x1="${pixelX + pixelWidth}" y1="${startY}" x2="${pixelX + pixelWidth}" y2="${startY + winLength}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем окно - начинается на стене и идет наружу
                // Для вертикальных окон: x, y, length (по Y), depth (по X), orientation
                const windowGroup = createLayeredWindow(
                    x, startY, winLength, windowDepth, 'vertical'
                );
                svgContent += windowGroup;
            }
        });
    });

    // Функция для создания схематичной двери с красивыми петлями
    function createLayeredDoor(x, y, length, depth, orientation, doorType) {
        const isHorizontal = orientation === 'horizontal';
        
        // Используем переданную глубину как ширину двери
        const DOOR_WIDTH = depth; // ширина двери = переданная глубина
        const lineColor = '#2F2F2F';
        
        // Адаптивная толщина линий в зависимости от ширины двери
        const lineThickness = Math.max(2, Math.min(4, DOOR_WIDTH / 10));
        
        let doorGroup = `<g>`;
        
        if (isHorizontal) {
            // Горизонтальная дверь (top/bottom стены)
            
            // 1. Внешние границы двери
            doorGroup += `
                <line x1="${x}" y1="${y + 1}" x2="${x + length}" y2="${y + 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x}" y1="${y + DOOR_WIDTH - 1}" x2="${x + length}" y2="${y + DOOR_WIDTH - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 2. Внутренние линии
            const middleY1 = y + (DOOR_WIDTH * 0.25);
            const middleY2 = y + (DOOR_WIDTH * 0.75);
            
            doorGroup += `
                <line x1="${x}" y1="${middleY1}" x2="${x + length}" y2="${middleY1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x}" y1="${middleY2}" x2="${x + length}" y2="${middleY2}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 3. Красивые петли (схематичные)
            const hingeSize = Math.max(4, Math.min(8, DOOR_WIDTH / 6));
            const hinge1X = x + hingeSize;
            const hinge2X = x + length - hingeSize;
            const hingeY = y + DOOR_WIDTH / 2;
            
            doorGroup += `
                <!-- Петля 1 -->
                <circle cx="${hinge1X}" cy="${hingeY}" r="${hingeSize}" fill="#34495e" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="${hinge1X}" cy="${hingeY}" r="${hingeSize * 0.6}" fill="none" stroke="#2c3e50" stroke-width="1"/>
                
                <!-- Петля 2 -->
                <circle cx="${hinge2X}" cy="${hingeY}" r="${hingeSize}" fill="#34495e" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="${hinge2X}" cy="${hingeY}" r="${hingeSize * 0.6}" fill="none" stroke="#2c3e50" stroke-width="1"/>
            `;
            
            // 4. Дуга открытия двери
            const arcDirection = 1; // Всегда внутрь
            const arcRadius = length * 0.7;
            const arcEndX = x + length * 0.7;
            const arcEndY = y + DOOR_WIDTH * 0.7;
            
            doorGroup += `
                <path d="M ${x} ${y + DOOR_WIDTH/2} A ${arcRadius} ${arcRadius} 0 0 ${arcDirection} ${arcEndX} ${arcEndY}" 
                      stroke="${lineColor}" stroke-width="${lineThickness + 1}" fill="none"/>
                
                <!-- Соединительная линия от конца дуги -->
                <line x1="${arcEndX}" y1="${arcEndY}" 
                      x2="${x + length}" y2="${y + DOOR_WIDTH/2}" 
                      stroke="${lineColor}" stroke-width="${lineThickness + 1}"/>
            `;
            
            // 5. Ручка двери
            const handleX = x + length - hingeSize * 2;
            const handleY = y + DOOR_WIDTH / 2;
            doorGroup += `
                <circle cx="${handleX}" cy="${handleY}" r="${hingeSize * 0.4}" 
                        fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
            `;
            
        } else {
            // Вертикальная дверь (left/right стены)
            
            // 1. Внешние границы двери
            doorGroup += `
                <line x1="${x}" y1="${y + 1}" x2="${x}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x + DOOR_WIDTH}" y1="${y + 1}" x2="${x + DOOR_WIDTH}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 2. Внутренние линии
            const middleX1 = x + (DOOR_WIDTH * 0.25);
            const middleX2 = x + (DOOR_WIDTH * 0.75);
            
            doorGroup += `
                <line x1="${middleX1}" y1="${y + 1}" x2="${middleX1}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${middleX2}" y1="${y + 1}" x2="${middleX2}" y2="${y + length - 1}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 3. Красивые петли (схематичные)
            const hingeSize = Math.max(4, Math.min(8, DOOR_WIDTH / 6));
            const hingeX = x + DOOR_WIDTH / 2;
            const hinge1Y = y + hingeSize;
            const hinge2Y = y + length - hingeSize;
            
            doorGroup += `
                <!-- Петля 1 -->
                <circle cx="${hingeX}" cy="${hinge1Y}" r="${hingeSize}" fill="#34495e" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="${hingeX}" cy="${hinge1Y}" r="${hingeSize * 0.6}" fill="none" stroke="#2c3e50" stroke-width="1"/>
                
                <!-- Петля 2 -->
                <circle cx="${hingeX}" cy="${hinge2Y}" r="${hingeSize}" fill="#34495e" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="${hingeX}" cy="${hinge2Y}" r="${hingeSize * 0.6}" fill="none" stroke="#2c3e50" stroke-width="1"/>
            `;
            
            // 4. Дуга открытия двери
            const arcDirection = 1; // Всегда внутрь
            const arcRadius = length * 0.7;
            const arcEndX = x + DOOR_WIDTH * 0.7;
            const arcEndY = y + length * 0.7;
            
            doorGroup += `
                <path d="M ${x + DOOR_WIDTH/2} ${y} A ${arcRadius} ${arcRadius} 0 0 ${arcDirection} ${arcEndX} ${arcEndY}" 
                      stroke="${lineColor}" stroke-width="${lineThickness + 1}" fill="none"/>
                
                <!-- Соединительная линия от конца дуги -->
                <line x1="${arcEndX}" y1="${arcEndY}" 
                      x2="${x + DOOR_WIDTH/2}" y2="${y + length}" 
                      stroke="${lineColor}" stroke-width="${lineThickness + 1}"/>
            `;
            
            // 5. Ручка двери
            const handleX = x + DOOR_WIDTH / 2;
            const handleY = y + length - hingeSize * 2;
            doorGroup += `
                <circle cx="${handleX}" cy="${handleY}" r="${hingeSize * 0.4}" 
                        fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
            `;
        }
        
        doorGroup += `</g>`;
        return doorGroup;
    }

    // Генерация дверей - используем систему как у окон
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, doors = [] } = room;

        doors.forEach(door => {
            const pos = typeof door.pos === 'number' ? door.pos : 0.5;
            const len = typeof door.len === 'number' ? door.len : 0.2;
            
            // Определяем тип стены для выбора ширины двери
            const doorStartX = pixelX + pos * pixelWidth;
            const doorEndX = doorStartX + len * pixelWidth;
            const doorStartY = pixelY + pos * pixelHeight;
            const doorEndY = doorStartY + len * pixelHeight;
            
            // Создаем фиктивный edge для определения типа стены
            let mockEdge;
            if (door.side === 'left' || door.side === 'right') {
                mockEdge = { o: 'v', c: door.side === 'left' ? pixelX : pixelX + pixelWidth };
            } else {
                mockEdge = { o: 'h', c: door.side === 'top' ? pixelY : pixelY + pixelHeight };
            }
            
            const wallThickness = getWallThickness(mockEdge, 
                door.side === 'left' || door.side === 'right' ? doorStartY : doorStartX,
                door.side === 'left' || door.side === 'right' ? doorEndY : doorEndX
            );
            
            // Параметры двери - используем ту же ширину, что и стена
            const DOOR_WIDTH = wallThickness; // ширина двери = ширина стены
            const doorDepth = DOOR_WIDTH; // глубина двери = ширина двери

            if (door.side === 'top') {
                // Дверь на верхней стене - центрировано на стене
                const startX = pixelX + pos * pixelWidth;
                const doorLength = len * pixelWidth;
                const y = pixelY - DOOR_WIDTH / 2; // Дверь центрировано на стене
                
                // Создаем проход в стене (белая линия) - как у окон
                svgContent += `\n<line x1="${startX}" y1="${pixelY}" x2="${startX + doorLength}" y2="${pixelY}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем дверь - начинается на стене и идет внутрь комнаты
                const doorGroup = createLayeredDoor(
                    startX, y, doorLength, doorDepth, 'horizontal', door.type
                );
                svgContent += doorGroup;
                
            } else if (door.side === 'bottom') {
                // Дверь на нижней стене - центрировано на стене
                const startX = pixelX + pos * pixelWidth;
                const doorLength = len * pixelWidth;
                const y = pixelY + pixelHeight - DOOR_WIDTH / 2; // Дверь центрировано на стене
                
                // Создаем проход в стене (белая линия) - как у окон
                svgContent += `\n<line x1="${startX}" y1="${pixelY + pixelHeight}" x2="${startX + doorLength}" y2="${pixelY + pixelHeight}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем дверь - начинается на стене и идет внутрь комнаты
                const doorGroup = createLayeredDoor(
                    startX, y, doorLength, doorDepth, 'horizontal', door.type
                );
                svgContent += doorGroup;
                
            } else if (door.side === 'left') {
                // Дверь на левой стене - начинается на стене
                const startY = pixelY + pos * pixelHeight;
                const doorLength = len * pixelHeight;
                const x = pixelX - DOOR_WIDTH; // Дверь начинается на стене и идет наружу
                
                // Создаем проход в стене (белая линия) - как у окон
                svgContent += `\n<line x1="${pixelX}" y1="${startY}" x2="${pixelX}" y2="${startY + doorLength}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем дверь - начинается на стене и идет наружу
                const doorGroup = createLayeredDoor(
                    x, startY, doorLength, doorDepth, 'vertical', door.type
                );
                svgContent += doorGroup;
                
            } else if (door.side === 'right') {
                // Дверь на правой стене - начинается на стене
                const startY = pixelY + pos * pixelHeight;
                const doorLength = len * pixelHeight;
                const x = pixelX + pixelWidth; // Дверь начинается на стене и идет наружу
                
                // Создаем проход в стене (белая линия) - как у окон
                svgContent += `\n<line x1="${pixelX + pixelWidth}" y1="${startY}" x2="${pixelX + pixelWidth}" y2="${startY + doorLength}" stroke="#FFFFFF" stroke-width="${wallThickness + 2}" stroke-linecap="butt"/>`;
                
                // Создаем дверь - начинается на стене и идет наружу
                const doorGroup = createLayeredDoor(
                    x, startY, doorLength, doorDepth, 'vertical', door.type
                );
                svgContent += doorGroup;
            }
        });
    });

    // Рисуем стены с разной толщиной для внешних и внутренних частей, исключая окна
    // Стены рисуются поверх окон для правильного наложения
    edges.forEach(e => {
        // Разбиваем стену на сегменты и анализируем каждый сегмент
        const segmentLength = 50; // Длина сегмента для анализа
        const totalLength = e.e - e.s;
        const segments = Math.ceil(totalLength / segmentLength);
        
        for (let i = 0; i < segments; i++) {
            const segmentStart = e.s + (i * totalLength / segments);
            const segmentEnd = e.s + ((i + 1) * totalLength / segments);
            const segmentMid = (segmentStart + segmentEnd) / 2;
            
            // Проверяем, не попадает ли этот сегмент в окно или дверь
            const isInWindow = windowSegments.some(ws => {
                if (ws.orientation === e.o && Math.abs(ws.coord - e.c) < 1) {
                    return segmentMid >= ws.start && segmentMid <= ws.end;
                }
                return false;
            });
            
            const isInDoor = doorSegments.some(ds => {
                if (ds.orientation === e.o && Math.abs(ds.coord - e.c) < 1) {
                    return segmentMid >= ds.start && segmentMid <= ds.end;
                }
                return false;
            });
            
            if (isInWindow || isInDoor) continue; // Пропускаем сегмент, если он в окне или двери
            
            const wallThickness = getWallThickness(e, segmentStart, segmentEnd);
            
                        if (e.o === 'v') {
                svgContent += `\n<line x1="${e.c}" y1="${segmentStart}" x2="${e.c}" y2="${segmentEnd}" stroke="url(#wallHatch)" stroke-width="${wallThickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
                        } else {
                svgContent += `\n<line x1="${segmentStart}" y1="${e.c}" x2="${segmentEnd}" y2="${e.c}" stroke="url(#wallHatch)" stroke-width="${wallThickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
            }
        }
    });

    // Draw furniture (improved 2D icons with softer strokes and light fill)
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, objects = [] } = room;
        
        console.log(`Drawing objects for room ${room.key} (${room.name}):`, objects.length, 'objects total');
        if (objects.length > 0) {
            console.log('Object details:', objects.map(o => ({ type: o.type, x: o.x, y: o.y, w: o.w, h: o.h, area: o.w * o.h })));
        }
        
        const filteredObjects = objects.filter(obj => (obj.w * obj.h) > 0.005).slice(0, 6);
        console.log(`After filtering (area > 0.005): ${filteredObjects.length} objects`);
        
        filteredObjects.forEach(obj => {
            // Ограничиваем размеры объектов и добавляем отступы от стен
            const MARGIN_FROM_WALL = 20; // увеличиваем отступ от стен
            const MARGIN_FROM_DOORS_WINDOWS = 30; // отступ от дверей и окон
            const MAX_OBJECT_SIZE = 0.35; // максимум 35% от размера комнаты
            const MIN_OBJECT_SIZE = 24; // минимум 24px
            
            // Нормализуем размеры объектов
            const normalizedW = Math.min(MAX_OBJECT_SIZE, Math.max(0.08, obj.w * 0.6)); // уменьшаем в 1.5 раза
            const normalizedH = Math.min(MAX_OBJECT_SIZE, Math.max(0.08, obj.h * 0.6));
            
            const objWidth = Math.max(MIN_OBJECT_SIZE, normalizedW * pixelWidth);
            const objHeight = Math.max(MIN_OBJECT_SIZE, normalizedH * pixelHeight);
            
            // Проверяем, не пересекается ли объект с дверями и окнами
            const checkObjectCollision = (x, y, w, h) => {
                // Проверяем пересечение с дверями
                if (room.doors && room.doors.length > 0) {
                    for (const door of room.doors) {
                        const doorX = pixelX + door.pos * pixelWidth;
                        const doorY = pixelY + door.pos * pixelHeight;
                        const doorSpan = Math.min(130, Math.max(80, Math.min(pixelWidth, pixelHeight) * 0.28));
                        
                        let doorLeft, doorRight, doorTop, doorBottom;
                        if (door.side === 'top' || door.side === 'bottom') {
                            doorLeft = doorX - doorSpan / 2;
                            doorRight = doorX + doorSpan / 2;
                            doorTop = door.side === 'top' ? pixelY : pixelY + pixelHeight;
                            doorBottom = doorTop;
                        } else {
                            doorLeft = door.side === 'left' ? pixelX : pixelX + pixelWidth;
                            doorRight = doorLeft;
                            doorTop = doorY - doorSpan / 2;
                            doorBottom = doorY + doorSpan / 2;
                        }
                        
                        // Проверяем пересечение с зоной двери + отступ
                        if (!(x + w + MARGIN_FROM_DOORS_WINDOWS < doorLeft || 
                              x - MARGIN_FROM_DOORS_WINDOWS > doorRight || 
                              y + h + MARGIN_FROM_DOORS_WINDOWS < doorTop || 
                              y - MARGIN_FROM_DOORS_WINDOWS > doorBottom)) {
                            return true; // есть пересечение
                        }
                    }
                }
                
                // Проверяем пересечение с окнами
                if (room.windows && room.windows.length > 0) {
                    for (const window of room.windows) {
                        const windowX = pixelX + window.pos * pixelWidth;
                        const windowY = pixelY + window.pos * pixelHeight;
                        const windowLength = window.len * (window.side === 'left' || window.side === 'right' ? pixelHeight : pixelWidth);
                        const windowDepth = WALL_THICKNESS * 0.8;
                        
                        let windowLeft, windowRight, windowTop, windowBottom;
                        if (window.side === 'top' || window.side === 'bottom') {
                            windowLeft = windowX;
                            windowRight = windowX + windowLength;
                            windowTop = window.side === 'top' ? pixelY : pixelY + pixelHeight - windowDepth;
                            windowBottom = window.side === 'top' ? pixelY + windowDepth : pixelY + pixelHeight;
                        } else {
                            windowLeft = window.side === 'left' ? pixelX - windowDepth : pixelX + pixelWidth;
                            windowRight = window.side === 'left' ? pixelX : pixelX + pixelWidth + windowDepth;
                            windowTop = windowY;
                            windowBottom = windowY + windowLength;
                        }
                        
                        // Проверяем пересечение с зоной окна + отступ
                        if (!(x + w + MARGIN_FROM_DOORS_WINDOWS < windowLeft || 
                              x - MARGIN_FROM_DOORS_WINDOWS > windowRight || 
                              y + h + MARGIN_FROM_DOORS_WINDOWS < windowTop || 
                              y - MARGIN_FROM_DOORS_WINDOWS > windowBottom)) {
                            return true; // есть пересечение
                        }
                    }
                }
                
                return false; // пересечений нет
            };
            
            // Пытаемся найти подходящую позицию для объекта
            let objX = pixelX + obj.x * pixelWidth;
            let objY = pixelY + obj.y * pixelHeight;
            
            // Если объект пересекается с дверями/окнами, сдвигаем его
            if (checkObjectCollision(objX - objWidth/2, objY - objHeight/2, objWidth, objHeight)) {
                // Пробуем сдвинуть объект в центр комнаты
                objX = pixelX + pixelWidth / 2;
                objY = pixelY + pixelHeight / 2;
                
                // Если и в центре пересекается, сдвигаем дальше
                if (checkObjectCollision(objX - objWidth/2, objY - objHeight/2, objWidth, objHeight)) {
                    // Сдвигаем к углу комнаты
                    objX = pixelX + MARGIN_FROM_WALL + objWidth/2;
                    objY = pixelY + MARGIN_FROM_WALL + objHeight/2;
                }
            }
            
            // Ограничиваем позицию объекта, чтобы он не выходил за рамки комнаты
            const minX = pixelX + MARGIN_FROM_WALL + objWidth/2;
            const maxX = pixelX + pixelWidth - MARGIN_FROM_WALL - objWidth/2;
            const minY = pixelY + MARGIN_FROM_WALL + objHeight/2;
            const maxY = pixelY + pixelHeight - MARGIN_FROM_WALL - objHeight/2;
            
            objX = Math.max(minX, Math.min(maxX, objX));
            objY = Math.max(minY, Math.min(maxY, objY));
            
            const drawRect = () => {
                svgContent += `\n<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" width="${objWidth}" height="${objHeight}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`;
            };

            const drawRoundedRect = (x, y, w, h, r) => {
                svgContent += `\n<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`;
            };

            if (obj.type === 'sofa') {
                const pad = Math.min(objWidth, objHeight) * 0.08;
                const innerX = objX - objWidth/2 + pad;
                const innerY = objY - objHeight/2 + pad;
                const innerW = objWidth - pad * 2;
                const innerH = objHeight - pad * 2;
                const backThickness = Math.max(8, innerH * 0.18);
                const cushionGap = Math.max(6, innerW * 0.04);
                const cushionW = (innerW - cushionGap) / 2;
                const cushionH = innerH - backThickness - pad * 0.5;
                svgContent += `\n<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" width="${objWidth}" height="${objHeight}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`;
                svgContent += `\n<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${backThickness}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
                svgContent += `\n<rect x="${innerX}" y="${innerY + backThickness + cushionGap * 0.25}" width="${cushionW}" height="${cushionH}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
                svgContent += `\n<rect x="${innerX + cushionW + cushionGap}" y="${innerY + backThickness + cushionGap * 0.25}" width="${cushionW}" height="${cushionH}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
            } else if (obj.type === 'bed') {
                const pad = Math.min(objWidth, objHeight) * 0.08;
                const headThickness = Math.max(8, objHeight * 0.18);
                const pillowGap = Math.max(6, objWidth * 0.04);
                const pillowW = (objWidth - pillowGap - pad * 2) / 2;
                const pillowH = Math.max(18, headThickness - pad);
                svgContent += `\n<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" width="${objWidth}" height="${objHeight}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
                svgContent += `\n<rect x="${objX - objWidth/2 + pad}" y="${objY - objHeight/2 + pad}" width="${pillowW}" height="${pillowH}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
                svgContent += `\n<rect x="${objX - objWidth/2 + pad + pillowW + pillowGap}" y="${objY - objHeight/2 + pad}" width="${pillowW}" height="${pillowH}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
            } else if (obj.type === 'chair') {
                // Chair: seat + backrest
                const seatW = objWidth * 0.6;
                const seatH = objHeight * 0.6;
                drawRoundedRect(objX - seatW/2, objY - seatH/2, seatW, seatH, Math.min(seatW, seatH)*0.2);
                const backH = Math.max(10, objHeight * 0.25);
                svgContent += `\n<rect x="${objX - seatW/2}" y="${objY - seatH/2 - backH}" width="${seatW}" height="${backH}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
            } else if (obj.type === 'table') {
                // Table: rounded rectangle
                drawRoundedRect(objX - objWidth/2, objY - objHeight/2, objWidth, objHeight, Math.min(objWidth, objHeight)*0.15);
            } else if (obj.type === 'wardrobe') {
                // Wardrobe: two-door cabinet
                drawRect();
                const midX = objX;
                svgContent += `\n<line x1="${midX}" y1="${objY - objHeight/2}" x2="${midX}" y2="${objY + objHeight/2}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}" stroke-linecap="round"/>`;
                svgContent += `\n<circle cx="${midX - objWidth*0.2}" cy="${objY}" r="${ICON_STROKE}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${midX + objWidth*0.2}" cy="${objY}" r="${ICON_STROKE}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
            } else if (obj.type === 'kitchen_block') {
                // Kitchen block: long rectangle with sink + stove marks
                drawRect();
                // Sink: small rounded rect on left
                const sinkW = objWidth * 0.22; const sinkH = objHeight * 0.45;
                drawRoundedRect(objX - objWidth/2 + objWidth*0.08, objY - sinkH/2, sinkW, sinkH, Math.min(sinkW, sinkH)*0.2);
                // Stove: four burners on right
                const baseX = objX + objWidth*0.15; const baseY = objY; const r = Math.min(objWidth, objHeight) * 0.08;
                const dx = objWidth*0.18; const dy = objHeight*0.18;
                svgContent += `\n<circle cx="${baseX}" cy="${baseY}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${baseX + dx}" cy="${baseY}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${baseX}" cy="${baseY + dy}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${baseX + dx}" cy="${baseY + dy}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
            } else if (obj.type === 'toilet') {
                // Toilet: bowl + tank
                drawRoundedRect(objX - objWidth*0.25, objY - objHeight*0.15, objWidth*0.5, objHeight*0.3, Math.min(objWidth, objHeight)*0.15);
                svgContent += `\n<rect x="${objX - objWidth*0.2}" y="${objY - objHeight*0.45}" width="${objWidth*0.4}" height="${objHeight*0.2}" fill="${ICON_FILL_LIGHT}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE}"/>`;
            } else if (obj.type === 'bathtub') {
                // Bathtub: rounded outer + inner
                drawRoundedRect(objX - objWidth/2, objY - objHeight/2, objWidth, objHeight, Math.min(objWidth, objHeight)*0.35);
                drawRoundedRect(objX - objWidth*0.45, objY - objHeight*0.35, objWidth*0.9, objHeight*0.7, Math.min(objWidth, objHeight)*0.3);
            } else if (obj.type === 'shower') {
                // Shower: square with drain
                drawRect();
                svgContent += `\n<circle cx="${objX}" cy="${objY}" r="${Math.min(objWidth, objHeight)*0.08}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
            } else if (obj.type === 'sink') {
                // Sink standalone: small rounded rect
                drawRoundedRect(objX - objWidth/2, objY - objHeight/2, objWidth, objHeight, Math.min(objWidth, objHeight)*0.25);
            } else if (obj.type === 'stove') {
                // Stove standalone: four burners
                drawRect();
                const r = Math.min(objWidth, objHeight) * 0.18;
                const ox = objX - objWidth*0.25; const oy = objY - objHeight*0.2; const dx = objWidth*0.33; const dy = objHeight*0.33;
                svgContent += `\n<circle cx="${ox}" cy="${oy}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${ox + dx}" cy="${oy}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${ox}" cy="${oy + dy}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
                svgContent += `\n<circle cx="${ox + dx}" cy="${oy + dy}" r="${r}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
            } else if (obj.type === 'fridge') {
                // Fridge: rounded rect with divider
                drawRoundedRect(objX - objWidth/2, objY - objHeight/2, objWidth, objHeight, Math.min(objWidth, objHeight)*0.18);
                svgContent += `\n<line x1="${objX}" y1="${objY - objHeight/2}" x2="${objX}" y2="${objY + objHeight/2}" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}" stroke-linecap="round"/>`;
            } else if (obj.type === 'washing_machine') {
                // Washer: square with drum circle
                drawRect();
                svgContent += `\n<circle cx="${objX}" cy="${objY}" r="${Math.min(objWidth, objHeight)*0.25}" fill="none" stroke="${ICON_STROKE_COLOR}" stroke-width="${ICON_STROKE/2}"/>`;
            } else {
                drawRect();
            }
        });
    });

    // Рисуем названия помещений и квадратуру поверх всех объектов
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, name, sqm } = room;
        const overlappingRooms = getRoomOverlaps(room);
        const hasOverlaps = overlappingRooms.length > 0;
        
        // Подписи
        const labelName = String(name || '').trim();
        const labelSqm = Number.isFinite(Number(sqm)) ? `${Number(sqm).toFixed(1)} м²` : '';
        const fontSize = Math.max(18, Math.min(48, Math.min(pixelWidth, pixelHeight) * 0.14));
        const labelX = pixelX + pixelWidth / 2;
        const labelY = pixelY + pixelHeight / 2 - fontSize * 0.2;
        
        // Стили для текста наложенных помещений
        const textColor = hasOverlaps ? '#0d47a1' : '#1D1D1D';
        const fontWeight = hasOverlaps ? '800' : '700';
        
        // Название помещения с белой обводкой
        svgContent += `\n<text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" stroke="#FFFFFF" stroke-width="3" paint-order="stroke">${escapeXml(labelName)}</text>`;
        
        if (labelSqm) {
            svgContent += `\n<text x="${labelX}" y="${labelY + fontSize * 0.95}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${Math.round(fontSize*0.7)}" fill="${hasOverlaps ? '#1976d2' : '#2F2F2F'}" stroke="#FFFFFF" stroke-width="2" paint-order="stroke">${escapeXml(labelSqm)}</text>`;
        }
    });

    svgContent += `</svg>`;

    // Convert to PNG (render at 2048 for crisper lines, then downscale to 1024)
    const sharp = (await import('sharp')).default;
    const svgBuffer = Buffer.from(svgContent, 'utf8');
    
    try {
        const largePngBuffer = await sharp(svgBuffer)
            .png({ quality: 100 })
            .toBuffer();

        const pngBuffer = await sharp(largePngBuffer).resize({ width: 1024, height: 1024, fit: 'contain', background: '#FFFFFF' }).png({ quality: 100 }).toBuffer();

        const svgBase64 = svgBuffer.toString('base64');
        const pngBase64 = pngBuffer.toString('base64');

        // Validate base64 strings
        if (!svgBase64 || svgBase64.length === 0) {
            throw new Error('SVG base64 encoding failed');
        }
        if (!pngBase64 || pngBase64.length === 0) {
            throw new Error('PNG base64 encoding failed');
        }

        return {
            svgDataUrl: `data:image/svg+xml;base64,${svgBase64}`,
            pngDataUrl: `data:image/png;base64,${pngBase64}`
        };
    } catch (error) {
        console.error('Error converting SVG to PNG:', error);
        throw new Error(`Failed to convert SVG to PNG: ${error.message}`);
    }
}

function escapeXml(unsafe) {
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
