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
  "bathtub", "shower", "washing_machine"
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

    return `Задача: проанализируй фото комнаты и верни JSON с объектами интерьера и сантехники.
Единицы: координаты x,y — центр объекта в долях от 0 до 1 по ширине/высоте комнаты; w,h — размер объекта как доля от габаритов комнаты; rotation — градусы по часовой.
Обязательно используй только следующие типы:
[${RoomObjectType.options.join(', ')}]
Верни в JSON только те объекты, которые четко видны на фото. Не выдумывай и не добавляй ничего лишнего.
Если дверь не видна, предположи, что фотография сделана из дверного проема и добавь дверь на соответствующую стену (например, side: "bottom", pos: 0.5).
Также, если уверенно видны, укажи окна:
windows: side in [left,right,top,bottom], pos 0..1, len 0..1
${roomSpecificInstructions}
Только JSON, без комментариев и текста вокруг.
Комната: ${name}. Площадь: ${sqm} м².`;
};


async function callOpenAI(base64Images, promptText, isRepair = false) {
    const systemPrompt = isRepair
        ? "Ты — архитектор/дизайнер. Предыдущий JSON был невалидным. Пожалуйста, верни корректный JSON ровно по заданной схеме, без какого-либо текста вокруг."
        : "Ты — архитектор/дизайнер. По фото комнаты определи расположение мебели и сантехники. Верни только JSON по заданной схеме (координаты и размеры нормализованные 0..1 относительно прямоугольника комнаты). Если чего-то нет — не выдумывай, просто не включай объект. Если дверь не видна, предположи, что фотография сделана из дверного проема. Двери/окна оцени по фото, где видно.";

    const imageUrls = base64Images.map(base64 => ({
        type: "image_url",
        image_url: {
            url: `data:image/jpeg;base64,${base64}`,
        },
    }));

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
            // response_format: { type: "json_object" }, // Not universally available yet
        });
        return response.choices[0].message.content;
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
// Demo mode data generator
function generateDemoRoomData({ key, name, sqm }) {
    const roomTypes = {
        'hallway': () => ({
            objects: [
                { type: "wardrobe", x: 0.8, y: 0.5, w: 0.3, h: 0.9, rotation: 0, confidence: 0.9 }
            ],
            doors: [{ side: "bottom", pos: 0.5 }],
            windows: []
        }),
        'kitchen': () => ({
            objects: [
                { type: "fridge", x: 0.8, y: 0.15, w: 0.15, h: 0.2, rotation: 0, confidence: 0.9 },
                { type: "stove", x: 0.45, y: 0.1, w: 0.15, h: 0.15, rotation: 0, confidence: 0.9 },
                { type: "sink", x: 0.15, y: 0.1, w: 0.2, h: 0.15, rotation: 0, confidence: 0.9 },
                { type: "table", x: 0.8, y: 0.7, w: 0.3, h: 0.5, rotation: 0, confidence: 0.8 }
            ],
            doors: [{ side: "left", pos: 0.5 }],
            windows: [{ side: "top", pos: 0.7, len: 0.4 }]
        }),
        'room1': () => ({
            objects: [
                { type: "bed", x: 0.3, y: 0.4, w: 0.4, h: 0.6, rotation: 0, confidence: 0.9 },
                { type: "wardrobe", x: 0.8, y: 0.3, w: 0.2, h: 0.7, rotation: 0, confidence: 0.9 },
                { type: "table", x: 0.1, y: 0.8, w: 0.3, h: 0.2, rotation: 0, confidence: 0.8 }
            ],
            doors: [{ side: "right", pos: 0.5 }],
            windows: [{ side: "top", pos: 0.5, len: 0.6 }]
        }),
        'room2': () => ({
            objects: [
                { type: "sofa", x: 0.25, y: 0.5, w: 0.4, h: 0.8, rotation: 90, confidence: 0.9 },
                { type: "table", x: 0.6, y: 0.6, w: 0.3, h: 0.3, rotation: 0, confidence: 0.8 },
                { type: "wardrobe", x: 0.85, y: 0.4, w: 0.2, h: 0.7, rotation: 0, confidence: 0.9 }
            ],
            doors: [{ side: "right", pos: 0.3 }],
            windows: [{ side: "top", pos: 0.7, len: 0.5 }]
        }),
        'bathroom': () => ({
            objects: [
                { type: "bathtub", x: 0.2, y: 0.3, w: 0.4, h: 0.6, rotation: 0, confidence: 0.9 },
                { type: "toilet", x: 0.7, y: 0.2, w: 0.2, h: 0.3, rotation: 0, confidence: 0.9 },
                { type: "sink", x: 0.7, y: 0.6, w: 0.2, h: 0.2, rotation: 0, confidence: 0.9 }
            ],
            doors: [{ side: "left", pos: 0.5 }],
            windows: [{ side: "top", pos: 0.3, len: 0.3 }]
        }),
        'toilet': () => ({
            objects: [
                { type: "toilet", x: 0.5, y: 0.3, w: 0.2, h: 0.3, rotation: 0, confidence: 0.9 },
                { type: "sink", x: 0.5, y: 0.7, w: 0.2, h: 0.2, rotation: 0, confidence: 0.9 }
            ],
            doors: [{ side: "left", pos: 0.5 }],
            windows: []
        }),
        'balcony': () => ({
            objects: [
                { type: "table", x: 0.5, y: 0.3, w: 0.4, h: 0.3, rotation: 0, confidence: 0.8 },
                { type: "chair", x: 0.3, y: 0.6, w: 0.15, h: 0.15, rotation: 0, confidence: 0.8 }
            ],
            doors: [{ side: "bottom", pos: 0.5 }],
            windows: [{ side: "top", pos: 0.5, len: 1.0 }]
        })
    };

    const generator = roomTypes[key] || roomTypes['room1'];
    return generator();
}

export async function analyzeRoomVision({ photoBuffers, key, name, sqm }) {
    // Check if we're in demo mode
    if (process.env.DEMO_MODE === '1') {
        console.log(`🎭 Demo mode: Generating mock data for ${name}`);
        const demoData = generateDemoRoomData({ key, name, sqm });
        return {
            key,
            name,
            sqm,
            objects: demoData.objects,
            doors: demoData.doors,
            windows: demoData.windows,
        };
    }

    const base64Images = photoBuffers.map(buffer => buffer.toString('base64'));
    const promptText = getPrompt(name, sqm);

    // First attempt
    let responseText = await callOpenAI(base64Images, promptText);
    let jsonData = parseJson(responseText);

    if (!jsonData) {
         throw new Error("AI model did not return valid JSON on the first attempt.");
    }
    
    let validationResult = RoomVisionSchema.partial().safeParse({ key, name, sqm, ...jsonData });


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

    validationResult = RoomVisionSchema.partial().safeParse({ key, name, sqm, ...jsonData });

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
