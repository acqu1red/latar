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
            pixelHeight: layout.height * (CANVAS_HEIGHT - 2 * MARGIN),
            // Игнорируем дверные данные из AI; генерируем строго по connections + внешний вход
            doors: [],
            windows: Array.isArray(room.windows) ? [...room.windows] : [],
        };
    });

    // Snap edges to reduce user placement roughness and tiny gaps/overlaps
    const SNAP = 16; // pixels
    const MIN_SIZE = 48; // minimal room thickness to avoid collapse
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const snapEdges = () => {
        // Prepare arrays of edges
        const vEdges = []; // vertical edges: left/right
        const hEdges = []; // horizontal edges: top/bottom
        pixelRooms.forEach((r, idx) => {
            vEdges.push({ idx, kind: 'left', value: r.pixelX });
            vEdges.push({ idx, kind: 'right', value: r.pixelX + r.pixelWidth });
            hEdges.push({ idx, kind: 'top', value: r.pixelY });
            hEdges.push({ idx, kind: 'bottom', value: r.pixelY + r.pixelHeight });
        });

        const clusterAndApply = (edges, isVertical) => {
            edges.sort((a, b) => a.value - b.value);
            let group = [];
            const applyGroup = (grp) => {
                if (grp.length === 0) return;
                const first = grp[0].value;
                const last = grp[grp.length - 1].value;
                if (last - first > SNAP) return; // too wide group, skip
                const avg = grp.reduce((s, e) => s + e.value, 0) / grp.length;
                grp.forEach(e => {
                    const r = pixelRooms[e.idx];
                    if (isVertical) {
                        if (e.kind === 'left') {
                            const newLeft = avg;
                            const newWidth = Math.max(MIN_SIZE, (r.pixelX + r.pixelWidth) - newLeft);
                            r.pixelX = newLeft;
                            r.pixelWidth = newWidth;
                        } else {
                            const newRight = avg;
                            const newWidth = Math.max(MIN_SIZE, newRight - r.pixelX);
                            r.pixelWidth = newWidth;
                        }
                    } else {
                        if (e.kind === 'top') {
                            const newTop = avg;
                            const newHeight = Math.max(MIN_SIZE, (r.pixelY + r.pixelHeight) - newTop);
                            r.pixelY = newTop;
                            r.pixelHeight = newHeight;
                        } else {
                            const newBottom = avg;
                            const newHeight = Math.max(MIN_SIZE, newBottom - r.pixelY);
                            r.pixelHeight = newHeight;
                        }
                    }
                });
            };

            for (let i = 0; i < edges.length; i++) {
                if (group.length === 0) {
                    group.push(edges[i]);
                } else {
                    if (Math.abs(edges[i].value - group[0].value) <= SNAP) {
                        group.push(edges[i]);
                    } else {
                        applyGroup(group);
                        group = [edges[i]];
                    }
                }
            }
            applyGroup(group);
        };

        clusterAndApply(vEdges, true);
        clusterAndApply(hEdges, false);

        // Clamp rooms into canvas margin box
        pixelRooms.forEach(r => {
            r.pixelX = clamp(r.pixelX, MARGIN, CANVAS_WIDTH - MARGIN - MIN_SIZE);
            r.pixelY = clamp(r.pixelY, MARGIN, CANVAS_HEIGHT - MARGIN - MIN_SIZE);
            r.pixelWidth = clamp(r.pixelWidth, MIN_SIZE, CANVAS_WIDTH - MARGIN - r.pixelX);
            r.pixelHeight = clamp(r.pixelHeight, MIN_SIZE, CANVAS_HEIGHT - MARGIN - r.pixelY);
        });
    };

    snapEdges();

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
        const touchesNeighbor = (x1, y1, x2, y2, excludeKey) => pixelRooms.some(r => r.key !== excludeKey && !(r.pixelX >= x2 || r.pixelX + r.pixelWidth <= x1 || r.pixelY >= y2 || r.pixelY + r.pixelHeight <= y1));
        const leftIsExternal = !touchesNeighbor(hallway.pixelX - 1, hallway.pixelY, hallway.pixelX, hallway.pixelY + hallway.pixelHeight, hallway.key);
        const rightIsExternal = !touchesNeighbor(hallway.pixelX + hallway.pixelWidth, hallway.pixelY, hallway.pixelX + hallway.pixelWidth + 1, hallway.pixelY + hallway.pixelHeight, hallway.key);
        const topIsExternal = !touchesNeighbor(hallway.pixelX, hallway.pixelY - 1, hallway.pixelX + hallway.pixelWidth, hallway.pixelY, hallway.key);
        const bottomIsExternal = !touchesNeighbor(hallway.pixelX, hallway.pixelY + hallway.pixelHeight, hallway.pixelX + hallway.pixelWidth, hallway.pixelY + hallway.pixelHeight + 1, hallway.key);

        // remove any external doors on other rooms just in case
        pixelRooms.forEach(r => {
            if (r.key !== hallway.key) r.doors = (r.doors || []).filter(() => false);
        });

        hallway.doors = hallway.doors || [];
        const addCenterDoor = (side) => addDoorIfMissing(hallway, side, 0.5);
        if (leftIsExternal) addCenterDoor('left');
        else if (rightIsExternal) addCenterDoor('right');
        else if (topIsExternal) addCenterDoor('top');
        else if (bottomIsExternal) addCenterDoor('bottom');
    }

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

    // Draw furniture (simple 2D icons; start with sofa and bed recognition)
    pixelRooms.forEach(room => {
        const { pixelX, pixelY, pixelWidth, pixelHeight, objects = [] } = room;
        
        objects.filter(obj => obj.w * obj.h > 0.02).slice(0, 3).forEach(obj => {
            const objX = pixelX + obj.x * pixelWidth;
            const objY = pixelY + obj.y * pixelHeight;
            const objWidth = Math.max(20, obj.w * pixelWidth);
            const objHeight = Math.max(20, obj.h * pixelHeight);
            
            const drawRect = () => {
                svgContent += `\n<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" width="${objWidth}" height="${objHeight}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
            };

            if (obj.type === 'sofa') {
                // Simple sofa icon: outer rect + backrest + seat cushions
                const pad = Math.min(objWidth, objHeight) * 0.08;
                const innerX = objX - objWidth/2 + pad;
                const innerY = objY - objHeight/2 + pad;
                const innerW = objWidth - pad * 2;
                const innerH = objHeight - pad * 2;
                const backThickness = Math.max(8, innerH * 0.18);
                const cushionGap = Math.max(6, innerW * 0.04);
                const cushionW = (innerW - cushionGap) / 2;
                const cushionH = innerH - backThickness - pad * 0.5;
                // outline
                svgContent += `\n<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" width="${objWidth}" height="${objHeight}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
                // backrest (top side)
                svgContent += `\n<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${backThickness}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
                // seat cushions
                svgContent += `\n<rect x="${innerX}" y="${innerY + backThickness + cushionGap * 0.25}" width="${cushionW}" height="${cushionH}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
                svgContent += `\n<rect x="${innerX + cushionW + cushionGap}" y="${innerY + backThickness + cushionGap * 0.25}" width="${cushionW}" height="${cushionH}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
            } else if (obj.type === 'bed') {
                // Simple bed icon: outer rect + two pillows at head side
                const pad = Math.min(objWidth, objHeight) * 0.08;
                const headThickness = Math.max(8, objHeight * 0.18);
                const pillowGap = Math.max(6, objWidth * 0.04);
                const pillowW = (objWidth - pillowGap - pad * 2) / 2;
                const pillowH = Math.max(18, headThickness - pad);
                // outline
                svgContent += `\n<rect x="${objX - objWidth/2}" y="${objY - objHeight/2}" width="${objWidth}" height="${objHeight}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
                // pillows (top side)
                svgContent += `\n<rect x="${objX - objWidth/2 + pad}" y="${objY - objHeight/2 + pad}" width="${pillowW}" height="${pillowH}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
                svgContent += `\n<rect x="${objX - objWidth/2 + pad + pillowW + pillowGap}" y="${objY - objHeight/2 + pad}" width="${pillowW}" height="${pillowH}" fill="none" stroke="#000000" stroke-width="${ICON_STROKE}"/>`;
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
