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
    'default': '<circle cx="12" cy="12" r="8" stroke="#666" stroke-width="1" fill="none"/>'
};

function createSvgIcon(x, y, w, h, iconContent) {
    return `
      <g>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#ccc" stroke-width="1" rx="2"/>
        <g transform="translate(${x + w/2 - 12}, ${y + h/2 - 12}) scale(${Math.min(w/24, h/24, 1)})">
          <svg width="24" height="24" viewBox="0 0 24 24">
            ${iconContent}
          </svg>
        </g>
      </g>
    `;
}

// НОВЫЕ ФУНКЦИИ РЕНДЕРИНГА С УЧЕТОМ ПОВОРОТА
function renderWindowWithRotation(window, x, y, width, height) {
    const pos = Math.min(1, Math.max(0, Number(window.pos)));
    const len = Math.min(1, Math.max(0.1, Number(window.len) || 0.16));
    const rotation = window.rotation || 0;
    
    const frameThickness = 1;
    const frameGap = 2;
    const mullionGap = 8;
    const windowColor = '#1F1F1F';
    const cutWidth = WALL_THICKNESS + 2;
    
    let svg = '';
    
    if (window.side === 'top') {
        const startX = x + pos * width;
        const winLength = len * width;
        const wallY = y;
        
        // Вырезаем отверстие в стене
        svg += `<line x1="${startX}" y1="${wallY}" x2="${startX + winLength}" y2="${wallY}" stroke="#FFFFFF" stroke-width="${cutWidth}" stroke-linecap="square"/>`;
        
        if (rotation === 90) {
            // Вертикальное окно
            const centerX = startX + winLength / 2;
            const halfHeight = winLength / 2;
            
            svg += `<line x1="${centerX - frameGap}" y1="${wallY - halfHeight}" x2="${centerX - frameGap}" y2="${wallY + halfHeight}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${centerX + frameGap}" y1="${wallY - halfHeight}" x2="${centerX + frameGap}" y2="${wallY + halfHeight}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            
            const mullionStart = centerX - halfHeight;
            const mullionEnd = centerX + halfHeight;
            
            svg += `<line x1="${mullionStart}" y1="${wallY}" x2="${mullionStart + mullionGap}" y2="${wallY}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${mullionEnd - mullionGap}" y1="${wallY}" x2="${mullionEnd}" y2="${wallY}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
        } else {
            // Горизонтальное окно
            svg += `<line x1="${startX}" y1="${wallY - frameGap}" x2="${startX + winLength}" y2="${wallY - frameGap}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${startX}" y1="${wallY + frameGap}" x2="${startX + winLength}" y2="${wallY + frameGap}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            
            const centerX = startX + winLength / 2;
            const mullionStart = wallY - winLength / 2;
            const mullionEnd = wallY + winLength / 2;
            
            svg += `<line x1="${centerX}" y1="${mullionStart}" x2="${centerX}" y2="${mullionStart + mullionGap}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${centerX}" y1="${mullionEnd - mullionGap}" x2="${centerX}" y2="${mullionEnd}" stroke="${windowColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
        }
    }
    // TODO: Добавить остальные стороны для полной совместимости
    
    return svg;
}

