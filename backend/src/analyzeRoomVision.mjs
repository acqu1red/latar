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
    return `ЗАДАЧА: Ты — робот-сканер для анализа помещений. Твоя единственная функция — строго и без домыслов преобразовать изображение в JSON.

ПРАВИЛА:
1.  **СТРОГОЕ СЛЕДОВАНИЕ ФОТО:** Ты должен включать в JSON *только* те объекты, которые четко и однозначно видны на прикрепленных фотографиях.
2.  **ЗАПРЕТ НА ДОМЫСЛИВАНИЕ:** Категорически ЗАПРЕЩЕНО добавлять любые объекты, которых нет на фото, даже если они кажутся логичными для данного типа комнаты. Если на фото спальни нет кровати — в JSON кровати быть не должно. Если в ванной не видно унитаза — в JSON его быть не должно.
3.  **ДВЕРИ:**
    *   Если дверь видна на стене — укажи ее расположение.
    *   Если дверей на стенах не видно — это означает, что фото сделано из дверного проема. В этом случае ОБЯЗАТЕЛЬНО добавь одну дверь на "нижнюю" стену (`"side": "bottom", "pos": 0.5`).
4.  **ОКНА:** Указывай окна только если они видны. Не добавляй окна там, где их нет.
5.  **ТИПЫ ОБЪЕКТОВ:** Используй *только* типы из этого строгого списка: [${RoomObjectType.options.join(', ')}]

ФОРМАТ ОТВЕТА: Только JSON, без единого слова до или после.

КОМНАТА ДЛЯ АНАЛИЗА:
- Название: ${name}
- Площадь: ${sqm} м²`;
};


async function callOpenAI(base64Images, promptText, isRepair = false) {
    const systemPrompt = isRepair
        ? "ОШИБКА: Предыдущий JSON был невалидным. Верни АБСОЛЮТНО корректный JSON по исходной схеме. Никакого текста, только JSON."
        : "Ты — робот-сканер, который строго преобразует фото комнат в JSON по заданным правилам.";

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
export async function analyzeRoomVision({ photoBuffers, key, name, sqm }) {
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
