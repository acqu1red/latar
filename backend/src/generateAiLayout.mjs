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

/**
 * Deterministic fallback layout generator when AI JSON is unavailable.
 * Produces a simple, non-overlapping rectangular tiling normalized to 0..1.
 * - If присутствует `hallway`, выделяет вертикальный коридор слева
 * - Остальные комнаты распределяются по строкам пропорционально площадям
 */
function generateFallbackLayout(rooms) {
    if (!Array.isArray(rooms) || rooms.length === 0) return [];

    // Normalize sqm and split hallway
    const minArea = 1;
    const normalizedRooms = rooms.map(r => ({
        key: r.key,
        name: r.name,
        sqm: Number.isFinite(r.sqm) && r.sqm > 0 ? r.sqm : minArea,
        connections: Array.isArray(r.connections) ? r.connections : [],
    }));

    const hallway = normalizedRooms.find(r => r.key === 'hallway');
    const others = normalizedRooms.filter(r => r.key !== 'hallway');

    const totalSqm = normalizedRooms.reduce((s, r) => s + r.sqm, 0) || 1;
    let xOffset = 0;
    let layout = [];

    // Allocate a vertical corridor if hallway exists
    let corridorWidth = 0;
    if (hallway) {
        // Use a bounded strip width influenced by hallway area
        const target = hallway.sqm / totalSqm;
        corridorWidth = Math.min(0.25, Math.max(0.12, target * 0.6));
        layout.push({ key: hallway.key, x: 0, y: 0, width: corridorWidth, height: 1 });
        xOffset = corridorWidth;
    }

    if (others.length === 0) return layout;

    // Prefer rooms connected к hallway в верхних рядах
    const connectedToHall = new Set((hallway?.connections || []).map(String));
    const orderedRooms = [...others].sort((a, b) => {
        const ah = connectedToHall.has(a.key) ? 0 : 1;
        const bh = connectedToHall.has(b.key) ? 0 : 1;
        if (ah !== bh) return ah - bh;
        return b.sqm - a.sqm; // larger first
    });

    const restWidth = 1 - xOffset;
    const restHeight = 1;
    const n = orderedRooms.length;
    const cols = Math.max(1, Math.ceil(Math.sqrt(n))); // square-ish grid
    const rows = Math.max(1, Math.ceil(n / cols));

    // Split rooms into rows
    const rowsArr = Array.from({ length: rows }, (_, i) => orderedRooms.slice(i * cols, (i + 1) * cols));
    const restTotal = orderedRooms.reduce((s, r) => s + r.sqm, 0) || 1;

    let y = 0;
    for (const rowRooms of rowsArr) {
        const rowSqm = rowRooms.reduce((s, r) => s + r.sqm, 0) || 1;
        const rowHeight = (rowSqm / restTotal) * restHeight;

        let x = xOffset;
        for (const room of rowRooms) {
            const w = (room.sqm / rowSqm) * restWidth;
            layout.push({ key: room.key, x, y, width: w, height: rowHeight });
            x += w;
        }
        y += rowHeight;
    }

    // Clamp values to [0,1]
    layout = layout.map(r => ({
        key: r.key,
        x: Math.min(1, Math.max(0, r.x)),
        y: Math.min(1, Math.max(0, r.y)),
        width: Math.min(1, Math.max(0, r.width)),
        height: Math.min(1, Math.max(0, r.height)),
    }));

    return layout;
}

const getLayoutPrompt = (roomsData) => {
    const roomsJsonString = JSON.stringify(roomsData, null, 2);
    
    return `
Создай простую схематичную планировку КВАРТИРЫ (не дома).

Данные комнат:
${roomsJsonString}

ТРЕБОВАНИЯ для планировки квартиры:
- Прихожая (hallway) — входная зона квартиры
- Все комнаты должны быть прямоугольными и НЕ пересекаться
- Размеры пропорциональны площади в м²
- Создай логичную квартирную планировку

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
    // Если пользователь уже задал раскладку (layout), отдаем её сразу
    const hasUserLayout = Array.isArray(analyzedRooms) && analyzedRooms.every(r => r && r.x != null && r.y != null && r.width != null && r.height != null);
    if (hasUserLayout) {
        // Пользовательский layout уже в 0..1 — просто провалидируем
        const projected = analyzedRooms.map(r => ({ key: r.key, x: r.x, y: r.y, width: r.width, height: r.height }));
        const validation = PlanLayoutSchema.safeParse(projected);
        if (validation.success) return validation.data;
    }

    const prompt = getLayoutPrompt(analyzedRooms.map(({ key, name, sqm, objects, connections }) => ({ key, name, sqm, objectCount: (objects || []).length, connections: connections || [] })));
    
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
        console.error("Error generating AI layout, using deterministic fallback:", error);
        const fallback = generateFallbackLayout(analyzedRooms || []);
        const validation = PlanLayoutSchema.safeParse(fallback);
        if (validation.success) {
            return validation.data;
        }
        // If even fallback fails, surface original message
        throw new Error("Failed to generate apartment layout from AI and fallback algorithm.");
    }
}
