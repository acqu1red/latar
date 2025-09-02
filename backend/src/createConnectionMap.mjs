import OpenAI from 'openai';
import { z } from 'zod';
import { parseJson } from './utils/parseJson.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ConnectionSchema = z.object({
  roomA: z.string(),
  roomB: z.string(),
});

export const ConnectionMapSchema = z.array(ConnectionSchema);

const getConnectionPrompt = (roomsData) => {
    const roomsJsonString = JSON.stringify(roomsData, null, 2);
    return `
Ты — AI-аналитик, специализирующийся на топологии помещений.
Твоя задача — определить, какие комнаты соединены друг с другом на основе расположения их дверей.

Вот данные о комнатах и их дверях в формате JSON:
${roomsJsonString}

Проанализируй эти данные. Учти, что дверь у стены "left" в одной комнате может соединяться с дверью у стены "right" в другой.
"Прихожая" (hallway) — это центральный узел.

Верни JSON-массив, описывающий пары соединенных комнат.
- Каждая пара должна быть представлена как объект { "roomA": "key1", "roomB": "key2" }.
- Не создавай цикличных или нелогичных связей.

Верни только JSON-массив, без какого-либо текста или комментариев.
Пример формата ответа:
[
  { "roomA": "hallway", "roomB": "kitchen" },
  { "roomA": "hallway", "roomB": "room1" },
  { "roomA": "room1", "roomB": "balcony" }
]
`;
};

/**
 * Analyzes room data to determine which rooms are connected by doors.
 * @param {any[]} analyzedRooms - Array of room data objects from the vision analysis step.
 * @returns {Promise<z.infer<typeof ConnectionMapSchema>>} A promise that resolves to the connection map.
 */
export async function createConnectionMap(analyzedRooms) {
    const roomsWithDoors = analyzedRooms.map(({ key, name, doors }) => ({ key, name, doors: doors || [] }));
    const prompt = getConnectionPrompt(roomsWithDoors);
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // A smart but fast model is sufficient for this
            messages: [
                {
                    role: "system",
                    content: "Ты — AI-аналитик, который определяет связи между комнатами по их дверям и возвращает JSON.",
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
            throw new Error("AI connection analysis did not return valid JSON.");
        }

        const validationResult = ConnectionMapSchema.safeParse(jsonData);

        if (!validationResult.success) {
            console.error("AI connection map validation failed:", validationResult.error);
            throw new Error("AI-generated connection map failed Zod validation.");
        }

        return validationResult.data;
    } catch (error) {
        console.error("Error creating connection map:", error);
        throw new Error("Failed to create connection map from AI.");
    }
}
