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

    // Функция для генерации дизайна окна согласно JSON спецификации
    function generateWindowDesign(windowLength, windowWidth, windowX, windowY, windowRotation, roomKey, windowSide, windowPos, doorsOnSameWall = []) {
        // Параметры дизайна из JSON (адаптированные под SVG)
        const designConfig = {
            // Боковые линии - должны быть на уровне краев стены
            sideLines: [
                {
                    x_frac: 0.08, // 8% от ширины окна
                thickness: 8 * SVG_SCALE,
                color: '#2f2f2f'
            },
                {
                    x_frac: 0.92, // 92% от ширины окна
                    thickness: 8 * SVG_SCALE,
                    color: '#2f2f2f'
                }
            ],
            // Колпачки
            caps: {
                enabled: true,
                height: 40 * SVG_SCALE,
                color: '#111111'
            },
            // Центральный модуль
            centerModule: {
                x_frac: 0.5, // 50% от ширины окна
                outer: {
                    enabled: false,
                    thickness: 0,
                    color: '#ffffff'
                },
                rails: [
                    {
                        offset_px: -10 * SVG_SCALE,
                        thickness: 4 * SVG_SCALE,
                        color: '#222222'
                    },
                    {
                        offset_px: 10 * SVG_SCALE,
                        thickness: 4 * SVG_SCALE,
                        color: '#222222'
                    }
                ],
                rungs_groups: [
                    {
                        y_frac: 0.28,
                        sep_px: 24 * SVG_SCALE,
                        thickness: 3 * SVG_SCALE,
                        inset_px: 0,
                        overlap_px: 2,
                        color: '#222222'
                    },
                    {
                        y_frac: 0.5,
                        sep_px: 24 * SVG_SCALE,
                        thickness: 3 * SVG_SCALE,
                        inset_px: 0,
                        overlap_px: 2,
                        color: '#222222'
                    },
                    {
                        y_frac: 0.72,
                        sep_px: 24 * SVG_SCALE,
                        thickness: 3 * SVG_SCALE,
                        inset_px: 0,
                        overlap_px: 2,
                        color: '#222222'
                    }
                ]
            }
        };

        // Адаптируем размеры под длину окна
        const adaptedLength = Math.max(windowLength, 200 * SVG_SCALE); // Минимальная длина
        const adaptedWidth = Math.max(windowWidth, 60 * SVG_SCALE); // Минимальная ширина
        
        // Вычисляем позиции элементов
        const leftLineX = adaptedLength * designConfig.sideLines[0].x_frac;
        const rightLineX = adaptedLength * designConfig.sideLines[1].x_frac;
        const centerX = adaptedLength * designConfig.centerModule.x_frac;
        
        // Адаптируем расстояние между перекладинами в зависимости от длины окна
        const baseSep = designConfig.centerModule.rungs_groups[0].sep_px;
        const scaleFactor = Math.max(0.5, Math.min(2.0, adaptedLength / (400 * SVG_SCALE))); // Масштабируем от 0.5 до 2.0
        const adaptedSep = baseSep * scaleFactor;
        
        // Генерируем SVG элементы
        let windowElements = '';
        
        // Проверяем, есть ли пересечения с дверями
        const doorIntersections = doorsOnSameWall.filter(door => {
            // Вычисляем позицию двери относительно окна
            const doorStart = door.pos - door.len / 2;
            const doorEnd = door.pos + door.len / 2;
            const windowStart = windowPos - windowLength / adaptedLength;
            const windowEnd = windowPos + windowLength / adaptedLength;
            
            // Проверяем пересечение диапазонов
            const intersects = !(doorEnd <= windowStart || doorStart >= windowEnd);
            return intersects;
        });
        
        if (doorIntersections.length > 0) {
            // Если есть пересечения с дверями, рисуем только центральные полосы
            const centerX = adaptedLength * 0.5; // Центр окна
            const centerWidth = adaptedLength * 0.1; // 10% от ширины окна для центральной области
            
            // Рисуем центральную область без боковых линий
            windowElements += `<line x1="${centerX - centerWidth/2}" y1="0" x2="${centerX - centerWidth/2}" y2="${adaptedWidth}" 
                stroke="#2f2f2f" stroke-width="8" stroke-linecap="square"/>`;
            windowElements += `<line x1="${centerX + centerWidth/2}" y1="0" x2="${centerX + centerWidth/2}" y2="${adaptedWidth}" 
                stroke="#2f2f2f" stroke-width="8" stroke-linecap="square"/>`;
        } else {
            // Если нет пересечений, рисуем обычные боковые линии
            designConfig.sideLines.forEach(sideLine => {
                const lineX = adaptedLength * sideLine.x_frac;
                windowElements += `<line x1="${lineX}" y1="0" x2="${lineX}" y2="${adaptedWidth}" 
                    stroke="${sideLine.color}" stroke-width="${sideLine.thickness}" stroke-linecap="square"/>`;
            });
        }
        
        // Колпачки (верхний и нижний)
        if (designConfig.caps.enabled) {
            windowElements += `<rect x="0" y="0" width="${adaptedLength}" height="${designConfig.caps.height}" 
                fill="${designConfig.caps.color}"/>`;
            windowElements += `<rect x="0" y="${adaptedWidth - designConfig.caps.height}" width="${adaptedLength}" height="${designConfig.caps.height}" 
                fill="${designConfig.caps.color}"/>`;
        }
        
        // Рейки центрального модуля
        designConfig.centerModule.rails.forEach(rail => {
            const railY = adaptedWidth / 2 + rail.offset_px;
            windowElements += `<line x1="0" y1="${railY}" x2="${adaptedLength}" y2="${railY}" 
                stroke="${rail.color}" stroke-width="${rail.thickness}" stroke-linecap="square"/>`;
        });
        
        // Перекладины для каждой группы
        designConfig.centerModule.rungs_groups.forEach(group => {
            const groupY = adaptedWidth * group.y_frac;
            const rungLength = rightLineX - leftLineX;
            const rungStartX = leftLineX;
            
            // Используем адаптированное расстояние между перекладинами
            const groupRungsCount = Math.max(2, Math.floor(rungLength / adaptedSep));
            const actualSep = rungLength / (groupRungsCount + 1);
            
            for (let i = 1; i <= groupRungsCount; i++) {
                const rungX = rungStartX + i * actualSep;
                windowElements += `<line x1="${rungX}" y1="${groupY - group.thickness/2}" x2="${rungX}" y2="${groupY + group.thickness/2}" 
                    stroke="${group.color}" stroke-width="${group.thickness}" stroke-linecap="square"/>`;
            }
        });
        
        // Создаем группу с клиппингом
        const clipPathId = `windowClip_${roomKey}_${windowSide}_${windowPos}`;
        const windowGroup = `
            <defs>
                <clipPath id="${clipPathId}">
                    <rect x="0" y="0" width="${adaptedLength}" height="${adaptedWidth}" />
                </clipPath>
            </defs>
            <g transform="translate(${windowX}, ${windowY}) rotate(${windowRotation})" clip-path="url(#${clipPathId})">
                ${windowElements}
            </g>
        `;
        
        return windowGroup;
    }

    // Функция для генерации дизайна двери согласно JSON спецификации
    function generateDoorDesign(doorLength, doorWidth, doorX, doorY, doorRotation, doorType, roomKey, doorSide, doorPos) {
        // Параметры дизайна из JSON (адаптированные под SVG)
        const designConfig = {
            // Межкомнатные двери
            interior: {
                topLine: {
                    thickness: 3 * SVG_SCALE,
                    color: '#2f2f2f'
                },
                arc: {
                    thickness: 2 * SVG_SCALE,
                    color: '#2f2f2f'
                },
                hinges: {
                    size: 40 * SVG_SCALE,
                    fill: '#2f2f2f',
                    stroke: '#2f2f2f'
                }
            },
            // Входные двери
            entrance: {
                topLine: {
                    thickness: 6 * SVG_SCALE,
                    color: '#2f2f2f'
                },
                arc: {
                    thickness: 4 * SVG_SCALE,
                    color: '#2f2f2f'
                },
                hinges: {
                    size: 40 * SVG_SCALE,
                    fill: '#2f2f2f',
                    stroke: '#2f2f2f'
                }
            }
        };

        const config = designConfig[doorType] || designConfig.interior;
        
        // Адаптируем размеры под длину двери
        const adaptedLength = Math.max(doorLength, 100 * SVG_SCALE); // Минимальная длина
        const adaptedWidth = Math.max(doorWidth, 20 * SVG_SCALE); // Минимальная ширина
        
        // Вычисляем позиции элементов
        const topLineY = adaptedWidth / 2;
        const arcCenterX = adaptedLength * 0.75; // 75% от длины двери
        const arcCenterY = -adaptedLength * 0.1; // 10% выше двери
        const arcRadius = adaptedLength * 0.9; // 90% от длины двери
        
        // Позиции петель
        const hingeTopX = adaptedLength * 0.83; // 83% от длины двери
        const hingeTopY = adaptedWidth * 0.1; // 10% от высоты двери
        const hingeBottomX = adaptedLength * 0.83;
        const hingeBottomY = adaptedWidth * 0.9; // 90% от высоты двери
        
        // Генерируем SVG элементы
        let doorElements = '';
        
        // Верхняя линия (проем в стене)
        doorElements += `<line x1="0" y1="${topLineY}" x2="${adaptedLength}" y2="${topLineY}" 
            stroke="${config.topLine.color}" stroke-width="${config.topLine.thickness}" stroke-linecap="square"/>`;
        
        // Дуга открывания двери
        const startAngle = 168.6900675259798;
        const endAngle = 78.69006752597979;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const startX = arcCenterX + arcRadius * Math.cos(startRad);
        const startY = arcCenterY + arcRadius * Math.sin(startRad);
        const endX = arcCenterX + arcRadius * Math.cos(endRad);
        const endY = arcCenterY + arcRadius * Math.sin(endRad);
        
        doorElements += `<path d="M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${endY}" 
            stroke="${config.arc.color}" stroke-width="${config.arc.thickness}" fill="none"/>`;
        
        // Верхняя петля
        doorElements += `<rect x="${hingeTopX}" y="${hingeTopY}" width="${config.hinges.size}" height="${config.hinges.size}" 
            fill="${config.hinges.fill}" stroke="${config.hinges.stroke}" stroke-width="1"/>`;
        
        // Нижняя петля
        doorElements += `<rect x="${hingeBottomX}" y="${hingeBottomY}" width="${config.hinges.size}" height="${config.hinges.size}" 
            fill="${config.hinges.fill}" stroke="${config.hinges.stroke}" stroke-width="1"/>`;
        
        // Создаем группу с клиппингом
        const clipPathId = `doorClip_${roomKey}_${doorSide}_${doorPos}`;
        const doorGroup = `
            <defs>
                <clipPath id="${clipPathId}">
                    <rect x="0" y="0" width="${adaptedLength}" height="${adaptedWidth}" />
                </clipPath>
            </defs>
            <g transform="translate(${doorX}, ${doorY}) rotate(${doorRotation})" clip-path="url(#${clipPathId})">
                ${doorElements}
            </g>
        `;
        
        return doorGroup;
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

    // Определяем границы всего плана для выявления внешних стен (перемещаем сразу после pixelRooms)
    const planBounds = {
        left: Math.min(...pixelRooms.map(r => r.pixelX)),
        right: Math.max(...pixelRooms.map(r => r.pixelX + r.pixelWidth)),
        top: Math.min(...pixelRooms.map(r => r.pixelY)),
        bottom: Math.max(...pixelRooms.map(r => r.pixelY + r.pixelHeight))
    };

    // Определяем константу EPS для проверок (перемещаем выше)
    const EPS = 1;

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

    // Рисуем полы комнат (без стен) с учетом наложений
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, name, sqm } = room;
        const overlappingRooms = getRoomOverlaps(room);
        const hasOverlaps = overlappingRooms.length > 0;
        
        
        // Основной прямоугольник помещения
        const fillColor = hasOverlaps ? 'rgba(232, 244, 253, 0.6)' : '#FFFFFF';
        const strokeColor = hasOverlaps ? '#1976d2' : 'none';
        const strokeWidth = hasOverlaps ? '3' : '0';
        
        svgContent += `\n<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
        
        // Дополнительная обводка для наложенных помещений
        if (hasOverlaps) {
            svgContent += `\n<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" fill="none" stroke="#1976d2" stroke-width="2" stroke-dasharray="5,5" opacity="0.8"/>`;
        }
        
        // Подписи
        const labelName = String(name || '').trim();
        const labelSqm = Number.isFinite(Number(sqm)) ? `${Number(sqm).toFixed(1)} м²` : '';
        const fontSize = Math.max(18, Math.min(48, Math.min(pixelWidth, pixelHeight) * 0.14));
        const labelX = pixelX + pixelWidth / 2;
        const labelY = pixelY + pixelHeight / 2 - fontSize * 0.2;
        
        // Стили для текста наложенных помещений
        const textColor = hasOverlaps ? '#0d47a1' : '#1D1D1D';
        const fontWeight = hasOverlaps ? '800' : '700';
        
        svgContent += `\n<text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}">${escapeXml(labelName)}</text>`;
        if (labelSqm) {
            svgContent += `\n<text x="${labelX}" y="${labelY + fontSize * 0.95}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${Math.round(fontSize*0.7)}" fill="${hasOverlaps ? '#1976d2' : '#2F2F2F'}">${escapeXml(labelSqm)}</text>`;
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
    
    if (rooms.some(room => room.doors && room.doors.length > 0)) {
        console.log('SVG Generation - Found doors, processing...');
        rooms.forEach(room => {
            if (!room.doors || room.doors.length === 0) return;
            console.log(`SVG Generation - Processing doors for room ${room.name}:`, room.doors);
            
            const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
            const roomPixels = {
                x: MARGIN + layout.x * CONSTRUCTOR_WIDTH * SVG_SCALE,
                y: MARGIN + layout.y * CONSTRUCTOR_HEIGHT * SVG_SCALE,
                width: layout.width * CONSTRUCTOR_WIDTH * SVG_SCALE,
                height: layout.height * CONSTRUCTOR_HEIGHT * SVG_SCALE
            };

            room.doors.forEach(door => {
                const doorWidth = 8 * SVG_SCALE;
                const doorLength = door.len * (door.side === 'left' || door.side === 'right' ? roomPixels.height : roomPixels.width);
                
                let doorX, doorY, doorRotation = 0;
                
                switch (door.side) {
                    case 'left':
                        doorX = roomPixels.x - doorWidth / 2;
                        doorY = roomPixels.y + door.pos * roomPixels.height;
                        doorRotation = 90;
                        break;
                    case 'right':
                        doorX = roomPixels.x + roomPixels.width - doorWidth / 2;
                        doorY = roomPixels.y + door.pos * roomPixels.height;
                        doorRotation = 90;
                        break;
                    case 'top':
                        doorX = roomPixels.x + door.pos * roomPixels.width;
                        doorY = roomPixels.y - doorWidth / 2;
                        doorRotation = 0;
                        break;
                    case 'bottom':
                        doorX = roomPixels.x + door.pos * roomPixels.width;
                        doorY = roomPixels.y + roomPixels.height - doorWidth / 2;
                        doorRotation = 0;
                        break;
                }

                // Определяем тип двери (входная или межкомнатная)
                const doorType = door.type === 'entrance' ? 'entrance' : 'interior';
                
                // Генерируем дверь с новым дизайном
                const doorGroup = generateDoorDesign(doorLength, doorWidth, doorX, doorY, doorRotation, doorType, room.key, door.side, door.pos);
                svgContent += doorGroup;
            });
        });
    }

    // Draw windows with new design based on JSON specification
    console.log('SVG Generation - Checking for windows in rooms:', rooms.map(r => ({ 
        key: r.key, 
        name: r.name, 
        windows: r.windows?.length || 0,
        windowsData: r.windows 
    })));
    
    if (rooms.some(room => room.windows && room.windows.length > 0)) {
        console.log('SVG Generation - Found windows, processing...');
        rooms.forEach(room => {
            if (!room.windows || room.windows.length === 0) return;
            console.log(`SVG Generation - Processing windows for room ${room.name}:`, room.windows);
            
            const layout = room.layout || { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
            const roomPixels = {
                x: MARGIN + layout.x * CONSTRUCTOR_WIDTH * SVG_SCALE,
                y: MARGIN + layout.y * CONSTRUCTOR_HEIGHT * SVG_SCALE,
                width: layout.width * CONSTRUCTOR_WIDTH * SVG_SCALE,
                height: layout.height * CONSTRUCTOR_HEIGHT * SVG_SCALE
            };

            room.windows.forEach(window => {
                // Определяем, является ли стена внешней
                let isExternalWall = false;
                let isBalconyWall = false;
                
                if (window.side === 'left' || window.side === 'right') {
                    isExternalWall = Math.abs(roomPixels.x - planBounds.left) < EPS || Math.abs(roomPixels.x + roomPixels.width - planBounds.right) < EPS;
                } else {
                    isExternalWall = Math.abs(roomPixels.y - planBounds.top) < EPS || Math.abs(roomPixels.y + roomPixels.height - planBounds.bottom) < EPS;
                }
                
                // Проверяем, не является ли это стеной балкона/лоджии
                if (room.key === 'balcony' || room.name.toLowerCase().includes('балкон') || room.name.toLowerCase().includes('лоджия')) {
                    isBalconyWall = true;
                }
                
                // Определяем толщину стены для окна
                const wallThickness = (isExternalWall && !isBalconyWall) ? WALL_THICKNESS * 2.5 : WALL_THICKNESS;
                
                // Для вертикальных окон (left/right) используем правильные размеры
                const isVertical = window.side === 'left' || window.side === 'right';
                const windowWidth = wallThickness; // Используем толщину стены
                const windowLength = window.len * (isVertical ? roomPixels.height : roomPixels.width);
                
                let windowX, windowY, windowRotation = 0;
                
                switch (window.side) {
                    case 'left':
                        windowX = roomPixels.x - windowWidth / 2;
                        windowY = roomPixels.y + window.pos * roomPixels.height;
                        windowRotation = 90;
                        break;
                    case 'right':
                        windowX = roomPixels.x + roomPixels.width - windowWidth / 2;
                        windowY = roomPixels.y + window.pos * roomPixels.height;
                        windowRotation = 90;
                        break;
                    case 'top':
                        windowX = roomPixels.x + window.pos * roomPixels.width;
                        windowY = roomPixels.y - windowWidth / 2;
                        windowRotation = 0;
                        break;
                    case 'bottom':
                        windowX = roomPixels.x + window.pos * roomPixels.width;
                        windowY = roomPixels.y + roomPixels.height - windowWidth / 2;
                        windowRotation = 0;
                        break;
                }

                // Находим двери на той же стене
                const doorsOnSameWall = room.doors.filter(door => door.side === window.side);
                
                // Генерируем окно с новым дизайном
                const windowGroup = generateWindowDesign(windowLength, windowWidth, windowX, windowY, windowRotation, room.key, window.side, window.pos, doorsOnSameWall);
                svgContent += windowGroup;
            });
        });
    }


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
    
    // Рисуем стены с разной толщиной для внешних и внутренних
    edges.forEach(e => {
        let isExternalWall = false;
        let isBalconyWall = false;
        
        // Проверяем, является ли стена внешней
        if (e.o === 'v') { // вертикальная стена
            isExternalWall = Math.abs(e.c - planBounds.left) < EPS || Math.abs(e.c - planBounds.right) < EPS;
        } else { // горизонтальная стена
            isExternalWall = Math.abs(e.c - planBounds.top) < EPS || Math.abs(e.c - planBounds.bottom) < EPS;
        }
        
        // Проверяем, не является ли это стеной балкона/лоджии
        // Балкон/лоджия должны иметь обычную толщину стен
        const roomAtEdge = pixelRooms.find(r => {
            if (e.o === 'v') {
                return Math.abs(e.c - r.pixelX) < EPS || Math.abs(e.c - (r.pixelX + r.pixelWidth)) < EPS;
            } else {
                return Math.abs(e.c - r.pixelY) < EPS || Math.abs(e.c - (r.pixelY + r.pixelHeight)) < EPS;
            }
        });
        
        if (roomAtEdge && (roomAtEdge.key === 'balcony' || roomAtEdge.name.toLowerCase().includes('балкон') || roomAtEdge.name.toLowerCase().includes('лоджия'))) {
            isBalconyWall = true;
        }
        
        // Определяем толщину стены
        const wallThickness = (isExternalWall && !isBalconyWall) ? WALL_THICKNESS * 2.5 : WALL_THICKNESS;
        
        if (e.o === 'v') {
            svgContent += `\n<line x1="${e.c}" y1="${e.s}" x2="${e.c}" y2="${e.e}" stroke="url(#wallHatch)" stroke-width="${wallThickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
        } else {
            svgContent += `\n<line x1="${e.s}" y1="${e.c}" x2="${e.e}" y2="${e.c}" stroke="url(#wallHatch)" stroke-width="${wallThickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
        }
    });


    // Note: Door rendering is now handled by the new generateDoorDesign function above

    // Draw windows: прорезаем стену и рисуем полосы окна
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, windows = [] } = room;

        if (windows.length > 0) {
            console.log(`Drawing windows for room ${room.key} (${room.name}):`, {
                position: { x: pixelX, y: pixelY, width: pixelWidth, height: pixelHeight },
                windows: windows.map(w => ({ side: w.side, pos: w.pos, len: w.len }))
            });
        }

        windows.forEach(window => {
            // Правильное позиционирование окон на стенах
            const pos = typeof window.pos === 'number' ? window.pos : 0.5;
            const len = typeof window.len === 'number' ? window.len : 0.2;
            
            // Определяем толщину стены для окон
            let isExternalWall = false;
            if (window.side === 'left' || window.side === 'right') {
                isExternalWall = Math.abs(pixelX - planBounds.left) < EPS || Math.abs(pixelX + pixelWidth - planBounds.right) < EPS;
            } else {
                isExternalWall = Math.abs(pixelY - planBounds.top) < EPS || Math.abs(pixelY + pixelHeight - planBounds.bottom) < EPS;
            }
            
            const isBalconyWall = room.key === 'balcony' || room.name.toLowerCase().includes('балкон') || room.name.toLowerCase().includes('лоджия');
            const wallThickness = (isExternalWall && !isBalconyWall) ? WALL_THICKNESS * 2.5 : WALL_THICKNESS;
            const cutWidth = wallThickness + 2;
            const stripe = 4;

            if (window.side === 'top') {
                // Окно на верхней стене
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                const y = pixelY;
                svgContent += `\n<line x1="${startX}" y1="${y}" x2="${startX + winLength}" y2="${y}" stroke="#FFFFFF" stroke-width="${cutWidth}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${startX}" y1="${y - 1}" x2="${startX + winLength}" y2="${y - 1}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${startX}" y1="${y + 1}" x2="${startX + winLength}" y2="${y + 1}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
            } else if (window.side === 'bottom') {
                // Окно на нижней стене
                const startX = pixelX + pos * pixelWidth;
                const winLength = len * pixelWidth;
                const y = pixelY + pixelHeight;
                svgContent += `\n<line x1="${startX}" y1="${y}" x2="${startX + winLength}" y2="${y}" stroke="#FFFFFF" stroke-width="${cutWidth}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${startX}" y1="${y - 1}" x2="${startX + winLength}" y2="${y - 1}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${startX}" y1="${y + 1}" x2="${startX + winLength}" y2="${y + 1}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
            } else if (window.side === 'left') {
                // Окно на левой стене
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                const x = pixelX;
                svgContent += `\n<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + winLength}" stroke="#FFFFFF" stroke-width="${cutWidth}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${x - 1}" y1="${startY}" x2="${x - 1}" y2="${startY + winLength}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${x + 1}" y1="${startY}" x2="${x + 1}" y2="${startY + winLength}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
            } else if (window.side === 'right') {
                // Окно на правой стене
                const startY = pixelY + pos * pixelHeight;
                const winLength = len * pixelHeight;
                const x = pixelX + pixelWidth;
                svgContent += `\n<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + winLength}" stroke="#FFFFFF" stroke-width="${cutWidth}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${x - 1}" y1="${startY}" x2="${x - 1}" y2="${startY + winLength}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
                svgContent += `\n<line x1="${x + 1}" y1="${startY}" x2="${x + 1}" y2="${startY + winLength}" stroke="#1F1F1F" stroke-width="${stripe}" stroke-linecap="square"/>`;
            }
        });
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
            const MARGIN_FROM_WALL = 12; // минимум 12px от стены
            const MAX_OBJECT_SIZE = 0.4; // максимум 40% от размера комнаты
            const MIN_OBJECT_SIZE = 24; // минимум 24px
            
            // Нормализуем размеры объектов
            const normalizedW = Math.min(MAX_OBJECT_SIZE, Math.max(0.08, obj.w * 0.6)); // уменьшаем в 1.5 раза
            const normalizedH = Math.min(MAX_OBJECT_SIZE, Math.max(0.08, obj.h * 0.6));
            
            const objWidth = Math.max(MIN_OBJECT_SIZE, normalizedW * pixelWidth);
            const objHeight = Math.max(MIN_OBJECT_SIZE, normalizedH * pixelHeight);
            
            // Ограничиваем позицию объекта, чтобы он не выходил за рамки комнаты
            const minX = pixelX + MARGIN_FROM_WALL + objWidth/2;
            const maxX = pixelX + pixelWidth - MARGIN_FROM_WALL - objWidth/2;
            const minY = pixelY + MARGIN_FROM_WALL + objHeight/2;
            const maxY = pixelY + pixelHeight - MARGIN_FROM_WALL - objHeight/2;
            
            const objX = Math.max(minX, Math.min(maxX, pixelX + obj.x * pixelWidth));
            const objY = Math.max(minY, Math.min(maxY, pixelY + obj.y * pixelHeight));
            
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
