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

const getLayoutPrompt = (roomsData, connectionMap) => {
    const roomsJsonString = JSON.stringify(roomsData, null, 2);
    const connectionsJsonString = JSON.stringify(connectionMap, null, 2);
    return `
ТЫ — ПРОГРАММА ДЛЯ МАТЕМАТИЧЕСКОГО РАСЧЕТА ПЛАНИРОВКИ.
Твоя задача — строго на основе входных данных создать JSON с координатами комнат.

**СТРОГИЕ ВХОДНЫЕ ДАННЫЕ:**

1.  **ИНФОРМАЦИЯ О КОМНАТАХ:**
    ${roomsJsonString}

2.  **КАРТА СОЕДИНЕНИЙ (ЖЕСТКОЕ ПРАВИЛО):**
    ${connectionsJsonString}

**ПРАВИЛА ВЫПОЛНЕНИЯ:**

1.  **СОБЛЮДАЙ СВЯЗИ:** Расположи комнаты так, чтобы смежные стены комнат из "КАРТЫ СОЕДИНЕНИЙ" соприкасались. Двери должны "встречаться".
2.  **СОБЛЮДАЙ ПРОПОРЦИИ:** Площадь каждого прямоугольника ('width * height') должна быть пропорциональна значению 'sqm' комнаты.
3.  **НЕТ ПЕРЕСЕЧЕНИЯМ:** Прямоугольники комнат не должны пересекаться или накладываться друг на друга.
4.  **КОМПАКТНОСТЬ:** Постарайся расположить комнаты максимально компактно, чтобы получился единый план квартиры.
5.  **ПРИХОЖАЯ ("hallway"):** Это точка входа.

**ФОРМАТ ВЫХОДА:**
Верни ТОЛЬКО JSON-массив с координатами и размерами каждой комнаты. Координаты и размеры нормализованы (от 0 до 1).

Пример формата ответа:
[
  { "key": "hallway", "x": 0.4, "y": 0.5, "width": 0.2, "height": 0.3 },
  { "key": "kitchen", "x": 0.4, "y": 0.3, "width": 0.2, "height": 0.2 },
  { "key": "room1", "x": 0.0, "y": 0.0, "width": 0.4, "height": 1.0 }
]
`;
};

/**
 * Generates a logical 2D layout for the apartment rooms using an AI model.
 * @param {any[]} analyzedRooms - Array of room data objects from the vision analysis step.
 * @param {any[]} connectionMap - The map of connections between rooms.
 * @returns {Promise<z.infer<typeof PlanLayoutSchema>>} A promise that resolves to the layout data.
 */
export async function generateAiLayout(analyzedRooms, connectionMap) {
    const prompt = getLayoutPrompt(analyzedRooms.map(({ key, name, sqm }) => ({ key, name, sqm })), connectionMap);
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5-mini", // Using a more powerful model for this complex spatial reasoning task
            messages: [
                {
                    role: "system",
                    content: "Ты — программа, которая преобразует данные о комнатах и их связях в JSON с координатами для 2D-плана.",
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
