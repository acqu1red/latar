import OpenAI from 'openai';
import { z } from 'zod';
import { parseJson } from './utils/parseJson.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RoomLayoutSchema = z.object({
  key: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const PlanLayoutSchema = z.array(RoomLayoutSchema);

const getLayoutPrompt = (roomsData) => {
    const roomsJsonString = JSON.stringify(roomsData, null, 2);
    return `
Ты — опытный архитектор-планировщик.
Твоя задача — создать логичную 2D-планировку квартиры на основе данных о комнатах.
"Прихожая" (hallway) — это входная точка квартиры. Все остальные комнаты должны быть логически с ней связаны.

Вот данные о комнатах в формате JSON:
${roomsJsonString}

Проанализируй эти данные и верни JSON-массив с расположением и размерами каждой комнаты на общем холсте.
Координаты и размеры должны быть нормализованы (от 0 до 1).
- x, y: координаты верхнего левого угла комнаты.
- width, height: ширина и высота комнаты.
- Прямоугольники комнат не должны пересекаться.
- Сумма площадей комнат (width * height) должна примерно соответствовать изначальному распределению площадей по м².

Верни только JSON-массив, без какого-либо текста или комментариев.
Пример формата ответа:
[
  { "key": "hallway", "x": 0.4, "y": 0.6, "width": 0.2, "height": 0.2 },
  { "key": "kitchen", "x": 0.4, "y": 0.4, "width": 0.2, "height": 0.2 },
  { "key": "room1", "x": 0.0, "y": 0.0, "width": 0.4, "height": 1.0 }
]
`;
};

/**
 * Generates a logical 2D layout for the apartment rooms using an AI model.
 * @param {any[]} analyzedRooms - Array of room data objects from the vision analysis step.
 * @returns {Promise<z.infer<typeof PlanLayoutSchema>>} A promise that resolves to the layout data.
 */
export async function generateAiLayout(analyzedRooms) {
    const prompt = getLayoutPrompt(analyzedRooms.map(({ key, name, sqm, objects }) => ({ key, name, sqm, objectCount: objects.length })));
    
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini", // A smart model is needed for this logical task
            messages: [
                {
                    role: "system",
                    content: "Ты — архитектор-планировщик, который создает 2D-планировки квартир в формате JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            // response_format: { type: "json_object" },
        });

        const responseText = response.choices[0].message.content;
        const jsonData = parseJson(responseText);

        if (!jsonData) {
            throw new Error("AI layout model did not return valid JSON.");
        }

        const validationResult = PlanLayoutSchema.safeParse(jsonData);

        if (!validationResult.success) {
            console.error("AI layout validation failed:", validationResult.error);
            // Optionally, add a repair prompt here as well
            throw new Error("AI-generated layout failed Zod validation.");
        }

        return validationResult.data;
    } catch (error) {
        console.error("Error generating AI layout:", error);
        throw new Error("Failed to generate apartment layout from AI.");
    }
}
