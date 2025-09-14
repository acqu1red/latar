import sharp from 'sharp';

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const PADDING = 40;
const HEADER_HEIGHT = 60;
const WALL_THICKNESS = 12;
const FONT_FAMILY = 'Helvetica, Arial, sans-serif';

const ICONS = {
    bed: '<path d="M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3h16zm-4-4h2v2h-2V6zM6 6h2v2H6V6zm14 6H4v8h16v-8z" fill="#333"/>',
    sofa: '<path d="M20 9H4v6h16V9zM6 7h12v1H6V7zm13 11H5c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2z" fill="#333"/>',
    chair: '<path d="M19 18h-2v-4h-2v4H9v-4H7v4H5v-6h14v6zM7 8h10v2H7V8zM5 6h14v1H5V6z" fill="#333"/>',
    table: '<path d="M20 5H4v14h16V5zm-2 2H6v10h12V7z" fill="#333"/>',
    wardrobe: '<path d="M6 2h12v20H6V2zm2 14h8v2H8v-2zm0-4h8v2H8v-2zm5-4h-2v2h2V8z" fill="#333"/>',
    stove: '<path d="M10 4h4v4h-4V4zm-6 6h16v10H4V10zm2 2v6h12v-6H6z" fill="#333"/>',
    fridge: '<path d="M8 2h8v10H8V2zm0 12h8v8H8v-8zM10 4h4v2h-4V4z" fill="#333"/>',
    sink: '<path d="M8 6h8v2H8V6zm-2 4h12v10H6V10zm2 2v6h8v-6H8zm4-10a2 2 0 11-4 0h4z" fill="#333"/>',
    toilet: '<path d="M18 4H6v10h12V4zm-2 2H8v6h8V6zm-5 8h2v6H9v-6zm5-8H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z" fill="#333"/>',
    bathtub: '<path d="M4 8h16v10H4V8zm1-2h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zm4-2h2v2H9V4z" fill="#333"/>',
    shower: '<path d="M12 2a4 4 0 00-4 4v12h8V6a4 4 0 00-4-4zm-2 2h4v1H10V4zM8 8h8v10H8V8z" fill="#333"/>',
    washing_machine: '<circle cx="12" cy="12" r="4" fill="none" stroke="#333" stroke-width="2"/><path d="M6 2h12v20H6V2zm2 2v16h8V4H8z" fill="#333" fill-opacity="0.1"/>',
};

function getIcon(type, x, y, w, h, rotation) {
    const iconContent = ICONS[type] || '<circle cx="12" cy="12" r="10" fill="#ccc"/>';
    return `
      <g transform="translate(${x - w / 2}, ${y - h / 2})">
        <g transform="rotate(${rotation || 0}, ${w / 2}, ${h / 2})">
          <svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 24 24">
            ${iconContent}
          </svg>
        </g>
      </g>
    `;
}

