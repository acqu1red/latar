/**
 * Generates precise SVG floor plan from room data and layout coordinates
 * Using new design system components
 * @param {Array} rooms - Array of room objects with layout, analysis, and connection data
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{svgDataUrl: string, pngDataUrl: string}>} Generated floor plan
 */
export async function generateSvgFromData(rooms, totalSqm) {
    // Import new design system components
    const { PlanCanvas } = await import('./PlanCanvas.mjs');
    const { mmToSvg } = await import('./utils/scale.mjs');

    // Convert constructor coordinates to millimeters
    const CONSTRUCTOR_WIDTH = 1000; // pixels
    const CONSTRUCTOR_HEIGHT = 700; // pixels
    
    // Convert to millimeters (assuming 1 pixel = 1mm for simplicity)
    const PLAN_WIDTH = CONSTRUCTOR_WIDTH; // mm
    const PLAN_HEIGHT = CONSTRUCTOR_HEIGHT; // mm

    // Convert normalized coordinates (0-1) to millimeters
    const roomData = rooms.map(room => {
        const layout = room.layout || { x: 0, y: 0, width: 0.2, height: 0.2 };
        return {
            key: room.key,
            name: room.name,
            x: layout.x * PLAN_WIDTH,
            y: layout.y * PLAN_HEIGHT,
            width: layout.width * PLAN_WIDTH,
            height: layout.height * PLAN_HEIGHT,
            sqm: room.sqm || 0,
            windows: Array.isArray(room.windows) ? [...room.windows] : [],
            doors: Array.isArray(room.doors) ? [...room.doors] : [],
            furniture: [], // Will be populated from room analysis if available
            fixtures: [], // Will be populated from room analysis if available
        };
    });

    // Generate SVG using new design system
    const svgContent = PlanCanvas({
        rooms: roomData,
        totalSqm: totalSqm,
        scale: '1:50',
        width: PLAN_WIDTH,
        height: PLAN_HEIGHT
    });

    // Convert SVG to Data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

    // Generate PNG (if needed)
    let pngDataUrl = null;
    try {
        const sharp = await import('sharp');
        const pngBuffer = await sharp.default(Buffer.from(svgContent))
            .png()
            .toBuffer();
        pngDataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch (error) {
        console.warn('Could not generate PNG:', error.message);
    }

    return {
        svgDataUrl,
        pngDataUrl,
        // Additional debug information
        debug: {
            totalRooms: roomData.length,
            totalSqm: totalSqm,
            roomsWithWindows: rooms.filter(r => r.windows && r.windows.length > 0).length,
            roomsWithDoors: rooms.filter(r => r.doors && r.doors.length > 0).length,
            rooms: rooms.map(r => ({ 
                key: r.key, 
                name: r.name, 
                sqm: r.sqm,
                windows: r.windows?.length || 0,
                doors: r.doors?.length || 0
            }))
        }
    };
}
