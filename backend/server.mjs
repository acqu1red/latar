import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

import { analyzeRoomVision } from './src/analyzeRoomVision.mjs';
import { renderSvgPlan } from './src/renderSvgPlan.mjs';
import { generateImageFallback } from './src/generateImageFallback.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
const corsOptions = {
    origin: process.env.CORS_origin,
    methods: ["POST", "GET", "OPTIONS"],
    credentials: false
};
app.use(cors(corsOptions));
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
        const fileKeys = req.files.map(f => f.fieldname.replace('photo_', ''));
        const missingFiles = enabledRooms.filter(r => !fileKeys.includes(r.key));
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

        const analysisPromises = req.files.map(async file => {
            const roomKey = file.fieldname.replace('photo_', '');
            const room = enabledRooms.find(r => r.key === roomKey);
            if (!room) return null;

            return analyzeRoomVision({
                photoBuffer: file.buffer,
                key: room.key,
                name: room.name,
                sqm: room.sqm,
            });
        });

        const analyzedRooms = (await Promise.all(analysisPromises)).filter(Boolean);

        const { svgDataUrl, pngDataUrl } = await renderSvgPlan(analyzedRooms, totalSqm);
        
        res.json({
            ok: true,
            mode: 'svg',
            svgDataUrl,
            pngDataUrl,
            totalSqm,
            rooms: analyzedRooms,
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