export async function renderSvgPlan(roomsWithLayout, totalSqm) {
    const mainAreaWidth = SVG_WIDTH - 2 * PADDING;
    const mainAreaHeight = SVG_HEIGHT - HEADER_HEIGHT - 2 * PADDING;

    let roomsSvg = '';
    for (const room of roomsWithLayout) {
        // The room layout is now absolute, based on the AI's plan
        const x = PADDING + (room.x * mainAreaWidth);
        const y = PADDING + HEADER_HEIGHT + (room.y * mainAreaHeight);
        const width = room.width * mainAreaWidth;
        const height = room.height * mainAreaHeight;

        const { objects = [], doors } = room;
        let objectsSvg = '';
        if (objects && objects.length > 0) {
            // Минималистичный рендер мебели: только 2-4 крупных прямоугольника без подписей
            const majorObjects = objects
                .filter(obj => obj.w * obj.h > 0.02)
                .slice(0, 4);

            majorObjects.forEach(obj => {
                const objWidth = Math.max(20, obj.w * width);
                const objHeight = Math.max(20, obj.h * height);
                const objX = x + obj.x * width;
                const objY = y + obj.y * height;
                objectsSvg += `
                    <rect x="${objX - objWidth/2}" y="${objY - objHeight/2}"
                          width="${objWidth}" height="${objHeight}"
                          fill="#eaeaea" stroke="#b5b5b5" stroke-width="1" rx="2"/>
                `;
            });
        }
        
        let doorsSvg = '';
        let doorMaskSvg = '';
        if (doors) {
            const defaultLen = 0.16;
            const maskWidth = WALL_THICKNESS + 2;
            const frameThickness = 1;
            const frameGap = 2;
            const jambColor = '#1E1E1E';
            
            doors.forEach(door => {
                const pos = Math.min(1, Math.max(0, Number(door.pos)));
                const len = door.len != null ? Math.min(1, Math.max(0, Number(door.len))) : defaultLen;
                const doorSpan = Math.min(130, Math.max(80, Math.min(width, height) * 0.28));
                const arcRadius = doorSpan;
                
                if (door.side === 'top') {
                    const mid = x + width * pos;
                    const half = (width * len) / 2;
                    
                    // Проём в стене (пропуск)
                    doorMaskSvg += `<line x1="${mid - half}" y1="${y}" x2="${mid + half}" y2="${y}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    // Дверная коробка
                    doorsSvg += `<line x1="${mid - half}" y1="${y - frameGap}" x2="${mid + half}" y2="${y - frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${mid - half}" y1="${y + frameGap}" x2="${mid + half}" y2="${y + frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${mid - half}" y1="${y - frameGap}" x2="${mid - half}" y2="${y + frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${mid + half}" y1="${y - frameGap}" x2="${mid + half}" y2="${y + frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    
                    // Дверное полотно
                    const doorThickness = door.type === 'entrance' ? 4 : 2;
                    const doorWidth = half * 2 - 4;
                    const doorX = mid - half + 1;
                    const doorY = y - frameGap + 1;
                    doorsSvg += `<rect x="${doorX}" y="${doorY}" width="${doorWidth}" height="${doorThickness}" fill="none" stroke="${jambColor}" stroke-width="1"/>`;
                    
                    // Дуга открывания
                    const arcStartX = doorX + doorWidth;
                    const arcStartY = doorY + doorThickness / 2;
                    const arcEndX = arcStartX + arcRadius;
                    const arcEndY = arcStartY + arcRadius;
                    doorsSvg += `<path d="M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${arcEndY}" stroke="${jambColor}" stroke-width="1" fill="none"/>`;
                    
                    // Петля и ручка
                    doorsSvg += `<circle cx="${doorX}" cy="${arcStartY}" r="1" fill="${jambColor}"/>`;
                    doorsSvg += `<circle cx="${arcStartX}" cy="${arcStartY}" r="1" fill="${jambColor}"/>`;
                }
                if (door.side === 'bottom') {
                    const mid = x + width * pos;
                    const half = (width * len) / 2;
                    
                    // Проём в стене (пропуск)
                    doorMaskSvg += `<line x1="${mid - half}" y1="${y + height}" x2="${mid + half}" y2="${y + height}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    // Дверная коробка
                    doorsSvg += `<line x1="${mid - half}" y1="${y + height + frameGap}" x2="${mid + half}" y2="${y + height + frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${mid - half}" y1="${y + height - frameGap}" x2="${mid + half}" y2="${y + height - frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${mid - half}" y1="${y + height - frameGap}" x2="${mid - half}" y2="${y + height + frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${mid + half}" y1="${y + height - frameGap}" x2="${mid + half}" y2="${y + height + frameGap}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    
                    // Дверное полотно
                    const doorThickness = door.type === 'entrance' ? 4 : 2;
                    const doorWidth = half * 2 - 4;
                    const doorX = mid - half + 1;
                    const doorY = y + height - frameGap - doorThickness;
                    doorsSvg += `<rect x="${doorX}" y="${doorY}" width="${doorWidth}" height="${doorThickness}" fill="none" stroke="${jambColor}" stroke-width="1"/>`;
                    
                    // Дуга открывания
                    const arcStartX = doorX + doorWidth;
                    const arcStartY = doorY + doorThickness / 2;
                    const arcEndX = arcStartX + arcRadius;
                    const arcEndY = arcStartY - arcRadius;
                    doorsSvg += `<path d="M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}" stroke="${jambColor}" stroke-width="1" fill="none"/>`;
                    
                    // Петля и ручка
                    doorsSvg += `<circle cx="${doorX}" cy="${arcStartY}" r="1" fill="${jambColor}"/>`;
                    doorsSvg += `<circle cx="${arcStartX}" cy="${arcStartY}" r="1" fill="${jambColor}"/>`;
                }
                if (door.side === 'left') {
                    const mid = y + height * pos;
                    const half = (height * len) / 2;
                    
                    // Проём в стене (пропуск)
                    doorMaskSvg += `<line x1="${x}" y1="${mid - half}" x2="${x}" y2="${mid + half}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    // Дверная коробка
                    doorsSvg += `<line x1="${x - frameGap}" y1="${mid - half}" x2="${x - frameGap}" y2="${mid + half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${x + frameGap}" y1="${mid - half}" x2="${x + frameGap}" y2="${mid + half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${x - frameGap}" y1="${mid - half}" x2="${x + frameGap}" y2="${mid - half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${x - frameGap}" y1="${mid + half}" x2="${x + frameGap}" y2="${mid + half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    
                    // Дверное полотно
                    const doorThickness = door.type === 'entrance' ? 4 : 2;
                    const doorHeight = half * 2 - 4;
                    const doorX = x - frameGap + 1;
                    const doorY = mid - half + 1;
                    doorsSvg += `<rect x="${doorX}" y="${doorY}" width="${doorThickness}" height="${doorHeight}" fill="none" stroke="${jambColor}" stroke-width="1"/>`;
                    
                    // Дуга открывания
                    const arcStartX = doorX + doorThickness / 2;
                    const arcStartY = doorY + doorHeight;
                    const arcEndX = arcStartX + arcRadius;
                    const arcEndY = arcStartY + arcRadius;
                    doorsSvg += `<path d="M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${arcEndY}" stroke="${jambColor}" stroke-width="1" fill="none"/>`;
                    
                    // Петля и ручка
                    doorsSvg += `<circle cx="${arcStartX}" cy="${doorY}" r="1" fill="${jambColor}"/>`;
                    doorsSvg += `<circle cx="${arcStartX}" cy="${arcStartY}" r="1" fill="${jambColor}"/>`;
                }
                if (door.side === 'right') {
                    const mid = y + height * pos;
                    const half = (height * len) / 2;
                    
                    // Проём в стене (пропуск)
                    doorMaskSvg += `<line x1="${x + width}" y1="${mid - half}" x2="${x + width}" y2="${mid + half}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    // Дверная коробка
                    doorsSvg += `<line x1="${x + width + frameGap}" y1="${mid - half}" x2="${x + width + frameGap}" y2="${mid + half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${x + width - frameGap}" y1="${mid - half}" x2="${x + width - frameGap}" y2="${mid + half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${x + width - frameGap}" y1="${mid - half}" x2="${x + width + frameGap}" y2="${mid - half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    doorsSvg += `<line x1="${x + width - frameGap}" y1="${mid + half}" x2="${x + width + frameGap}" y2="${mid + half}" stroke="${jambColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    
                    // Дверное полотно
                    const doorThickness = door.type === 'entrance' ? 4 : 2;
                    const doorHeight = half * 2 - 4;
                    const doorX = x + width - frameGap - doorThickness;
                    const doorY = mid - half + 1;
                    doorsSvg += `<rect x="${doorX}" y="${doorY}" width="${doorThickness}" height="${doorHeight}" fill="none" stroke="${jambColor}" stroke-width="1"/>`;
                    
                    // Дуга открывания
                    const arcStartX = doorX + doorThickness / 2;
                    const arcStartY = doorY + doorHeight;
                    const arcEndX = arcStartX - arcRadius;
                    const arcEndY = arcStartY + arcRadius;
                    doorsSvg += `<path d="M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}" stroke="${jambColor}" stroke-width="1" fill="none"/>`;
                    
                    // Петля и ручка
                    doorsSvg += `<circle cx="${arcStartX}" cy="${doorY}" r="1" fill="${jambColor}"/>`;
                    doorsSvg += `<circle cx="${arcStartX}" cy="${arcStartY}" r="1" fill="${jambColor}"/>`;
                }
            });
        }

        let windowsSvg = '';
        if (room.windows && room.windows.length > 0) {
            const defaultLen = 0.16;

            room.windows.forEach(window => {
                const pos = Math.min(1, Math.max(0, Number(window.pos)));
                const len = Math.min(1, Math.max(0.1, Number(window.len) || defaultLen));
                
                // Проверяем, есть ли рядом дверь на той же стороне
                const nearbyDoor = room.doors?.find(door => {
                    if (window.side !== door.side) return false;
                    const windowPos = window.pos * (window.side === 'left' || window.side === 'right' ? height : width);
                    const doorPos = door.pos * (door.side === 'left' || door.side === 'right' ? height : width);
                    const windowLen = window.len * (window.side === 'left' || window.side === 'right' ? height : width);
                    const doorLen = door.len * (door.side === 'left' || door.side === 'right' ? height : width);
                    
                    const windowStart = windowPos - windowLen / 2;
                    const windowEnd = windowPos + windowLen / 2;
                    const doorStart = doorPos - doorLen / 2;
                    const doorEnd = doorPos + doorLen / 2;
                    
                    return !(windowEnd < doorStart - 50 || windowStart > doorEnd + 50);
                });
                
                if (window.side === 'top') {
                    const mid = x + width * pos;
                    const half = (width * len) / 2;
                    const maskWidth = WALL_THICKNESS + 2;
                    const frameThickness = 1;
                    const frameGap = 2;
                    const mullionGap = 8;
                    
                    // Вырезаем отверстие в стене
                    windowsSvg += `<line x1="${mid - half}" y1="${y}" x2="${mid + half}" y2="${y}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    if (nearbyDoor) {
                        // Если рядом дверь - рисуем только центральную полоску с разделениями
                        const centerX = mid;
                        const mullionStart = y - half;
                        const mullionEnd = y + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionStart}" x2="${centerX}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionEnd - mullionGap}" x2="${centerX}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    } else {
                        // Обычное окно с полной рамой
                        // Внешний контур рамы (ближе к стене)
                        windowsSvg += `<line x1="${mid - half}" y1="${y - frameGap}" x2="${mid + half}" y2="${y - frameGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Внутренний контур рамы (ближе к комнате)
                        windowsSvg += `<line x1="${mid - half}" y1="${y + frameGap}" x2="${mid + half}" y2="${y + frameGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Центральный импост с разделениями
                        const centerX = mid;
                        const mullionStart = y - half;
                        const mullionEnd = y + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionStart}" x2="${centerX}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionEnd - mullionGap}" x2="${centerX}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    }
                }
                if (window.side === 'bottom') {
                    const mid = x + width * pos;
                    const half = (width * len) / 2;
                    const maskWidth = WALL_THICKNESS + 2;
                    const frameThickness = 1;
                    const frameGap = 2;
                    const mullionGap = 8;
                    
                    // Вырезаем отверстие в стене
                    windowsSvg += `<line x1="${mid - half}" y1="${y + height}" x2="${mid + half}" y2="${y + height}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    if (nearbyDoor) {
                        // Если рядом дверь - рисуем только центральную полоску с разделениями
                        const centerX = mid;
                        const mullionStart = y + height - half;
                        const mullionEnd = y + height + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionStart}" x2="${centerX}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionEnd - mullionGap}" x2="${centerX}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    } else {
                        // Обычное окно с полной рамой
                        // Внешний контур рамы (ближе к стене)
                        windowsSvg += `<line x1="${mid - half}" y1="${y + height + frameGap}" x2="${mid + half}" y2="${y + height + frameGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Внутренний контур рамы (ближе к комнате)
                        windowsSvg += `<line x1="${mid - half}" y1="${y + height - frameGap}" x2="${mid + half}" y2="${y + height - frameGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Центральный импост с разделениями
                        const centerX = mid;
                        const mullionStart = y + height - half;
                        const mullionEnd = y + height + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionStart}" x2="${centerX}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${centerX}" y1="${mullionEnd - mullionGap}" x2="${centerX}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    }
                }
                if (window.side === 'left') {
                    const mid = y + height * pos;
                    const half = (height * len) / 2;
                    const maskWidth = WALL_THICKNESS + 2;
                    const frameThickness = 1;
                    const frameGap = 2;
                    const mullionGap = 8;
                    
                    // Вырезаем отверстие в стене
                    windowsSvg += `<line x1="${x}" y1="${mid - half}" x2="${x}" y2="${mid + half}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    if (nearbyDoor) {
                        // Если рядом дверь - рисуем только центральную полоску с разделениями
                        const centerY = mid;
                        const mullionStart = mid - half;
                        const mullionEnd = mid + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${x}" y1="${mullionStart}" x2="${x}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${x}" y1="${mullionEnd - mullionGap}" x2="${x}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    } else {
                        // Обычное окно с полной рамой
                        // Внешний контур рамы (ближе к стене)
                        windowsSvg += `<line x1="${x - frameGap}" y1="${mid - half}" x2="${x - frameGap}" y2="${mid + half}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Внутренний контур рамы (ближе к комнате)
                        windowsSvg += `<line x1="${x + frameGap}" y1="${mid - half}" x2="${x + frameGap}" y2="${mid + half}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Центральный импост с разделениями
                        const centerY = mid;
                        const mullionStart = mid - half;
                        const mullionEnd = mid + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${x}" y1="${mullionStart}" x2="${x}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${x}" y1="${mullionEnd - mullionGap}" x2="${x}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    }
                }
                if (window.side === 'right') {
                    const mid = y + height * pos;
                    const half = (height * len) / 2;
                    const maskWidth = WALL_THICKNESS + 2;
                    const frameThickness = 1;
                    const frameGap = 2;
                    const mullionGap = 8;
                    
                    // Вырезаем отверстие в стене
                    windowsSvg += `<line x1="${x + width}" y1="${mid - half}" x2="${x + width}" y2="${mid + half}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    
                    if (nearbyDoor) {
                        // Если рядом дверь - рисуем только центральную полоску с разделениями
                        const centerY = mid;
                        const mullionStart = mid - half;
                        const mullionEnd = mid + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${x + width}" y1="${mullionStart}" x2="${x + width}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${x + width}" y1="${mullionEnd - mullionGap}" x2="${x + width}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    } else {
                        // Обычное окно с полной рамой
                        // Внешний контур рамы (ближе к стене)
                        windowsSvg += `<line x1="${x + width + frameGap}" y1="${mid - half}" x2="${x + width + frameGap}" y2="${mid + half}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Внутренний контур рамы (ближе к комнате)
                        windowsSvg += `<line x1="${x + width - frameGap}" y1="${mid - half}" x2="${x + width - frameGap}" y2="${mid + half}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Центральный импост с разделениями
                        const centerY = mid;
                        const mullionStart = mid - half;
                        const mullionEnd = mid + half;
                        
                        // Верхняя часть импоста
                        windowsSvg += `<line x1="${x + width}" y1="${mullionStart}" x2="${x + width}" y2="${mullionStart + mullionGap}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                        
                        // Нижняя часть импоста
                        windowsSvg += `<line x1="${x + width}" y1="${mullionEnd - mullionGap}" x2="${x + width}" y2="${mullionEnd}" stroke="#1F1F1F" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
                    }
                }
            });
        }

        roomsSvg += `
            <g>
                <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fff" stroke="#111" stroke-width="${WALL_THICKNESS}" />
                ${doorMaskSvg}
                ${objectsSvg}
                ${doorsSvg}
                ${windowsSvg}
            </g>
        `;
    }

    const svgContent = `
        <svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff; font-family: Arial, sans-serif;">
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            ${roomsSvg}
        </svg>
    `;

    const svgBuffer = Buffer.from(svgContent);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return {
        svgDataUrl: `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`,
        pngDataUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`,
    };
}
