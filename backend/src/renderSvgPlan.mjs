import sharp from 'sharp';

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;
const PADDING = 40;
const HEADER_HEIGHT = 60;
const WALL_THICKNESS = 8;
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

        const { name, sqm, objects, doors, windows } = room;

        let objectsSvg = '';
        if (objects && objects.length > 0) {
            // Show only major furniture items, limit to 3-4 most important
            const majorObjects = objects
                .filter(obj => obj.w * obj.h > 0.02) // Only show larger objects
                .slice(0, 4); // Limit to 4 objects max
                
            majorObjects.forEach(obj => {
                const objWidth = Math.max(20, obj.w * width);
                const objHeight = Math.max(20, obj.h * height);
                const objX = x + obj.x * width;
                const objY = y + obj.y * height;
                
                // Simple rectangle with type label instead of complex icons
                objectsSvg += `
                    <rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" 
                          width="${objWidth}" height="${objHeight}" 
                          fill="#f0f0f0" stroke="#999" stroke-width="1" rx="2"/>
                    <text x="${objX}" y="${objY + 4}" font-size="10" font-family="${FONT_FAMILY}" 
                          text-anchor="middle" fill="#666">${obj.type}</text>
                `;
            });
        }
        
        let doorsSvg = '';
        if (doors) {
            doors.forEach(door => {
                const halfThick = WALL_THICKNESS / 2;
                if (door.side === 'top') doorsSvg += `<line x1="${x + width * door.pos}" y1="${y - halfThick}" x2="${x + width * door.pos}" y2="${y + halfThick}" stroke="#f00" stroke-width="2"/>`;
                if (door.side === 'bottom') doorsSvg += `<line x1="${x + width * door.pos}" y1="${y + height - halfThick}" x2="${x + width * door.pos}" y2="${y + height + halfThick}" stroke="#f00" stroke-width="2"/>`;
                if (door.side === 'left') doorsSvg += `<line x1="${x - halfThick}" y1="${y + height * door.pos}" x2="${x + halfThick}" y2="${y + height * door.pos}" stroke="#f00" stroke-width="2"/>`;
                if (door.side === 'right') doorsSvg += `<line x1="${x + width - halfThick}" y1="${y + height * door.pos}" x2="${x + width + halfThick}" y2="${y + height * door.pos}" stroke="#f00" stroke-width="2"/>`;
            });
        }

        let windowsSvg = '';
        if (windows) {
            windows.forEach(win => {
                const lenPx = Math.max(20, win.len * (win.side === 'top' || win.side === 'bottom' ? width : height));
                const halfLen = lenPx / 2;
                if (win.side === 'top') windowsSvg += `<line x1="${x + width * win.pos - halfLen}" y1="${y}" x2="${x + width * win.pos + halfLen}" y2="${y}" stroke="#00f" stroke-width="4"/>`;
                if (win.side === 'bottom') windowsSvg += `<line x1="${x + width * win.pos - halfLen}" y1="${y + height}" x2="${x + width * win.pos + halfLen}" y2="${y + height}" stroke="#00f" stroke-width="4"/>`;
                if (win.side === 'left') windowsSvg += `<line x1="${x}" y1="${y + height * win.pos - halfLen}" x2="${x}" y2="${y + height * win.pos + halfLen}" stroke="#00f" stroke-width="4"/>`;
                if (win.side === 'right') windowsSvg += `<line x1="${x + width}" y1="${y + height * win.pos - halfLen}" x2="${x + width}" y2="${y + height * win.pos + halfLen}" stroke="#00f" stroke-width="4"/>`;
            });
        }
        

        roomsSvg += `
            <g>
                <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fff" stroke="#333" stroke-width="2" />
                <text x="${x + width / 2}" y="${y + 20}" font-size="14" font-family="${FONT_FAMILY}" text-anchor="middle" fill="#333" font-weight="bold">
                    ${name}
                </text>
                <text x="${x + width / 2}" y="${y + 36}" font-size="12" font-family="${FONT_FAMILY}" text-anchor="middle" fill="#666">
                    ${sqm} м²
                </text>
                ${objectsSvg}
                ${doorsSvg}
                ${windowsSvg}
            </g>
        `;
    }

    const svgContent = `
        <svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="background-color: #f9f9f9; border: 1px solid #ccc;">
            <style>
                .header-text { font-size: 28px; font-weight: bold; font-family: ${FONT_FAMILY}; text-anchor: middle; }
                .subheader-text { font-size: 18px; font-family: ${FONT_FAMILY}; text-anchor: middle; fill: #555; }
            </style>
            <text x="${SVG_WIDTH / 2}" y="${PADDING + 10}" class="header-text">2D План Квартиры</text>
            <text x="${SVG_WIDTH / 2}" y="${PADDING + 40}" class="subheader-text">Общая площадь ~${totalSqm.toFixed(1)} м²</text>
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
