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

        const { doors } = room;
        let objectsSvg = '';
        
        let doorsSvg = '';
        let doorMaskSvg = '';
        if (doors) {
            const defaultLen = 0.16;
            const maskWidth = WALL_THICKNESS + 2;
            doors.forEach(door => {
                const pos = Math.min(1, Math.max(0, Number(door.pos)));
                const len = door.len != null ? Math.min(1, Math.max(0, Number(door.len))) : defaultLen;
                const wallColor = '#111';
                if (door.side === 'top') {
                    const mid = x + width * pos;
                    const half = (width * len) / 2;
                    doorMaskSvg += `<line x1="${mid - half}" y1="${y}" x2="${mid + half}" y2="${y}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    // optional minimal door arc
                    doorsSvg += `<path d="M ${mid - 1} ${y} a 18 18 0 0 1 18 18" stroke="${wallColor}" stroke-width="1" fill="none"/>`;
                }
                if (door.side === 'bottom') {
                    const mid = x + width * pos;
                    const half = (width * len) / 2;
                    doorMaskSvg += `<line x1="${mid - half}" y1="${y + height}" x2="${mid + half}" y2="${y + height}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    doorsSvg += `<path d="M ${mid - 1} ${y + height} a 18 18 0 0 0 18 -18" stroke="${wallColor}" stroke-width="1" fill="none"/>`;
                }
                if (door.side === 'left') {
                    const mid = y + height * pos;
                    const half = (height * len) / 2;
                    doorMaskSvg += `<line x1="${x}" y1="${mid - half}" x2="${x}" y2="${mid + half}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    doorsSvg += `<path d="M ${x} ${mid - 1} a 18 18 0 0 1 18 18" stroke="#111" stroke-width="1" fill="none"/>`;
                }
                if (door.side === 'right') {
                    const mid = y + height * pos;
                    const half = (height * len) / 2;
                    doorMaskSvg += `<line x1="${x + width}" y1="${mid - half}" x2="${x + width}" y2="${mid + half}" stroke="#fff" stroke-width="${maskWidth}" stroke-linecap="square"/>`;
                    doorsSvg += `<path d="M ${x + width} ${mid - 1} a 18 18 0 0 0 -18 18" stroke="#111" stroke-width="1" fill="none"/>`;
                }
            });
        }

        let windowsSvg = '';
        

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
        <svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff;">
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
