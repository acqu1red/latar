/**
 * Generates detailed SVG floor plan from GPT analysis data
 * @param {Array} analyzedRooms - Array of rooms with detailed GPT analysis
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{svgDataUrl: string, pngDataUrl: string}>} Generated floor plan
 */
export async function generateDetailedSvgFromAnalysis(analyzedRooms, totalSqm) {
    // Размеры SVG (увеличиваем для качества)
    const SVG_SCALE = 2;
    const CANVAS_WIDTH = 2000;
    const CANVAS_HEIGHT = 1400;
    
    // Единая толщина стен для внешних и внутренних стен
    const WALL_THICKNESS = 6 * SVG_SCALE;
    const ICON_STROKE = 2 * SVG_SCALE;
    const ICON_STROKE_COLOR = '#2F2F2F';
    const ICON_FILL_LIGHT = '#F5F6F9';

    // Функция для создания полигона помещения на основе формы
    function createRoomPolygon(room, pixelX, pixelY, pixelWidth, pixelHeight) {
        const { shape } = room;
        if (!shape || !shape.corners || shape.corners.length < 3) {
            // Fallback к прямоугольнику
            return `<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" 
                    fill="#FFFFFF" stroke="#333333" stroke-width="2"/>`;
        }
        
        // Конвертируем относительные координаты в абсолютные
        const points = shape.corners.map(corner => {
            const x = pixelX + corner.x * pixelWidth;
            const y = pixelY + corner.y * pixelHeight;
            return `${x},${y}`;
        }).join(' ');
        
        return `<polygon points="${points}" 
                fill="#FFFFFF" stroke="#333333" stroke-width="2"/>`;
    }

    // Функция для создания мебели
    function createFurniture(x, y, width, height, type, rotation = 0) {
        const scale = 0.6; // Масштаб мебели относительно комнаты
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const offsetX = (width - scaledWidth) / 2;
        const offsetY = (height - scaledHeight) / 2;
        
        const centerX = x + offsetX + scaledWidth / 2;
        const centerY = y + offsetY + scaledHeight / 2;
        
        let furnitureSvg = '';
        
        // Единый цвет для всей мебели - светло-серый
        const color = '#E8E8E8';
        
        if (rotation === 90 || rotation === 270) {
            [scaledWidth, scaledHeight] = [scaledHeight, scaledWidth];
        }
        
        // Создаем прямоугольник мебели
        furnitureSvg += `
            <rect x="${x + offsetX}" y="${y + offsetY}" 
                  width="${scaledWidth}" height="${scaledHeight}" 
                  fill="${color}" stroke="#2F2F2F" stroke-width="1" 
                  rx="2" ry="2"/>
        `;
        
        // Добавляем простые иконки для разных типов мебели
        const iconSize = Math.min(scaledWidth, scaledHeight) * 0.4;
        const iconX = centerX - iconSize / 2;
        const iconY = centerY - iconSize / 2;
        
        switch (type) {
            case 'bed':
                furnitureSvg += `
                    <line x1="${iconX + iconSize * 0.2}" y1="${iconY + iconSize * 0.5}" 
                          x2="${iconX + iconSize * 0.8}" y2="${iconY + iconSize * 0.5}" 
                          stroke="#666666" stroke-width="1"/>
                `;
                break;
            case 'sofa':
                furnitureSvg += `
                    <rect x="${iconX + iconSize * 0.1}" y="${iconY + iconSize * 0.1}" 
                          width="${iconSize * 0.8}" height="${iconSize * 0.8}" 
                          fill="none" stroke="#666666" stroke-width="0.5" rx="1"/>
                `;
                break;
            case 'table':
                furnitureSvg += `
                    <line x1="${iconX + iconSize * 0.3}" y1="${iconY + iconSize * 0.5}" 
                          x2="${iconX + iconSize * 0.7}" y2="${iconY + iconSize * 0.5}" 
                          stroke="#666666" stroke-width="1"/>
                `;
                break;
            case 'wardrobe':
                furnitureSvg += `
                    <line x1="${iconX + iconSize * 0.5}" y1="${iconY}" 
                          x2="${iconX + iconSize * 0.5}" y2="${iconY + iconSize}" 
                          stroke="#666666" stroke-width="1"/>
                `;
                break;
            case 'toilet':
                furnitureSvg += `
                    <ellipse cx="${centerX}" cy="${centerY}" 
                             rx="${iconSize * 0.3}" ry="${iconSize * 0.2}" 
                             fill="none" stroke="#666666" stroke-width="0.5"/>
                `;
                break;
            case 'bathtub':
                furnitureSvg += `
                    <rect x="${iconX + iconSize * 0.1}" y="${iconY + iconSize * 0.1}" 
                          width="${iconSize * 0.8}" height="${iconSize * 0.8}" 
                          fill="none" stroke="#666666" stroke-width="0.5" rx="1"/>
                `;
                break;
            case 'shower':
                furnitureSvg += `
                    <line x1="${iconX + iconSize * 0.2}" y1="${iconY + iconSize * 0.2}" 
                          x2="${iconX + iconSize * 0.8}" y2="${iconY + iconSize * 0.8}" 
                          stroke="#666666" stroke-width="0.5"/>
                `;
                break;
            case 'fridge':
                furnitureSvg += `
                    <rect x="${iconX}" y="${iconY}" width="${iconSize * 0.6}" height="${iconSize}" 
                          fill="none" stroke="#2F2F2F" stroke-width="1"/>
                    <line x1="${iconX + iconSize * 0.3}" y1="${iconY}" 
                          x2="${iconX + iconSize * 0.3}" y2="${iconY + iconSize}" 
                          stroke="#2F2F2F" stroke-width="1"/>
                `;
                break;
            case 'stove':
                furnitureSvg += `
                    <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize * 0.6}" 
                          fill="none" stroke="#2F2F2F" stroke-width="1"/>
                    <circle cx="${iconX + iconSize * 0.25}" cy="${iconY + iconSize * 0.3}" r="${iconSize * 0.1}" 
                            fill="none" stroke="#2F2F2F" stroke-width="1"/>
                    <circle cx="${iconX + iconSize * 0.75}" cy="${iconY + iconSize * 0.3}" r="${iconSize * 0.1}" 
                            fill="none" stroke="#2F2F2F" stroke-width="1"/>
                `;
                break;
            case 'sink':
                furnitureSvg += `
                    <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize * 0.6}" 
                          fill="none" stroke="#2F2F2F" stroke-width="1"/>
                    <circle cx="${centerX}" cy="${centerY}" r="${iconSize * 0.2}" 
                            fill="none" stroke="#2F2F2F" stroke-width="1"/>
                `;
                break;
            case 'washing_machine':
                furnitureSvg += `
                    <rect x="${iconX}" y="${iconY}" width="${iconSize * 0.6}" height="${iconSize}" 
                          fill="none" stroke="#2F2F2F" stroke-width="1"/>
                    <circle cx="${centerX}" cy="${centerY}" r="${iconSize * 0.2}" 
                            fill="none" stroke="#2F2F2F" stroke-width="1"/>
                `;
                break;
            case 'kitchen_block':
                furnitureSvg += `
                    <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize * 0.6}" 
                          fill="none" stroke="#2F2F2F" stroke-width="1"/>
                    <line x1="${iconX + iconSize * 0.2}" y1="${iconY + iconSize * 0.2}" 
                          x2="${iconX + iconSize * 0.8}" y2="${iconY + iconSize * 0.2}" 
                          stroke="#2F2F2F" stroke-width="1"/>
                `;
                break;
        }
        
        return `<g>${furnitureSvg}</g>`;
    }

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
                <line x1="${x + 1}" y1="${y}" x2="${x + 1}" y2="${y + length}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${x + WINDOW_WIDTH - 1}" y1="${y}" x2="${x + WINDOW_WIDTH - 1}" y2="${y + length}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
            `;
            
            // 2. Внутренние линии (полная длина без отступов)
            const middleX1 = x + (WINDOW_WIDTH * 0.25);
            const middleX2 = x + (WINDOW_WIDTH * 0.75);
            
            windowGroup += `
                <line x1="${middleX1}" y1="${y}" x2="${middleX1}" y2="${y + length}" 
                      stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="square"/>
                <line x1="${middleX2}" y1="${y}" x2="${middleX2}" y2="${y + length}" 
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

    // Функция для создания двери
    function createDoor(x, y, length, depth, orientation, doorType) {
        const isHorizontal = orientation === 'horizontal';
        const DOOR_WIDTH = depth;
        const doorColor = doorType === 'entrance' ? '#8D6E63' : '#5D4037';
        const handleColor = '#FFD700';
        
        let doorGroup = `<g>`;
        
        if (isHorizontal) {
            // Горизонтальная дверь
            doorGroup += `
                <rect x="${x}" y="${y}" width="${length}" height="${DOOR_WIDTH}" 
                      fill="${doorColor}" stroke="#2F2F2F" stroke-width="1" rx="2"/>
                <circle cx="${x + length - 12}" cy="${y + DOOR_WIDTH/2}" r="3" 
                        fill="${handleColor}" stroke="#B8860B" stroke-width="0.5"/>
            `;
        } else {
            // Вертикальная дверь
            doorGroup += `
                <rect x="${x}" y="${y}" width="${DOOR_WIDTH}" height="${length}" 
                      fill="${doorColor}" stroke="#2F2F2F" stroke-width="1" rx="2"/>
                <circle cx="${x + DOOR_WIDTH/2}" cy="${y + length - 12}" r="3" 
                        fill="${handleColor}" stroke="#B8860B" stroke-width="0.5"/>
            `;
        }
        
        doorGroup += `</g>`;
        return doorGroup;
    }

    // Рассчитываем позиции комнат на основе их размеров и формы
    const roomsWithPositions = [];
    let currentX = 50;
    let currentY = 50;
    let maxHeightInRow = 0;
    const roomSpacing = 20;

    for (const room of analyzedRooms) {
        const { shape, sqm } = room;
        const { width, height } = shape.mainDimensions;
        
        // Конвертируем метры в пиксели (примерно 100 пикселей на метр)
        const pixelWidth = width * 100 * SVG_SCALE;
        const pixelHeight = height * 100 * SVG_SCALE;
        
        // Проверяем, помещается ли комната в текущую строку
        if (currentX + pixelWidth > CANVAS_WIDTH - 50) {
            // Переходим на новую строку
            currentX = 50;
            currentY += maxHeightInRow + roomSpacing;
            maxHeightInRow = 0;
        }
        
        roomsWithPositions.push({
            ...room,
            pixelX: currentX,
            pixelY: currentY,
            pixelWidth,
            pixelHeight
        });
        
        currentX += pixelWidth + roomSpacing;
        maxHeightInRow = Math.max(maxHeightInRow, pixelHeight);
    }

    // Начинаем создание SVG
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

    // Рисуем комнаты
    roomsWithPositions.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, name, sqm, shape, walls, objects } = room;
        
        // Основной полигон помещения
        svgContent += createRoomPolygon(room, pixelX, pixelY, pixelWidth, pixelHeight);
        
        // Рисуем стены
        walls.forEach(wall => {
            const wallX = pixelX + wall.startPoint.x * pixelWidth;
            const wallY = pixelY + wall.startPoint.y * pixelHeight;
            const wallEndX = pixelX + wall.endPoint.x * pixelWidth;
            const wallEndY = pixelY + wall.endPoint.y * pixelHeight;
            
            // Рисуем стену
            svgContent += `
                <line x1="${wallX}" y1="${wallY}" x2="${wallEndX}" y2="${wallEndY}" 
                      stroke="url(#wallHatch)" stroke-width="${WALL_THICKNESS}" stroke-linecap="square"/>
            `;
            
            // Рисуем окна
            if (wall.hasWindow && wall.windowPosition !== undefined && wall.windowLength !== undefined) {
                const windowX = wallX + wall.windowPosition * (wallEndX - wallX);
                const windowY = wallY + wall.windowPosition * (wallEndY - wallY);
                const windowLength = wall.windowLength * Math.sqrt((wallEndX - wallX) ** 2 + (wallEndY - wallY) ** 2);
                const windowDepth = 40;
                
                const isHorizontal = wall.side === 'top' || wall.side === 'bottom';
                const windowGroup = createLayeredWindow(windowX, windowY, windowLength, windowDepth, isHorizontal ? 'horizontal' : 'vertical');
                svgContent += windowGroup;
            }
            
            // Рисуем двери
            if (wall.hasDoor && wall.doorPosition !== undefined && wall.doorLength !== undefined) {
                const doorX = wallX + wall.doorPosition * (wallEndX - wallX);
                const doorY = wallY + wall.doorPosition * (wallEndY - wallY);
                const doorLength = wall.doorLength * Math.sqrt((wallEndX - wallX) ** 2 + (wallEndY - wallY) ** 2);
                const doorDepth = 20;
                
                const isHorizontal = wall.side === 'top' || wall.side === 'bottom';
                const doorGroup = createDoor(doorX, doorY, doorLength, doorDepth, isHorizontal ? 'horizontal' : 'vertical', wall.doorType || 'interior');
                svgContent += doorGroup;
            }
        });
        
        // Рисуем мебель
        objects.forEach(obj => {
            const objX = pixelX + obj.x * pixelWidth;
            const objY = pixelY + obj.y * pixelHeight;
            const objWidth = obj.w * pixelWidth;
            const objHeight = obj.h * pixelHeight;
            
            const furnitureSvg = createFurniture(objX, objY, objWidth, objHeight, obj.type, obj.rotation || 0);
            svgContent += furnitureSvg;
        });
        
        // Добавляем название и площадь комнаты
        const centerX = pixelX + pixelWidth / 2;
        const centerY = pixelY + pixelHeight / 2;
        svgContent += `
            <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#1D1D1D" stroke="#FFFFFF" stroke-width="2" paint-order="stroke">${name}</text>
            <text x="${centerX}" y="${centerY + 15}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" fill="#2F2F2F" stroke="#FFFFFF" stroke-width="1" paint-order="stroke">${sqm} м²</text>
        `;
    });

    svgContent += `</svg>`;

    // Конвертируем в Data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    return {
        svgDataUrl,
        pngDataUrl: svgDataUrl // Для совместимости
    };
}
