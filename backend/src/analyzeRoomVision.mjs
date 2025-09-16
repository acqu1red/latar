import OpenAI from 'openai';
import { z } from 'zod';
import { parseJson } from './utils/parseJson.mjs';
import { getAllFurnitureTypes, getFurnitureByRoomType, generateFurnitureInstructions } from './furnitureDatabase.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key-for-testing',
});

// Динамически получаем все типы мебели из базы данных
const furnitureTypes = getAllFurnitureTypes();

// Zod Schemas for validation - используем динамический список типов
const RoomObjectType = z.enum(furnitureTypes.length > 0 ? furnitureTypes : ["bed"]);

const RoomObjectSchema = z.object({
  type: RoomObjectType,
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  rotation: z.number().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const RoomVisionSchema = z.object({
  key: z.string(),
  name: z.string(),
  sqm: z.number(),
  objects: z.array(RoomObjectSchema),
});

const getPrompt = (name, sqm, layoutData = null) => {
    // Получаем релевантную мебель для данного типа помещения
    const furnitureInstructions = generateFurnitureInstructions(name);
    
    // Инструкции по анализу стен и координатам
    let wallAnalysisInstructions = "";
    
    if (layoutData) {
        wallAnalysisInstructions = `
ВАЖНО - АНАЛИЗ СТЕН И КООРДИНАТ:
1. Внимательно изучи геометрию помещения из конструктора:
   - Помещение расположено по координатам: x=${layoutData.x}, y=${layoutData.y}
   - Размеры помещения: ширина=${layoutData.width}, высота=${layoutData.height}
   - Двери: ${JSON.stringify(layoutData.doors || [])}
   - Окна: ${JSON.stringify(layoutData.windows || [])}

2. Анализируй фотографии относительно этой геометрии:
   - Определи, где находится каждая стена на фото по отношению к схеме из конструктора
   - Размещай мебель строго в пределах координат помещения
   - Учитывай расположение дверей и окон при размещении мебели

3. Координаты объектов:
   - x, y должны быть в диапазоне 0.0-1.0 относительно ЭТОГО помещения
   - x=0.0 - левая стена помещения, x=1.0 - правая стена
   - y=0.0 - верхняя стена помещения, y=1.0 - нижняя стена
   - Размещай мебель так, чтобы она не блокировала двери и окна`;
    }

    return `Проанализируй фотографии помещения для создания точного 2D плана. 

ЗАДАЧА: Найди ТОЛЬКО мебель и объекты из разрешенного списка. НЕ придумывай объекты, которых нет в списке.

${furnitureInstructions}

${wallAnalysisInstructions}

ПРАВИЛА АНАЛИЗА:
1. Ищи ТОЛЬКО реальные объекты мебели, которые четко видны на фотографиях
2. НЕ обязательно находить все возможные объекты - если чего-то нет на фото, не добавляй
3. Если объект частично виден или неясен - НЕ включай его в результат
4. Размещай объекты логично относительно стен и проходов

Формат ответа (JSON):
{
  "objects": [{ "type": "тип_из_списка", "x": 0.0-1.0, "y": 0.0-1.0, "w": 0.0-1.0, "h": 0.0-1.0 }]
}

Пояснения координат:
- type — тип мебели/предмета СТРОГО из разрешенного списка выше
- x, y — позиция центра объекта (0.0-1.0 относительно помещения)
- w, h — ширина и высота объекта (0.0-1.0 относительно помещения)

Помещение: ${name}, ${sqm} м².

Верни только JSON, без дополнительного текста.`;
};


async function callOpenAI(base64Images, promptText, isRepair = false) {
    const systemPrompt = isRepair
        ? "Ты — архитектор/дизайнер. Предыдущий JSON был невалидным. Пожалуйста, верни корректный JSON ровно по заданной схеме, без какого-либо текста вокруг."
        : "Ты — архитектор/дизайнер. По фото комнаты определи только дверные и оконные проемы по границам комнаты. Мебель не анализируй. Верни только JSON по заданной схеме (doors, windows). Если проем не виден, но подразумевается — добавь один по центру.";

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
 * @param {object} [params.layoutData] - Layout data from constructor (coordinates, doors, windows).
 * @returns {Promise<z.infer<typeof RoomVisionSchema>>} The analyzed room data.
 */
export async function analyzeRoomVision({ photoBuffers, key, name, sqm, layoutData = null }) {
    const base64Images = photoBuffers.map(buffer => buffer.toString('base64'));
    const promptText = getPrompt(name, sqm, layoutData);

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

    const allowedTypes = furnitureTypes;
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

    const sanitized = {
        key,
        name,
        sqm: typeof sqm === 'string' ? Number(sqm) : sqm,
        objects: sanitizeObjects(jsonData.objects),
    };

    let validationResult = RoomVisionSchema.partial().safeParse(sanitized);


    if (validationResult.success) {
        // Ensure all required fields are present even if the model omitted them
        return {
            key,
            name,
            sqm,
            objects: validationResult.data.objects || [],
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
    };

    validationResult = RoomVisionSchema.partial().safeParse(sanitizedRepair);

    if (validationResult.success) {
        return {
            key,
            name,
            sqm,
            objects: validationResult.data.objects || [],
        };
    }

    console.error("Validation failed after repair attempt:", validationResult.error.issues);
    throw new Error("Failed to get a valid room analysis from the AI model after multiple attempts.");
}
