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
    
    // Build connection information
    const connectionInfo = roomsData.map(room => {
        if (room.connections && room.connections.length > 0) {
            const connectedNames = room.connections.map(key => 
                roomsData.find(r => r.key === key)?.name || key
            ).join(', ');
            return `${room.name} соединена с: ${connectedNames}`;
        }
        return `${room.name} - нет указанных соединений`;
    }).join('\n');
    
    return `
Создай простую схематичную планировку КВАРТИРЫ (не дома).

Данные комнат:
${roomsJsonString}

Соединения между комнатами:
${connectionInfo}

ТРЕБОВАНИЯ для планировки квартиры:
- Прихожая (hallway) — входная зона квартиры
- Используй указанные соединения для размещения комнат рядом друг с другом
- Комнаты с соединениями должны иметь общие стены или быть очень близко
- Все комнаты должны быть прямоугольными и НЕ пересекаться
- Размеры пропорциональны площади в м²
- Создай логичную квартирную планировку на основе соединений

Координаты (0-1): x,y = левый верхний угол, width,height = размеры

Верни только JSON-массив:
[
  { "key": "hallway", "x": 0.3, "y": 0.4, "width": 0.4, "height": 0.2 },
  { "key": "kitchen", "x": 0.0, "y": 0.4, "width": 0.3, "height": 0.3 },
  { "key": "room1", "x": 0.7, "y": 0.0, "width": 0.3, "height": 0.6 }
]
`;
};

/**
 * Generates a logical 2D layout for the apartment rooms using an AI model.
 * @param {any[]} analyzedRooms - Array of room data objects from the vision analysis step.
 * @returns {Promise<z.infer<typeof PlanLayoutSchema>>} A promise that resolves to the layout data.
 */
export async function generateAiLayout(analyzedRooms) {
    const prompt = getLayoutPrompt(analyzedRooms.map(({ key, name, sqm, objects, connections }) => ({ key, name, sqm, objectCount: objects.length, connections: connections || [] })));
    
    try {
        let response;
        try {
            response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini", // A smart model is needed for this logical task
                messages: [
                    { role: "system", content: "Ты — архитектор-планировщик, который создает 2D-планировки квартир в формате JSON." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            });
        } catch (jsonModeError) {
            if (jsonModeError instanceof OpenAI.APIError && jsonModeError.status === 400) {
                response = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Ты — архитектор-планировщик, который создает 2D-планировки квартир в формате JSON." },
                        { role: "user", content: prompt },
                    ],
                });
            } else {
                throw jsonModeError;
            }
        }

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
