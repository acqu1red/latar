import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

import { analyzeRoomVision } from './src/analyzeRoomVision.mjs';
import { generateSvgFromData } from './src/generateSvgFromData.mjs';
import { styleSvgWithDalle } from './src/styleSvgWithDalle.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
const allowedOrigin = process.env.CORS_ORIGIN;
console.log(`CORS configuration: Allowing origin -> ${allowedOrigin}`);

const corsOptions = {
    origin: function (origin, callback) {
        console.log(`Request received from origin: ${origin}`);
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["POST", "GET", "OPTIONS"],
    credentials: false
};

app.use(cors(corsOptions));
// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

const maxFileMb = parseInt(process.env.MAX_FILE_MB || '10', 10);
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: maxFileMb * 1024 * 1024 },
});

// --- Routes ---
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.post('/api/generate-plan', upload.any(), async (req, res) => {
    try {
        const { roomsJson, bathroomConfig } = req.body;
        if (!roomsJson) {
            return res.status(400).json({ ok: false, error: 'roomsJson is required.' });
        }

        let rooms;
        try {
            rooms = JSON.parse(roomsJson);
        } catch (error) {
            return res.status(400).json({ ok: false, error: 'Invalid roomsJson format.' });
        }

        const enabledRooms = rooms.filter(r => r.enabled && r.sqm > 0);
        if (enabledRooms.length === 0) {
            return res.status(400).json({ ok: false, error: 'No enabled rooms with sqm > 0.' });
        }

        // Check if all enabled rooms have a corresponding file
        const filesByRoomKey = req.files.reduce((acc, file) => {
            const key = file.fieldname.replace('photo_', '');
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(file);
            return acc;
        }, {});

        const missingFiles = enabledRooms.filter(r => !filesByRoomKey[r.key] || filesByRoomKey[r.key].length === 0);
        if (missingFiles.length > 0) {
            const missingKeys = missingFiles.map(r => r.key).join(', ');
            return res.status(400).json({ ok: false, error: `Missing photo files for: ${missingKeys}` });
        }

        const totalSqm = enabledRooms.reduce((sum, r) => sum + r.sqm, 0);

        // --- Always use hybrid approach: SVG + DALL-E styling ---
        {
            // First analyze photos to get furniture/doors data
            let analyzedRooms;
            try {
                const analysisPromises = enabledRooms.map(async (room) => {
                    const files = filesByRoomKey[room.key];
                    if (!files) return null;

                    return analyzeRoomVision({
                        photoBuffers: files.map(f => f.buffer),
                        key: room.key,
                        name: room.name,
                        sqm: room.sqm,
                    });
                });

                analyzedRooms = (await Promise.all(analysisPromises)).filter(Boolean);
                if (!analyzedRooms || analyzedRooms.length === 0) {
                    throw new Error('No rooms could be analyzed.');
                }
            } catch (analysisError) {
                console.error('Photo analysis failed, using basic room data:', analysisError);
                analyzedRooms = enabledRooms.map(room => ({
                    key: room.key,
                    name: room.name,
                    sqm: room.sqm,
                    objects: [],
                    doors: [],
                    windows: [],
                    connections: room.connections || []
                }));
            }

            // Combine analysis data with layout data
            const roomsWithAnalysis = analyzedRooms.map(room => {
                const src = enabledRooms.find(r => r.key === room.key) || {};
                return { 
                    ...room, 
                    layout: src.layout,
                    connections: src.connections || []
                };
            });

            // Ensure bathroom configuration (combined/separate) reflects user's choice
            const applyBathroomConfig = (roomsArr, config) => {
                if (!config || !config.type) return roomsArr;
                const isBathName = (n = '') => /ванн|сануз|туал|bath|wc/i.test(String(n));
                const bathRooms = roomsArr.filter(r => isBathName(r.name));
                if (config.type === 'combined' && bathRooms.length >= 2) {
                    // Merge all bathroom-like rooms into one bounding box
                    const first = bathRooms[0];
                    let minX = first.layout?.x ?? 0, minY = first.layout?.y ?? 0;
                    let maxX = (first.layout?.x ?? 0) + (first.layout?.width ?? 0.15);
                    let maxY = (first.layout?.y ?? 0) + (first.layout?.height ?? 0.15);
                    let sumSqm = 0;
                    const agg = {
                        key: 'bath_combined',
                        name: 'Санузел совмещенный',
                        objects: [], doors: [], windows: [],
                        connections: [], layout: null, sqm: 0
                    };
                    bathRooms.forEach(r => {
                        const lx = r.layout?.x ?? 0, ly = r.layout?.y ?? 0;
                        const rx = lx + (r.layout?.width ?? 0.15);
                        const by = ly + (r.layout?.height ?? 0.15);
                        minX = Math.min(minX, lx); minY = Math.min(minY, ly);
                        maxX = Math.max(maxX, rx); maxY = Math.max(maxY, by);
                        sumSqm += Number(r.sqm) || 0;
                        agg.objects = agg.objects.concat(r.objects || []);
                        agg.doors = agg.doors.concat(r.doors || []);
                        agg.windows = agg.windows.concat(r.windows || []);
                        agg.connections = agg.connections.concat(r.connections || []);
                    });
                    agg.layout = { x: minX, y: minY, width: Math.max(0.08, maxX - minX), height: Math.max(0.08, maxY - minY) };
                    agg.sqm = Math.max(sumSqm, 2);
                    const others = roomsArr.filter(r => !bathRooms.includes(r));
                    // Remove connections referencing removed rooms and replace with combined key
                    const bathKeys = new Set(bathRooms.map(r => r.key));
                    agg.connections = Array.from(new Set(agg.connections.map(c => bathKeys.has(c) ? 'bath_combined' : c)));
                    const updated = others.map(r => ({
                        ...r,
                        connections: Array.from(new Set((r.connections || []).map(c => bathKeys.has(c) ? 'bath_combined' : c)))
                    }));
                    return [...updated, agg];
                }
                // For 'separate' do nothing — у пользователя уже заданы отдельные помещения
                return roomsArr;
            };

            const roomsPrepared = applyBathroomConfig(roomsWithAnalysis, bathroomConfig);

            // Generate precise SVG from data first
            const { svgDataUrl, pngDataUrl: svgPngDataUrl } = await generateSvgFromData(roomsPrepared, totalSqm);
            
            // Optionally style with DALL-E for better visual quality
            let styledPngDataUrl = svgPngDataUrl;
            try {
                // Use PNG (A) as content image for style-preserving redraw
                const { pngDataUrl } = await styleSvgWithDalle(svgPngDataUrl, roomsPrepared, totalSqm);
                styledPngDataUrl = pngDataUrl;
            } catch (styleError) {
                console.warn('DALL-E styling failed, using SVG PNG:', styleError);
            }

            // Validate data URLs before sending
            if (!svgDataUrl || !svgDataUrl.startsWith('data:image/svg+xml;base64,')) {
                console.error('Invalid SVG data URL');
                return res.status(500).json({ ok: false, error: 'Invalid SVG format generated' });
            }
            
            if (!styledPngDataUrl || !styledPngDataUrl.startsWith('data:image/png;base64,')) {
                console.error('Invalid PNG data URL');
                return res.status(500).json({ ok: false, error: 'Invalid PNG format generated' });
            }

            return res.json({
                ok: true,
                mode: 'image',
                svgDataUrl,
                pngDataUrl: styledPngDataUrl,
                totalSqm,
                rooms: roomsPrepared,
            });
        }


    } catch (error) {
        console.error('Error in /api/generate-plan:', error);
        // Handle multer file size error
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ ok: false, error: `File is too large. Maximum size is ${maxFileMb} MB.` });
        }
        res.status(500).json({ ok: false, error: error.message || 'An internal server error occurred.' });
    }
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
