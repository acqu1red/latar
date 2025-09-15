import OpenAI from 'openai';
import { z } from 'zod';
import { parseJson } from './utils/parseJson.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key-for-testing',
});

// Zod Schemas for validation
const RoomObjectType = z.enum([
  "bed", "sofa", "chair", "table", "wardrobe",
  "stove", "fridge", "sink", "toilet",
  "bathtub", "shower", "washing_machine", "kitchen_block"
]);

const RoomObjectSchema = z.object({
  type: RoomObjectType,
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  rotation: z.number().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

const WindowSchema = z.object({
  side: z.enum(['left', 'right', 'top', 'bottom']),
  pos: z.number().min(0).max(1),
  len: z.number().min(0.1).max(1),
});

const DoorSchema = z.object({
  side: z.enum(['left', 'right', 'top', 'bottom']),
  pos: z.number().min(0).max(1),
  len: z.number().min(0.1).max(1),
  type: z.enum(['entrance', 'interior']),
});

const RoomDimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const RoomVisionSchema = z.object({
  key: z.string(),
  name: z.string(),
  sqm: z.number(),
  dimensions: RoomDimensionsSchema,
  objects: z.array(RoomObjectSchema),
  windows: z.array(WindowSchema),
  doors: z.array(DoorSchema),
});

const getPrompt = (name, sqm) => {
    // Специальные промпты для разных типов комнат
    let roomSpecificInstructions = "";
    
    if (name.toLowerCase().includes('ванная') && !name.toLowerCase().includes('санузел')) {
        // Только ванная комната
        roomSpecificInstructions = `
ВАЖНО: Это только ванная комната (без туалета). Ищи только:
- Ванну (bathtub) или душевую кабину (shower)
- Раковину (sink)
- Стиральную машину (washing_machine) если есть
- Шкафчики или полки
НЕ ищи унитаз (toilet) - его здесь быть не должно.`;
    } else if (name.toLowerCase().includes('санузел') && !name.toLowerCase().includes('ванная')) {
        // Только санузел
        roomSpecificInstructions = `
ВАЖНО: Это только санузел (туалет без ванны). Ищи только:
- Унитаз (toilet)
- Раковину (sink) если есть
- Полки или шкафчики
НЕ ищи ванну (bathtub) или душевую кабину (shower) - их здесь быть не должно.`;
    } else if (name.toLowerCase().includes('ванная') && name.toLowerCase().includes('санузел')) {
        // Совмещенный санузел
        roomSpecificInstructions = `
ВАЖНО: Это совмещенный санузел (ванная + туалет). Ищи:
- Ванну (bathtub) или душевую кабину (shower)
- Унитаз (toilet)
- Раковину (sink)
- Стиральную машину (washing_machine) если есть
- Шкафчики или полки`;
    }

    return `Проанализируй фото комнаты для создания полного 2D плана квартиры. Твоя задача — определить ВСЕ элементы: мебель, окна, двери и рассчитать размеры комнаты и планировку помещения.

Формат ответа (JSON):
{
  "dimensions": { "width": число_в_метрах, "height": число_в_метрах },
  "objects": [{ "type": "bed|sofa|chair|table|wardrobe|stove|fridge|sink|toilet|bathtub|shower|washing_machine|kitchen_block", "x": 0.0-1.0, "y": 0.0-1.0, "w": 0.0-1.0, "h": 0.0-1.0 }],
  "windows": [{ "side": "left|right|top|bottom", "pos": 0.0-1.0, "len": 0.1-1.0 }],
  "doors": [{ "side": "left|right|top|bottom", "pos": 0.0-1.0, "len": 0.1-1.0, "type": "entrance|interior" }]
}

Пояснения:
- dimensions: реальные размеры комнаты в метрах (ширина и высота)
- objects: мебель и предметы интерьера
  - type — тип мебели/предмета
  - x, y — позиция левого верхнего угла (0-1)
  - w, h — ширина и высота (0-1)
- windows: окна на стенах
  - side — сторона стены (left/right/top/bottom)
  - pos — позиция на стене (0-1)
  - len — длина окна относительно стены (0.1-1.0)
- doors: двери на стенах
  - side — сторона стены (left/right/top/bottom)
  - pos — позиция на стене (0-1)
  - len — длина двери относительно стены (0.1-1.0)
  - type — тип двери (entrance для входных, interior для межкомнатных)

${roomSpecificInstructions}

ВАЖНО: 
- Рассчитай размеры комнаты на основе площади ${sqm} м² и пропорций на фото
- Определи все видимые окна и двери
- Если окна/двери не видны, но логически должны быть - добавь их
- Для прихожей добавь входную дверь (type: "entrance")
- Для других комнат добавляй межкомнатные двери (type: "interior")

Верни только JSON. Комната: ${name}, ${sqm} м².`;
};


async function callOpenAI(base64Images, promptText, isRepair = false) {
    const systemPrompt = isRepair
        ? "Ты — архитектор/дизайнер. Предыдущий JSON был невалидным. Пожалуйста, верни корректный JSON ровно по заданной схеме, без какого-либо текста вокруг."
        : "Ты — архитектор/дизайнер. Проанализируй фото комнаты и определи ВСЕ элементы: мебель, окна, двери и рассчитай размеры комнаты. Верни только JSON по заданной схеме с полной информацией о комнате.";

    const imageUrls = base64Images.map(base64 => ({
        type: "image_url",
        image_url: {
            url: `data:image/jpeg;base64,${base64}`,
        },
    }));

    try {
        // First, try with strict JSON mode if supported by the model
        try {
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            ...imageUrls,
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });
            return response.choices[0].message.content;
        } catch (jsonModeError) {
            // Fallback without response_format if not supported
            if (jsonModeError instanceof OpenAI.APIError && jsonModeError.status === 400) {
                const response = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: [ { type: "text", text: promptText }, ...imageUrls ] },
                    ],
                });
                return response.choices[0].message.content;
            }
            throw jsonModeError;
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        if (error instanceof OpenAI.APIError) {
            throw new Error(`OpenAI API Error: ${error.status} ${error.name} - ${error.message}`);
        }
        throw new Error("Failed to communicate with OpenAI API.");
    }
}

