import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

import { analyzeRoomVision } from './src/analyzeRoomVision.mjs';
import { generateSvgFromData } from './src/generateSvgFromData.mjs';
// DALL·E стилизация отключена — работаем только с точным SVG

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
const allowedOriginEnv = process.env.CORS_ORIGIN || '';
const allowedOriginsList = allowedOriginEnv
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const allowedOriginSet = new Set();
for (const entry of allowedOriginsList) {
  allowedOriginSet.add(entry);
  try {
    const origin = new URL(entry).origin;
    allowedOriginSet.add(origin);
  } catch {}
}

console.log(`CORS configuration: Allowing origins -> ${Array.from(allowedOriginSet).join(', ')}`);

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`Request received from origin: ${origin}`);
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOriginSet.has(origin)) {
      return callback(null, true);
    }
    console.error(`CORS Error: Origin ${origin} not allowed.`);
    return callback(new Error('Not allowed by CORS'));
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

    console.log('Received rooms:', rooms.map(r => ({ key: r.key, name: r.name, enabled: r.enabled, sqm: r.sqm })));

    const enabledRooms = rooms.filter(r => r.enabled && r.sqm > 0);
    console.log('Enabled rooms:', enabledRooms.map(r => ({ key: r.key, name: r.name, sqm: r.sqm })));
    
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

    console.log('Files by room key:', Object.keys(filesByRoomKey));

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

          console.log(`Analyzing room: ${room.name} (${room.key}) with ${files.length} photos`);
          const result = await analyzeRoomVision({
            photoBuffers: files.map(f => f.buffer),
            key: room.key,
            name: room.name,
            sqm: room.sqm,
          });
          console.log(`Analysis result for ${room.key}:`, { 
            objects: result.objects?.length || 0, 
            doors: result.doors?.length || 0, 
            windows: result.windows?.length || 0,
            objectTypes: result.objects?.map(o => o.type) || []
          });
          return result;
        });

        analyzedRooms = (await Promise.all(analysisPromises)).filter(Boolean);
        console.log('Total analyzed rooms:', analyzedRooms.length);
        
        if (!analyzedRooms || analyzedRooms.length === 0) {
          throw new Error('No rooms could be analyzed.');
        }
      } catch (analysisError) {
        console.error('Photo analysis failed, using basic room data:', analysisError);
        analyzedRooms = enabledRooms.map(room => ({
          key: room.key,
          name: room.name,
          sqm: room.sqm,
          objects: []
        }));
      }

      // Combine analysis data with layout data
      const roomsWithAnalysis = analyzedRooms.map(room => {
        const src = enabledRooms.find(r => r.key === room.key) || {};
        return { 
          ...room, 
          layout: src.layout,
          entrySide: src.entrySide || null
        };
      });

      console.log('Rooms with analysis going to SVG:', roomsWithAnalysis.map(r => ({ 
        key: r.key, 
        name: r.name, 
        objectCount: r.objects?.length || 0,
        layout: r.layout ? 'present' : 'missing'
      })));

      // Генерируем точный SVG и производную PNG без стилизации DALL·E
      const { svgDataUrl, pngDataUrl: svgPngDataUrl } = await generateSvgFromData(roomsWithAnalysis, totalSqm);

      // Validate data URLs before sending
      if (!svgDataUrl || !svgDataUrl.startsWith('data:image/svg+xml;base64,')) {
        console.error('Invalid SVG data URL');
        return res.status(500).json({ ok: false, error: 'Invalid SVG format generated' });
      }
      
      return res.json({
        ok: true,
        mode: 'svg',
        svgDataUrl,
        pngDataUrl: svgPngDataUrl,
        totalSqm,
        rooms: roomsWithAnalysis,
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
