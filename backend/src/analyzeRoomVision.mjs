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
    return `Задача: проанализируй фото комнаты и верни JSON с объектами интерьера и сантехники.
Единицы: координаты x,y — центр объекта в долях от 0 до 1 по ширине/высоте комнаты; w,h — размер объекта как доля от габаритов комнаты; rotation — градусы по часовой.
Обязательно используй только следующие типы:
[${RoomObjectType.options.join(', ')}]
Верни в JSON только те объекты, которые четко видны на фото. Не выдумывай и не добавляй ничего лишнего.
Если дверь не видна, предположи, что фотография сделана из дверного проема и добавь дверь на соответствующую стену (например, side: "bottom", pos: 0.5).
Также, если уверенно видны, укажи окна:
windows: side in [left,right,top,bottom], pos 0..1, len 0..1
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