/**
 * Analyzes a room photo using OpenAI's Vision model.
 *
 * @param {object} params
 * @param {Buffer[]} params.photoBuffers - The buffers of the photos to analyze.
 * @param {string} params.key - The unique key for the room.
 * @param {string} params.name - The name of the room.
 * @param {number} params.sqm - The square meters of the room.
 * @returns {Promise<z.infer<typeof RoomVisionSchema>>} The analyzed room data.
 */
export async function analyzeRoomVision({ photoBuffers, key, name, sqm }) {
    const base64Images = photoBuffers.map(buffer => buffer.toString('base64'));
    const promptText = getPrompt(name, sqm);

    // First attempt
    let responseText = await callOpenAI(base64Images, promptText);
    let jsonData = parseJson(responseText);

    if (!jsonData) {
         throw new Error("AI model did not return valid JSON on the first attempt.");
    }
    
    // Sanitize/normalize AI JSON before validation
    const sanitizeNumber01 = (value) => {
        const n = typeof value === 'string' ? Number(value) : value;
        if (!Number.isFinite(n)) return null;
        return Math.min(1, Math.max(0, n));
    };

    const sanitizePositiveNumber = (value) => {
        const n = typeof value === 'string' ? Number(value) : value;
        if (!Number.isFinite(n) || n <= 0) return null;
        return n;
    };

    const allowedTypes = RoomObjectType.options;
    const sanitizeObjects = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .map((obj) => {
                const type = typeof obj.type === 'string' ? obj.type : '';
                if (!allowedTypes.includes(type)) return null;
                const x = sanitizeNumber01(obj.x);
                const y = sanitizeNumber01(obj.y);
                const w = sanitizeNumber01(obj.w);
                const h = sanitizeNumber01(obj.h);
                if (x === null || y === null || w === null || h === null) return null;
                const rotation = obj.rotation != null ? Number(obj.rotation) : undefined;
                const confidence = obj.confidence != null ? Math.min(1, Math.max(0, Number(obj.confidence))) : undefined;
                return { type, x, y, w, h, rotation, confidence };
            })
            .filter(Boolean);
    };

    const sanitizeWindows = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .map((win) => {
                const side = typeof win.side === 'string' ? win.side : '';
                if (!['left', 'right', 'top', 'bottom'].includes(side)) return null;
                const pos = sanitizeNumber01(win.pos);
                const len = sanitizeNumber01(win.len);
                if (pos === null || len === null || len < 0.1) return null;
                return { side, pos, len };
            })
            .filter(Boolean);
    };

    const sanitizeDoors = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .map((door) => {
                const side = typeof door.side === 'string' ? door.side : '';
                if (!['left', 'right', 'top', 'bottom'].includes(side)) return null;
                const pos = sanitizeNumber01(door.pos);
                const len = sanitizeNumber01(door.len);
                const type = typeof door.type === 'string' ? door.type : '';
                if (pos === null || len === null || len < 0.1 || !['entrance', 'interior'].includes(type)) return null;
                return { side, pos, len, type };
            })
            .filter(Boolean);
    };

    const sanitizeDimensions = (dim) => {
        if (!dim || typeof dim !== 'object') return { width: 3, height: 3 }; // default dimensions
        const width = sanitizePositiveNumber(dim.width);
        const height = sanitizePositiveNumber(dim.height);
        return {
            width: width || 3,
            height: height || 3
        };
    };

    const sanitized = {
        key,
        name,
        sqm: typeof sqm === 'string' ? Number(sqm) : sqm,
        dimensions: sanitizeDimensions(jsonData.dimensions),
        objects: sanitizeObjects(jsonData.objects || []),
        windows: sanitizeWindows(jsonData.windows || []),
        doors: sanitizeDoors(jsonData.doors || []),
    };

    let validationResult = RoomVisionSchema.partial().safeParse(sanitized);


    if (validationResult.success) {
        // Ensure all required fields are present even if the model omitted them
        return {
            key,
            name,
            sqm,
            dimensions: validationResult.data.dimensions || { width: 3, height: 3 },
            objects: validationResult.data.objects || [],
            windows: validationResult.data.windows || [],
            doors: validationResult.data.doors || [],
        };
    }

    // If validation fails, try a repair prompt once
    console.warn("Initial validation failed. Attempting repair prompt.", validationResult.error.issues);
    responseText = await callOpenAI(base64Images, promptText, true);
    jsonData = parseJson(responseText);

    if (!jsonData) {
        throw new Error("AI model did not return valid JSON on the repair attempt.");
    }

    // Re-sanitize after repair attempt
    const sanitizedRepair = {
        key,
        name,
        sqm: typeof sqm === 'string' ? Number(sqm) : sqm,
        dimensions: sanitizeDimensions(jsonData.dimensions),
        objects: sanitizeObjects(jsonData.objects || []),
        windows: sanitizeWindows(jsonData.windows || []),
        doors: sanitizeDoors(jsonData.doors || []),
    };

    validationResult = RoomVisionSchema.partial().safeParse(sanitizedRepair);

    if (validationResult.success) {
        return {
            key,
            name,
            sqm,
            dimensions: validationResult.data.dimensions || { width: 3, height: 3 },
            objects: validationResult.data.objects || [],
            windows: validationResult.data.windows || [],
            doors: validationResult.data.doors || [],
        };
    }

    console.error("Validation failed after repair attempt:", validationResult.error.issues);
    throw new Error("Failed to get a valid room analysis from the AI model after multiple attempts.");
}
