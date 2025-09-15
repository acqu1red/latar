import OpenAI from 'openai';
import { z } from 'zod';
import { parseJson } from './utils/parseJson.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key-for-testing',
});

// Zod Schemas for validation
const RoomObjectType = z.enum([
  "bed", "sofa", "chair", "table", "wardrobe",
  "stove", "fridge", "sink", "toilet",
  "bathtub", "shower", "washing_machine", "kitchen_block",
  "tv", "bookshelf", "desk", "dresser", "nightstand", "coffee_table", 
  "dining_table", "office_chair", "armchair", "ottoman", "mirror", 
  "lamp", "plant", "artwork", "rug", "curtains", "blinds"
]);

const RoomObjectSchema = z.object({
  type: RoomObjectType,
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  rotation: z.number().min(0).max(360).optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Новая схема для детального анализа комнаты
const WallPointSchema = z.object({
  x: z.number().min(0).max(1), // относительная позиция на стене (0-1)
  y: z.number().min(0).max(1), // относительная позиция на стене (0-1)
});

const WallSchema = z.object({
  side: z.enum(['left', 'right', 'top', 'bottom']),
  startPoint: WallPointSchema,
  endPoint: WallPointSchema,
  material: z.string().optional(),
  thickness: z.number().positive().optional(),
  hasWindow: z.boolean(),
  windowPosition: z.number().min(0).max(1).optional(), // позиция окна на стене (0-1)
  windowLength: z.number().min(0).max(1).optional(), // длина окна относительно стены (0-1)
  windowType: z.string().optional(),
  hasDoor: z.boolean(),
  doorPosition: z.number().min(0).max(1).optional(), // позиция двери на стене (0-1)
  doorLength: z.number().min(0).max(1).optional(), // длина двери относительно стены (0-1)
  doorType: z.string().optional(),
  doorMaterial: z.string().optional(),
  connectedRoom: z.string().optional(), // ключ комнаты, к которой ведет дверь
});

const RoomShapeSchema = z.object({
  type: z.enum(['rectangle', 'l_shape', 'u_shape', 'irregular', 'pentagon', 'hexagon', 'oval']),
  corners: z.array(WallPointSchema).min(3), // контрольные точки формы комнаты
  mainDimensions: z.object({
    width: z.number().positive(), // ширина в метрах
    height: z.number().positive(), // высота в метрах
  }),
  ceilingHeight: z.number().positive().optional(),
  floorType: z.string().optional(),
});

const ElectricalSchema = z.object({
  type: z.enum(['outlet', 'switch', 'light', 'fan', 'ac_unit']),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  height: z.number().positive().optional(),
  description: z.string().optional(),
});

const LightingSchema = z.object({
  type: z.enum(['ceiling', 'wall', 'table', 'floor', 'pendant', 'recessed', 'track', 'chandelier']),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  height: z.number().positive().optional(),
  style: z.string().optional(),
});

const SpecialFeatureSchema = z.object({
  type: z.enum(['fireplace', 'balcony', 'bay_window', 'skylight', 'built_in', 'niche', 'column', 'arch', 'staircase']),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  description: z.string().optional(),
});

export const DetailedRoomVisionSchema = z.object({
  key: z.string(),
  name: z.string(),
  sqm: z.number(),
  shape: RoomShapeSchema,
  walls: z.array(WallSchema),
  objects: z.array(RoomObjectSchema),
  electrical: z.array(ElectricalSchema).optional(),
  lighting: z.array(LightingSchema).optional(),
  specialFeatures: z.array(SpecialFeatureSchema).optional(),
  roomConnections: z.array(z.string()).optional(), // ключи комнат, с которыми соединена данная комната
});

// Старая схема для обратной совместимости
export const RoomVisionSchema = z.object({
  key: z.string(),
  name: z.string(),
  sqm: z.number(),
  objects: z.array(RoomObjectSchema),
});

const getDetailedPrompt = (name, sqm, availableRooms = []) => {
    const roomList = availableRooms.map(r => `${r.key}: ${r.name}`).join(', ');
    
    return `Ты - эксперт-архитектор с 20-летним опытом. Проанализируй фотографию комнаты для создания МАКСИМАЛЬНО ДЕТАЛЬНОГО 2D плана квартиры. 

ТВОЯ ЗАДАЧА: Определить ВСЕ аспекты помещения с максимальной точностью:
- Точную форму и геометрию комнаты
- Реальные размеры на основе площади ${sqm} м²
- Все стены с точными координатами
- Все окна с позицией, размером и типом
- Все двери с типом и соединениями
- Всю мебель и предметы интерьера
- Электрические розетки и выключатели
- Освещение и светильники
- Отделочные материалы стен
- Напольные покрытия
- Высоту потолков
- Вентиляцию и кондиционирование

КРИТИЧЕСКИ ВАЖНО: 
- Анализируй КАЖДУЮ деталь на фотографии
- Учитывай перспективу и искажения
- Рассчитывай точные пропорции
- Определяй материалы и текстуры
- Замечай все функциональные элементы

Формат ответа (JSON):
{
  "shape": {
    "type": "rectangle|l_shape|u_shape|irregular|pentagon|hexagon|oval",
    "corners": [{"x": 0.0-1.0, "y": 0.0-1.0}], // ТОЧНЫЕ контрольные точки формы
    "mainDimensions": {
      "width": число_в_метрах, // ТОЧНАЯ ширина комнаты
      "height": число_в_метрах  // ТОЧНАЯ высота комнаты
    },
    "ceilingHeight": число_в_метрах, // высота потолка
    "floorType": "parquet|tile|carpet|laminate|concrete|marble|wood"
  },
  "walls": [
    {
      "side": "left|right|top|bottom",
      "startPoint": {"x": 0.0-1.0, "y": 0.0-1.0},
      "endPoint": {"x": 0.0-1.0, "y": 0.0-1.0},
      "material": "brick|concrete|drywall|wood|glass|stone",
      "thickness": число_в_метрах,
      "hasWindow": true/false,
      "windowPosition": 0.0-1.0, // ТОЧНАЯ позиция окна
      "windowLength": 0.0-1.0,   // ТОЧНАЯ длина окна
      "windowType": "single|double|triple|sliding|french|bay",
      "hasDoor": true/false,
      "doorPosition": 0.0-1.0,   // ТОЧНАЯ позиция двери
      "doorLength": 0.0-1.0,     // ТОЧНАЯ длина двери
      "doorType": "entrance|interior|sliding|folding|glass",
      "doorMaterial": "wood|glass|metal|composite",
      "connectedRoom": "ключ_комнаты"  // если есть дверь
    }
  ],
  "objects": [
    {
      "type": "bed|sofa|chair|table|wardrobe|stove|fridge|sink|toilet|bathtub|shower|washing_machine|kitchen_block|tv|bookshelf|desk|dresser|nightstand|coffee_table|dining_table|office_chair|armchair|ottoman|mirror|lamp|plant|artwork|rug|curtains|blinds",
      "x": 0.0-1.0, "y": 0.0-1.0, "w": 0.0-1.0, "h": 0.0-1.0,
      "rotation": 0-360, // угол поворота в градусах
      "material": "wood|metal|glass|fabric|leather|plastic|stone",
      "color": "описание_цвета",
      "style": "modern|classic|vintage|industrial|minimalist|rustic"
    }
  ],
  "electrical": [
    {
      "type": "outlet|switch|light|fan|ac_unit",
      "x": 0.0-1.0, "y": 0.0-1.0,
      "height": число_в_метрах, // высота от пола
      "description": "описание"
    }
  ],
  "lighting": [
    {
      "type": "ceiling|wall|table|floor|pendant|recessed|track|chandelier",
      "x": 0.0-1.0, "y": 0.0-1.0,
      "height": число_в_метрах,
      "style": "modern|classic|industrial|minimalist"
    }
  ],
  "roomConnections": ["ключ1", "ключ2"], // ключи комнат, с которыми соединена данная комната
  "specialFeatures": [
    {
      "type": "fireplace|balcony|bay_window|skylight|built_in|niche|column|arch|staircase",
      "x": 0.0-1.0, "y": 0.0-1.0, "w": 0.0-1.0, "h": 0.0-1.0,
      "description": "описание"
    }
  ]
}

ПРАВИЛА МАКСИМАЛЬНО ДЕТАЛЬНОГО АНАЛИЗА:
1. ФОРМА: Определи ТОЧНУЮ форму комнаты, включая все углы, выступы, ниши
2. РАЗМЕРЫ: Рассчитай РЕАЛЬНЫЕ размеры на основе площади ${sqm} м² с учетом формы
3. СТЕНЫ: Определи ВСЕ стены с точными координатами, материалом, толщиной
4. ОКНА: Найди ВСЕ окна с точной позицией, размером, типом, материалом
5. ДВЕРИ: Найди ВСЕ двери с типом, материалом, точными размерами
6. МЕБЕЛЬ: Определи ВСЮ мебель с позицией, размером, материалом, стилем
7. ЭЛЕКТРИКА: Найди розетки, выключатели, светильники
8. ОСВЕЩЕНИЕ: Определи все источники света и их расположение
9. ОТДЕЛКА: Определи материалы стен, пола, потолка
10. ОСОБЕННОСТИ: Найди камины, балконы, ниши, колонны и другие элементы

Доступные комнаты для соединений: ${roomList}

Комната: ${name}, ${sqm} м². Верни ТОЛЬКО JSON без дополнительного текста.`;
};

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

    return `Проанализируй фото комнаты для создания 2D плана квартиры. Твоя задача — определить только мебель и предметы интерьера. Окна и двери НЕ анализируй и НЕ возвращай.

Формат ответа (JSON):
{
  "objects": [{ "type": "bed|sofa|chair|table|wardrobe|stove|fridge|sink|toilet|bathtub|shower|washing_machine|kitchen_block", "x": 0.0-1.0, "y": 0.0-1.0, "w": 0.0-1.0, "h": 0.0-1.0 }]
}

Пояснения:
- type — тип мебели/предмета
- x, y — позиция левого верхнего угла (0-1)
- w, h — ширина и высота (0-1)

${roomSpecificInstructions}

Верни только JSON. Комната: ${name}, ${sqm} м².`;
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
 * Analyzes a room photo using OpenAI's Vision model with detailed analysis.
 *
 * @param {object} params
 * @param {Buffer[]} params.photoBuffers - The buffers of the photos to analyze.
 * @param {string} params.key - The unique key for the room.
 * @param {string} params.name - The name of the room.
 * @param {number} params.sqm - The square meters of the room.
 * @param {Array} params.availableRooms - Available rooms for connections.
 * @returns {Promise<z.infer<typeof DetailedRoomVisionSchema>>} The analyzed room data.
 */
export async function analyzeDetailedRoomVision({ photoBuffers, key, name, sqm, availableRooms = [] }) {
    const base64Images = photoBuffers.map(buffer => buffer.toString('base64'));
    const promptText = getDetailedPrompt(name, sqm, availableRooms);

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

    const sanitizeWallPoint = (point) => {
        if (!point || typeof point !== 'object') return null;
        const x = sanitizeNumber01(point.x);
        const y = sanitizeNumber01(point.y);
        if (x === null || y === null) return null;
        return { x, y };
    };

    const sanitizeWall = (wall) => {
        if (!wall || typeof wall !== 'object') return null;
        const startPoint = sanitizeWallPoint(wall.startPoint);
        const endPoint = sanitizeWallPoint(wall.endPoint);
        if (!startPoint || !endPoint) return null;

        return {
            side: wall.side,
            startPoint,
            endPoint,
            hasWindow: Boolean(wall.hasWindow),
            windowPosition: wall.hasWindow ? sanitizeNumber01(wall.windowPosition) : undefined,
            windowLength: wall.hasWindow ? sanitizeNumber01(wall.windowLength) : undefined,
            hasDoor: Boolean(wall.hasDoor),
            doorPosition: wall.hasDoor ? sanitizeNumber01(wall.doorPosition) : undefined,
            doorLength: wall.hasDoor ? sanitizeNumber01(wall.doorLength) : undefined,
            doorType: wall.hasDoor ? wall.doorType : undefined,
            connectedRoom: wall.hasDoor ? wall.connectedRoom : undefined,
        };
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

    const sanitizeShape = (shape) => {
        if (!shape || typeof shape !== 'object') return null;
        const corners = Array.isArray(shape.corners) ? shape.corners.map(sanitizeWallPoint).filter(Boolean) : [];
        if (corners.length < 3) return null;

        const mainDimensions = shape.mainDimensions || {};
        const width = typeof mainDimensions.width === 'number' ? Math.max(0.1, mainDimensions.width) : 1;
        const height = typeof mainDimensions.height === 'number' ? Math.max(0.1, mainDimensions.height) : 1;

        return {
            type: shape.type || 'rectangle',
            corners,
            mainDimensions: { width, height }
        };
    };

    const sanitizeElectrical = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => ({
            type: item.type || 'outlet',
            x: sanitizeNumber01(item.x) || 0,
            y: sanitizeNumber01(item.y) || 0,
            height: typeof item.height === 'number' ? Math.max(0.1, item.height) : 1.2,
            description: item.description || ''
        })).filter(Boolean);
    };

    const sanitizeLighting = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => ({
            type: item.type || 'ceiling',
            x: sanitizeNumber01(item.x) || 0,
            y: sanitizeNumber01(item.y) || 0,
            height: typeof item.height === 'number' ? Math.max(0.1, item.height) : 2.5,
            style: item.style || 'modern'
        })).filter(Boolean);
    };

    const sanitizeSpecialFeatures = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => ({
            type: item.type || 'built_in',
            x: sanitizeNumber01(item.x) || 0,
            y: sanitizeNumber01(item.y) || 0,
            w: sanitizeNumber01(item.w) || 0.1,
            h: sanitizeNumber01(item.h) || 0.1,
            description: item.description || ''
        })).filter(Boolean);
    };

    const sanitized = {
        key,
        name,
        sqm: typeof sqm === 'string' ? Number(sqm) : sqm,
        shape: sanitizeShape(jsonData.shape),
        walls: Array.isArray(jsonData.walls) ? jsonData.walls.map(sanitizeWall).filter(Boolean) : [],
        objects: sanitizeObjects(jsonData.objects),
        electrical: sanitizeElectrical(jsonData.electrical),
        lighting: sanitizeLighting(jsonData.lighting),
        specialFeatures: sanitizeSpecialFeatures(jsonData.specialFeatures),
        roomConnections: Array.isArray(jsonData.roomConnections) ? jsonData.roomConnections.filter(r => typeof r === 'string') : [],
    };

    let validationResult = DetailedRoomVisionSchema.partial().safeParse(sanitized);

    if (validationResult.success) {
        return {
            key,
            name,
            sqm,
            shape: validationResult.data.shape || { type: 'rectangle', corners: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}], mainDimensions: { width: Math.sqrt(sqm), height: Math.sqrt(sqm) }},
            walls: validationResult.data.walls || [],
            objects: validationResult.data.objects || [],
            electrical: validationResult.data.electrical || [],
            lighting: validationResult.data.lighting || [],
            specialFeatures: validationResult.data.specialFeatures || [],
            roomConnections: validationResult.data.roomConnections || [],
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
        shape: sanitizeShape(jsonData.shape),
        walls: Array.isArray(jsonData.walls) ? jsonData.walls.map(sanitizeWall).filter(Boolean) : [],
        objects: sanitizeObjects(jsonData.objects),
        electrical: sanitizeElectrical(jsonData.electrical),
        lighting: sanitizeLighting(jsonData.lighting),
        specialFeatures: sanitizeSpecialFeatures(jsonData.specialFeatures),
        roomConnections: Array.isArray(jsonData.roomConnections) ? jsonData.roomConnections.filter(r => typeof r === 'string') : [],
    };

    validationResult = DetailedRoomVisionSchema.partial().safeParse(sanitizedRepair);

    if (validationResult.success) {
        return {
            key,
            name,
            sqm,
            shape: validationResult.data.shape || { type: 'rectangle', corners: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}], mainDimensions: { width: Math.sqrt(sqm), height: Math.sqrt(sqm) }},
            walls: validationResult.data.walls || [],
            objects: validationResult.data.objects || [],
            electrical: validationResult.data.electrical || [],
            lighting: validationResult.data.lighting || [],
            specialFeatures: validationResult.data.specialFeatures || [],
            roomConnections: validationResult.data.roomConnections || [],
        };
    }

    console.error("Validation failed after repair attempt:", validationResult.error.issues);
    throw new Error("Failed to get a valid detailed room analysis from the AI model after multiple attempts.");
}

/**
 * Analyzes a room photo using OpenAI's Vision model (legacy function for backward compatibility).
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
