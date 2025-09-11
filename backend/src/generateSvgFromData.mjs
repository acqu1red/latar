/**
 * Generates precise SVG floor plan from room data and layout coordinates
 * @param {Array} rooms - Array of room objects with layout, analysis, and connection data
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{svgDataUrl: string, pngDataUrl: string}>} Generated floor plan
 */
export async function generateSvgFromData(rooms, totalSqm) {
    const CANVAS_WIDTH = 1024;
    const CANVAS_HEIGHT = 1024;
    const MARGIN = 24;
    const EXTERIOR_WALL_THICKNESS = 18;
    const INTERIOR_WALL_THICKNESS = 10;
    const ICON_STROKE = 6;

    // Convert normalized coordinates (0-1) to pixel coordinates
    const pixelRooms = rooms.map(room => {
        const layout = room.layout || { x: 0, y: 0, width: 0.2, height: 0.2 };
        return {
            ...room,
            pixelX: MARGIN + layout.x * (CANVAS_WIDTH - 2 * MARGIN),
            pixelY: MARGIN + layout.y * (CANVAS_HEIGHT - 2 * MARGIN),
            pixelWidth: layout.width * (CANVAS_WIDTH - 2 * MARGIN),
            pixelHeight: layout.height * (CANVAS_HEIGHT - 2 * MARGIN)
        };
    });

    let svgContent = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">
<defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="1"/>
    </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#grid)"/>`;

    // Draw rooms (exterior walls)
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, name } = room;
        
        // Room rectangle (exterior walls)
        svgContent += `
<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" 
      fill="none" stroke="black" stroke-width="${EXTERIOR_WALL_THICKNESS}"/>`;
    });

    // Draw doors
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, doors = [] } = room;
        
        doors.forEach(door => {
            const doorX = pixelX + door.pos * pixelWidth;
            const doorY = pixelY + door.pos * pixelHeight;
            const doorWidth = 80;
            const doorHeight = 80;
            
            // Door gap (cut in wall)
            if (door.side === 'top') {
                svgContent += `<line x1="${doorX - doorWidth/2}" y1="${pixelY}" x2="${doorX + doorWidth/2}" y2="${pixelY}" stroke="white" stroke-width="${EXTERIOR_WALL_THICKNESS + 4}"/>`;
                // Door swing arc
                svgContent += `<path d="M ${doorX - 1} ${pixelY} A 18 18 0 0 1 18 18" stroke="black" stroke-width="2" fill="none"/>`;
            } else if (door.side === 'bottom') {
                svgContent += `<line x1="${doorX - doorWidth/2}" y1="${pixelY + pixelHeight}" x2="${doorX + doorWidth/2}" y2="${pixelY + pixelHeight}" stroke="white" stroke-width="${EXTERIOR_WALL_THICKNESS + 4}"/>`;
                svgContent += `<path d="M ${doorX - 1} ${pixelY + pixelHeight} A 18 18 0 0 0 18 -18" stroke="black" stroke-width="2" fill="none"/>`;
            } else if (door.side === 'left') {
                svgContent += `<line x1="${pixelX}" y1="${doorY - doorHeight/2}" x2="${pixelX}" y2="${doorY + doorHeight/2}" stroke="white" stroke-width="${EXTERIOR_WALL_THICKNESS + 4}"/>`;
                svgContent += `<path d="M ${pixelX} ${doorY - 1} A 18 18 0 0 1 18 18" stroke="black" stroke-width="2" fill="none"/>`;
            } else if (door.side === 'right') {
                svgContent += `<line x1="${pixelX + pixelWidth}" y1="${doorY - doorHeight/2}" x2="${pixelX + pixelWidth}" y2="${doorY + doorHeight/2}" stroke="white" stroke-width="${EXTERIOR_WALL_THICKNESS + 4}"/>`;
                svgContent += `<path d="M ${pixelX + pixelWidth} ${doorY - 1} A 18 18 0 0 0 -18 18" stroke="black" stroke-width="2" fill="none"/>`;
            }
        });
    });

    // Draw windows
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, windows = [] } = room;
        
        windows.forEach(window => {
            const winX = pixelX + window.pos * pixelWidth;
            const winY = pixelY + window.pos * pixelHeight;
            const winLength = Math.max(40, window.len * (window.side === 'top' || window.side === 'bottom' ? pixelWidth : pixelHeight));
            
            if (window.side === 'top') {
                svgContent += `<line x1="${winX - winLength/2}" y1="${pixelY}" x2="${winX + winLength/2}" y2="${pixelY}" stroke="black" stroke-width="6"/>`;
            } else if (window.side === 'bottom') {
                svgContent += `<line x1="${winX - winLength/2}" y1="${pixelY + pixelHeight}" x2="${winX + winLength/2}" y2="${pixelY + pixelHeight}" stroke="black" stroke-width="6"/>`;
            } else if (window.side === 'left') {
                svgContent += `<line x1="${pixelX}" y1="${winY - winLength/2}" x2="${pixelX}" y2="${winY + winLength/2}" stroke="black" stroke-width="6"/>`;
            } else if (window.side === 'right') {
                svgContent += `<line x1="${pixelX + pixelWidth}" y1="${winY - winLength/2}" x2="${pixelX + pixelWidth}" y2="${winY + winLength/2}" stroke="black" stroke-width="6"/>`;
            }
        });
    });

    // Draw furniture
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, objects = [] } = room;
        
        objects.filter(obj => obj.w * obj.h > 0.02).slice(0, 4).forEach(obj => {
            const objX = pixelX + obj.x * pixelWidth;
            const objY = pixelY + obj.y * pixelHeight;
            const objWidth = Math.max(20, obj.w * pixelWidth);
            const objHeight = Math.max(20, obj.h * pixelHeight);
            
            // Simple rectangle for furniture
            svgContent += `<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" 
                  width="${objWidth}" height="${objHeight}" 
                  fill="none" stroke="black" stroke-width="${ICON_STROKE}"/>`;
        });
    });

    svgContent += `</svg>`;

    // Convert to PNG
    const sharp = (await import('sharp')).default;
    const svgBuffer = Buffer.from(svgContent);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return {
        svgDataUrl: `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`,
        pngDataUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`
    };
}
