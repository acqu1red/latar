import OpenAI from 'openai';
import { z } from 'zod';
import { parseJson } from './utils/parseJson.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod Schemas for validation
const RoomObjectType = z.enum([
  "bed", "sofa", "chair", "table", "wardrobe",
  "stove", "fridge", "sink", "toilet",
  "bathtub", "shower", "washing_machine", "kitchen_block", "door", "window"
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

const DoorSchema = z.object({
  side: z.enum(["left", "right", "top", "bottom"]),
  pos: z.number().min(0).max(1),
  len: z.number().min(0).max(1).optional()
});

const WindowSchema = z.object({
  side: z.enum(["left", "right", "top", "bottom"]),
  pos: z.number().min(0).max(1),
  len: z.number().min(0).max(1),
});

export const RoomVisionSchema = z.object({
  key: z.string(),
  name: z.string(),
  sqm: z.number(),
  objects: z.array(RoomObjectSchema),
  doors: z.array(DoorSchema).optional(),
  windows: z.array(WindowSchema).optional(),
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

    return `Проанализируй фото комнаты для создания простого 2D плана КВАРТИРЫ. Верни JSON с базовыми объектами мебели.

ВАЖНО: Это для схематичного плана квартиры, не детального дизайна!

Используй только основные типы:
[bed, sofa, chair, table, wardrobe, stove, fridge, sink, toilet, bathtub, shower, washing_machine, kitchen_block]

ПРАВИЛА:
- Включай только ОСНОВНУЮ мебель (кровать, диван, стол, стулья, кухонная техника)
- НЕ добавляй декоративные элементы, растения, мелкие предметы
- Координаты x,y — центр объекта (0-1), w,h — размер объекта (0-1)
- Максимум 2-5 основных предметов на комнату
- Если вдоль одной стены виден непрерывный кухонный модуль (столешница) с варочной поверхностью/плитой и раковиной — верни один объект типа kitchen_block с суммарными x,y,w,h (по контуру модуля). Если модуль разрозненный — верни отдельно stove и sink.
- ОТДЕЛЬНО выдели двери и окна (массивы doors и windows). Двери: { side, pos, len? }. Окна: { side, pos, len }.
- Если дверь не видна, предположи, что кадр сделан из дверного проёма той стены; добавь дверь с pos по центру.

${roomSpecificInstructions}

Верни только JSON без текста.
Комната: ${name}, ${sqm} м².`;
};


async function callOpenAI(base64Images, promptText, isRepair = false) {
    const systemPrompt = isRepair
        ? "Ты — архитектор/дизайнер. Предыдущий JSON был невалидным. Пожалуйста, верни корректный JSON ровно по заданной схеме, без какого-либо текста вокруг."
        : "Ты — архитектор/дизайнер. По фото комнаты определи расположение мебели и сантехники. Верни только JSON по заданной схеме (координаты и размеры нормализованные 0..1 относительно прямоугольника комнаты). Если чего-то нет — не выдумывай. Отдельно верни массивы doors и windows (сторона стены, позиция вдоль стены 0..1 и относительная длина len 0..1). Если дверь не видна, предположительно кадр из дверного проёма этой стены — добавь дверь по центру.";

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

    const sanitizeEdgeFeature = (item) => {
        if (!item || typeof item !== 'object') return null;
        const side = ["left", "right", "top", "bottom"].includes(item.side) ? item.side : null;
        if (!side) return null;
        const pos = sanitizeNumber01(item.pos);
        if (pos === null) return null;
        const len = item.len != null ? sanitizeNumber01(item.len) : undefined;
        return { side, pos, len };
    };

    const sanitized = {
        key,
        name,
        sqm: typeof sqm === 'string' ? Number(sqm) : sqm,
        objects: sanitizeObjects(jsonData.objects),
        doors: Array.isArray(jsonData.doors) ? jsonData.doors.map(sanitizeEdgeFeature).filter(Boolean) : [],
        windows: Array.isArray(jsonData.windows) ? jsonData.windows.map(sanitizeEdgeFeature).filter(Boolean) : [],
    };

    let validationResult = RoomVisionSchema.partial().safeParse(sanitized);


    if (validationResult.success) {
        // Ensure all required fields are present even if the model omitted them
        return {
            key,
            name,
            sqm,
            objects: validationResult.data.objects || [],
            doors: validationResult.data.doors || [],
            windows: validationResult.data.windows || [],
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
        objects: sanitizeObjects(jsonData.objects),
        doors: Array.isArray(jsonData.doors) ? jsonData.doors.map(sanitizeEdgeFeature).filter(Boolean) : [],
        windows: Array.isArray(jsonData.windows) ? jsonData.windows.map(sanitizeEdgeFeature).filter(Boolean) : [],
    };

    validationResult = RoomVisionSchema.partial().safeParse(sanitizedRepair);

    if (validationResult.success) {
        return {
            key,
            name,
            sqm,
            objects: validationResult.data.objects || [],
            doors: validationResult.data.doors || [],
            windows: validationResult.data.windows || [],
        };
    }

    console.error("Validation failed after repair attempt:", validationResult.error.issues);
    throw new Error("Failed to get a valid room analysis from the AI model after multiple attempts.");
}
