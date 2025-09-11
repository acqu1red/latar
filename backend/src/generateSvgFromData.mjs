/**
 * Generates precise SVG floor plan from room data and layout coordinates
 * @param {Array} rooms - Array of room objects with layout, analysis, and connection data
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{svgDataUrl: string, pngDataUrl: string}>} Generated floor plan
 */
export async function generateSvgFromData(rooms, totalSqm) {
    const CANVAS_WIDTH = 2048;
    const CANVAS_HEIGHT = 2048;
    const MARGIN = 36;
    const EXTERIOR_WALL_THICKNESS = 24;
    const INTERIOR_WALL_THICKNESS = 12;
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

    let svgContent = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="background-color: #FFFFFF; shape-rendering: crispEdges;">
<rect width="100%" height="100%" fill="#FFFFFF"/>`;

    // Draw rooms (exterior walls)
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, name } = room;
        
        // Room rectangle (exterior walls)
        svgContent += `
<rect x="${pixelX}" y="${pixelY}" width="${pixelWidth}" height="${pixelHeight}" 
      fill="none" stroke="#000000" stroke-width="${EXTERIOR_WALL_THICKNESS}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
    });

    // Trim shared walls down to interior thickness
    const EPS = 1;
    const TRIM_WIDTH = EXTERIOR_WALL_THICKNESS - INTERIOR_WALL_THICKNESS;
    for (let i = 0; i < pixelRooms.length; i++) {
        for (let j = i + 1; j < pixelRooms.length; j++) {
            const a = pixelRooms[i];
            const b = pixelRooms[j];
            const aLeft = a.pixelX;
            const aRight = a.pixelX + a.pixelWidth;
            const aTop = a.pixelY;
            const aBottom = a.pixelY + a.pixelHeight;
            const bLeft = b.pixelX;
            const bRight = b.pixelX + b.pixelWidth;
            const bTop = b.pixelY;
            const bBottom = b.pixelY + b.pixelHeight;

            // Vertical adjacency
            if (Math.abs(aRight - bLeft) <= EPS) {
                const y1 = Math.max(aTop, bTop);
                const y2 = Math.min(aBottom, bBottom);
                if (y2 - y1 > 0) {
                    svgContent += `\n<line x1="${aRight}" y1="${y1}" x2="${aRight}" y2="${y2}" stroke="#FFFFFF" stroke-width="${TRIM_WIDTH}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
                }
            }
            if (Math.abs(bRight - aLeft) <= EPS) {
                const y1 = Math.max(aTop, bTop);
                const y2 = Math.min(aBottom, bBottom);
                if (y2 - y1 > 0) {
                    svgContent += `\n<line x1="${aLeft}" y1="${y1}" x2="${aLeft}" y2="${y2}" stroke="#FFFFFF" stroke-width="${TRIM_WIDTH}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
                }
            }

            // Horizontal adjacency
            if (Math.abs(aBottom - bTop) <= EPS) {
                const x1 = Math.max(aLeft, bLeft);
                const x2 = Math.min(aRight, bRight);
                if (x2 - x1 > 0) {
                    svgContent += `\n<line x1="${x1}" y1="${aBottom}" x2="${x2}" y2="${aBottom}" stroke="#FFFFFF" stroke-width="${TRIM_WIDTH}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
                }
            }
            if (Math.abs(bBottom - aTop) <= EPS) {
                const x1 = Math.max(aLeft, bLeft);
                const x2 = Math.min(aRight, bRight);
                if (x2 - x1 > 0) {
                    svgContent += `\n<line x1="${x1}" y1="${aTop}" x2="${x2}" y2="${aTop}" stroke="#FFFFFF" stroke-width="${TRIM_WIDTH}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
                }
            }
        }
    }

    // Draw doors (gap + quarter-circle swing)
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, doors = [] } = room;

        doors.forEach(door => {
            const doorCenterX = pixelX + door.pos * pixelWidth;
            const doorCenterY = pixelY + door.pos * pixelHeight;
            const doorSpan = Math.min(120, Math.max(72, Math.min(pixelWidth, pixelHeight) * 0.25));
            const arcRadius = doorSpan;
            const gapStroke = EXTERIOR_WALL_THICKNESS + 2; // больший разрез, чтобы гарантированно срезать стену

            if (door.side === 'top') {
                // gap
                svgContent += `\n<line x1="${doorCenterX - doorSpan / 2}" y1="${pixelY}" x2="${doorCenterX + doorSpan / 2}" y2="${pixelY}" stroke="#FFFFFF" stroke-width="${gapStroke}" stroke-linecap="butt"/>`;
                // arc (hinge at left)
                const hx = doorCenterX - doorSpan / 2;
                const hy = pixelY;
                const ex = hx + arcRadius;
                const ey = hy + arcRadius;
                svgContent += `\n<path d="M ${hx} ${hy} A ${arcRadius} ${arcRadius} 0 0 1 ${ex} ${ey}" stroke="#000000" stroke-width="${ICON_STROKE}" fill="none"/>`;
            } else if (door.side === 'bottom') {
                svgContent += `\n<line x1="${doorCenterX - doorSpan / 2}" y1="${pixelY + pixelHeight}" x2="${doorCenterX + doorSpan / 2}" y2="${pixelY + pixelHeight}" stroke="#FFFFFF" stroke-width="${gapStroke}" stroke-linecap="butt"/>`;
                const hx = doorCenterX - doorSpan / 2;
                const hy = pixelY + pixelHeight;
                const ex = hx + arcRadius;
                const ey = hy - arcRadius;
                svgContent += `\n<path d="M ${hx} ${hy} A ${arcRadius} ${arcRadius} 0 0 0 ${ex} ${ey}" stroke="#000000" stroke-width="${ICON_STROKE}" fill="none"/>`;
            } else if (door.side === 'left') {
                svgContent += `\n<line x1="${pixelX}" y1="${doorCenterY - doorSpan / 2}" x2="${pixelX}" y2="${doorCenterY + doorSpan / 2}" stroke="#FFFFFF" stroke-width="${gapStroke}" stroke-linecap="butt"/>`;
                const hx = pixelX;
                const hy = doorCenterY - doorSpan / 2;
                const ex = hx + arcRadius;
                const ey = hy + arcRadius;
                svgContent += `\n<path d="M ${hx} ${hy} A ${arcRadius} ${arcRadius} 0 0 1 ${ex} ${ey}" stroke="#000000" stroke-width="${ICON_STROKE}" fill="none"/>`;
            } else if (door.side === 'right') {
                svgContent += `\n<line x1="${pixelX + pixelWidth}" y1="${doorCenterY - doorSpan / 2}" x2="${pixelX + pixelWidth}" y2="${doorCenterY + doorSpan / 2}" stroke="#FFFFFF" stroke-width="${gapStroke}" stroke-linecap="butt"/>`;
                const hx = pixelX + pixelWidth;
                const hy = doorCenterY - doorSpan / 2;
                const ex = hx - arcRadius;
                const ey = hy + arcRadius;
                svgContent += `\n<path d="M ${hx} ${hy} A ${arcRadius} ${arcRadius} 0 0 0 ${ex} ${ey}" stroke="#000000" stroke-width="${ICON_STROKE}" fill="none"/>`;
            }
        });
    });

    // Draw windows (double thin lines)
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, windows = [] } = room;

        windows.forEach(window => {
            const winX = pixelX + (typeof window.pos === 'number' ? window.pos : 0.5) * pixelWidth;
            const winY = pixelY + (typeof window.pos === 'number' ? window.pos : 0.5) * pixelHeight;
            const along = (window.side === 'top' || window.side === 'bottom');
            const winLength = Math.max(40, (window.len || 0.2) * (along ? pixelWidth : pixelHeight));
            const gap = 6; // distance between two lines
            const thin = 4; // stroke width for each line

            if (window.side === 'top') {
                svgContent += `\n<line x1="${winX - winLength/2}" y1="${pixelY - gap/2}" x2="${winX + winLength/2}" y2="${pixelY - gap/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
                svgContent += `\n<line x1="${winX - winLength/2}" y1="${pixelY + gap/2}" x2="${winX + winLength/2}" y2="${pixelY + gap/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
            } else if (window.side === 'bottom') {
                const y = pixelY + pixelHeight;
                svgContent += `\n<line x1="${winX - winLength/2}" y1="${y - gap/2}" x2="${winX + winLength/2}" y2="${y - gap/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
                svgContent += `\n<line x1="${winX - winLength/2}" y1="${y + gap/2}" x2="${winX + winLength/2}" y2="${y + gap/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
            } else if (window.side === 'left') {
                svgContent += `\n<line x1="${pixelX - gap/2}" y1="${winY - winLength/2}" x2="${pixelX - gap/2}" y2="${winY + winLength/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
                svgContent += `\n<line x1="${pixelX + gap/2}" y1="${winY - winLength/2}" x2="${pixelX + gap/2}" y2="${winY + winLength/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
            } else if (window.side === 'right') {
                const x = pixelX + pixelWidth;
                svgContent += `\n<line x1="${x - gap/2}" y1="${winY - winLength/2}" x2="${x - gap/2}" y2="${winY + winLength/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
                svgContent += `\n<line x1="${x + gap/2}" y1="${winY - winLength/2}" x2="${x + gap/2}" y2="${winY + winLength/2}" stroke="#000000" stroke-width="${thin}" stroke-linecap="butt"/>`;
            }
        });
    });

    // Draw furniture
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, objects = [] } = room;
        
        objects.filter(obj => obj.w * obj.h > 0.02).slice(0, 2).forEach(obj => {
            const objX = pixelX + obj.x * pixelWidth;
            const objY = pixelY + obj.y * pixelHeight;
            const objWidth = Math.max(20, obj.w * pixelWidth);
            const objHeight = Math.max(20, obj.h * pixelHeight);
            
            // Simple rectangle for furniture
            svgContent += `<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" 
                  width="${objWidth}" height="${objHeight}" 
                  fill="none" stroke="#000000" stroke-width="${ICON_STROKE}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
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