function renderDoorWithRotation(door, x, y, width, height) {
    const pos = Math.min(1, Math.max(0, Number(door.pos)));
    const len = door.len != null ? Math.min(1, Math.max(0, Number(door.len))) : 0.2;
    const rotation = door.rotation || 0;
    
    const frameThickness = 1;
    const frameGap = 2;
    const doorColor = '#1E1E1E';
    const doorThickness = door.type === 'entrance' ? 4 : 2;
    const cutWidth = WALL_THICKNESS + 2;
    const doorSpan = Math.min(130, Math.max(80, Math.min(width, height) * 0.28));
    const arcRadius = doorSpan;
    
    let svg = '';
    
    if (door.side === 'top') {
        const doorCenterX = x + pos * width;
        const wallY = y;
        
        // Проём в стене
        svg += `<line x1="${doorCenterX - doorSpan / 2}" y1="${wallY}" x2="${doorCenterX + doorSpan / 2}" y2="${wallY}" stroke="#FFFFFF" stroke-width="${cutWidth}" stroke-linecap="butt"/>`;
        
        if (rotation === 90) {
            // Вертикальная дверь
            const centerX = doorCenterX;
            const halfHeight = doorSpan / 2;
            
            svg += `<line x1="${centerX - frameGap}" y1="${wallY - halfHeight}" x2="${centerX - frameGap}" y2="${wallY + halfHeight}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${centerX + frameGap}" y1="${wallY - halfHeight}" x2="${centerX + frameGap}" y2="${wallY + halfHeight}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${centerX - frameGap}" y1="${wallY - halfHeight}" x2="${centerX + frameGap}" y2="${wallY - halfHeight}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${centerX - frameGap}" y1="${wallY + halfHeight}" x2="${centerX + frameGap}" y2="${wallY + halfHeight}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            
            const doorX = centerX - frameGap + 1;
            const doorY = wallY - halfHeight + 1;
            const doorHeight = halfHeight * 2 - 2;
            
            svg += `<rect x="${doorX}" y="${doorY}" width="${doorThickness}" height="${doorHeight}" fill="none" stroke="${doorColor}" stroke-width="1"/>`;
            
            const arcStartX = doorX + doorThickness / 2;
            const arcStartY = doorY + doorHeight;
            const arcEndX = arcStartX + arcRadius;
            const arcEndY = arcStartY + arcRadius;
            
            svg += `<path d="M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${arcEndY}" stroke="${doorColor}" stroke-width="1" fill="none"/>`;
            
            svg += `<circle cx="${arcStartX}" cy="${doorY}" r="1" fill="${doorColor}"/>`;
            svg += `<circle cx="${arcStartX}" cy="${arcStartY}" r="1" fill="${doorColor}"/>`;
        } else {
            // Горизонтальная дверь
            svg += `<line x1="${doorCenterX - doorSpan / 2}" y1="${wallY - frameGap}" x2="${doorCenterX + doorSpan / 2}" y2="${wallY - frameGap}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${doorCenterX - doorSpan / 2}" y1="${wallY + frameGap}" x2="${doorCenterX + doorSpan / 2}" y2="${wallY + frameGap}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${doorCenterX - doorSpan / 2}" y1="${wallY - frameGap}" x2="${doorCenterX - doorSpan / 2}" y2="${wallY + frameGap}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            svg += `<line x1="${doorCenterX + doorSpan / 2}" y1="${wallY - frameGap}" x2="${doorCenterX + doorSpan / 2}" y2="${wallY + frameGap}" stroke="${doorColor}" stroke-width="${frameThickness}" stroke-linecap="square"/>`;
            
            const doorWidth = doorSpan - 4;
            const doorX = doorCenterX - doorSpan / 2 + 1;
            const doorY = wallY - frameGap + 1;
            
            svg += `<rect x="${doorX}" y="${doorY}" width="${doorWidth}" height="${doorThickness}" fill="none" stroke="${doorColor}" stroke-width="1"/>`;
            
            const arcStartX = doorX + doorWidth;
            const arcStartY = doorY + doorThickness / 2;
            const arcEndX = arcStartX + arcRadius;
            const arcEndY = arcStartY + arcRadius;
            
            svg += `<path d="M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${arcEndY}" stroke="${doorColor}" stroke-width="1" fill="none"/>`;
            
            svg += `<circle cx="${doorX}" cy="${arcStartY}" r="1" fill="${doorColor}"/>`;
            svg += `<circle cx="${arcStartX}" cy="${arcStartY}" r="1" fill="${doorColor}"/>`;
        }
    }
    // TODO: Добавить остальные стороны для полной совместимости
    
    return svg;
}

export async function renderSvgPlan(roomsWithLayout, totalSqm) {
    const mainAreaWidth = SVG_WIDTH - 2 * PADDING;
    const mainAreaHeight = SVG_HEIGHT - HEADER_HEIGHT - 2 * PADDING;

    let roomsSvg = '';
    for (const room of roomsWithLayout) {
        const { x, y, width, height, name, sqm, doors = [], windows = [], objects = [] } = room;

        // Room background and walls
        roomsSvg += `
            <g>
                <!-- Room background -->
                <rect x="${x}" y="${y}" width="${width}" height="${height}" 
                      fill="#fff" stroke="#333" stroke-width="${WALL_THICKNESS/2}" rx="2"/>
                
                <!-- Room label -->
                <text x="${x + width/2}" y="${y + height/2 - 10}" 
                      text-anchor="middle" font-family="${FONT_FAMILY}" font-size="14" font-weight="bold" fill="#333">
                    ${name}
                </text>
                <text x="${x + width/2}" y="${y + height/2 + 8}" 
                      text-anchor="middle" font-family="${FONT_FAMILY}" font-size="12" fill="#666">
                    ${sqm} м²
                </text>
            </g>
        `;

        // Draw doors
        if (doors && doors.length > 0) {
            doors.forEach(door => {
                // Используем новую функцию рендеринга с учетом поворота
                roomsSvg += renderDoorWithRotation(door, x, y, width, height);
            });
        }

        // Draw windows
        if (windows && windows.length > 0) {
            windows.forEach(window => {
                // Используем новую функцию рендеринга с учетом поворота
                roomsSvg += renderWindowWithRotation(window, x, y, width, height);
            });
        }

        // Draw furniture
        const filteredObjects = objects.filter(obj => (obj.w * obj.h) > 0.005).slice(0, 6);
        
        filteredObjects.forEach(obj => {
            const objIcon = ICONS[obj.type] || ICONS.default;
            roomsSvg += createSvgIcon(obj.x, obj.y, obj.w, obj.h, objIcon);
        });
    }

    return `
        <svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="100%" height="100%" fill="#f8f9fa"/>
            
            <!-- Header -->
            <text x="40" y="30" font-family="${FONT_FAMILY}" font-size="18" font-weight="bold" fill="#333">
                План помещения
            </text>
            <text x="40" y="50" font-family="${FONT_FAMILY}" font-size="14" fill="#666">
                Общая площадь: ${totalSqm} м²
            </text>
            
            <!-- Rooms -->
            ${roomsSvg}
        </svg>
    `;
}