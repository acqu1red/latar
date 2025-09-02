import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

import { analyzeRoomVision } from './src/analyzeRoomVision.mjs';
import { renderSvgPlan } from './src/renderSvgPlan.mjs';
import { generateImageFallback } from './src/generateImageFallback.mjs';
import { generateAiLayout } from './src/generateAiLayout.mjs';

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
        const { roomsJson } = req.body;
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

        // --- Logic Branch: Image Fallback vs SVG Generation ---
        if (process.env.USE_GPT_IMAGE === '1') {
            const { pngDataUrl } = await generateImageFallback(enabledRooms, totalSqm);
            return res.json({
                ok: true,
                mode: 'image',
                pngDataUrl,
                totalSqm,
                rooms: enabledRooms,
            });
        }

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

        const analyzedRooms = (await Promise.all(analysisPromises)).filter(Boolean);

        // New Step: Generate a logical layout using AI
        const roomLayouts = await generateAiLayout(analyzedRooms);

        // Combine analysis data with layout data
        const roomsWithLayout = analyzedRooms.map(room => {
            const layout = roomLayouts.find(l => l.key === room.key);
            return { ...room, ...layout };
        });

        const { svgDataUrl, pngDataUrl } = await renderSvgPlan(roomsWithLayout, totalSqm);
        
        res.json({
            ok: true,
            mode: 'svg',
            svgDataUrl,
            pngDataUrl,
            totalSqm,
            rooms: roomsWithLayout,
        });

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
