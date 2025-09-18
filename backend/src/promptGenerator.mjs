/**
 * Генератор промптов для ScribbleDiffusion
 * Создает специализированные промпты для разных типов генерации
 */

/**
 * Базовые промпты для разных типов генерации
 */
const BASE_PROMPTS = {
  // План без мебели - точная копия с центрированием
  planOnly: "professional architectural floor plan, clean white background, black lines, perfectly centered layout, technical drawing style, precise measurements, no furniture, minimalist design, high contrast, detailed room layout, architectural blueprint, floor plan drawing, clean lines, professional CAD drawing style, exact replica of the uploaded plan, centered composition, symmetrical layout",
  
  // План с мебелью - добавляем схематичную мебель
  planWithFurniture: "professional architectural floor plan with furniture, clean white background, black lines, perfectly centered layout, technical drawing style, precise measurements, schematic furniture symbols, high contrast, detailed room layout with furniture placement, architectural blueprint, floor plan drawing, clean lines, professional CAD drawing style, exact replica of the uploaded plan with added furniture, centered composition, furniture symbols in appropriate rooms"
};

/**
 * Специфичные промпты для разных типов помещений
 */
const ROOM_SPECIFIC_PROMPTS = {
  bedroom: {
    furniture: "bed, nightstand, dresser, wardrobe, mirror, chair",
    description: "bedroom furniture, sleeping area, storage furniture"
  },
  livingRoom: {
    furniture: "sofa, armchair, coffee table, TV stand, bookshelf, lamp",
    description: "living room furniture, seating area, entertainment center"
  },
  kitchen: {
    furniture: "refrigerator, stove, sink, kitchen cabinets, microwave, dishwasher",
    description: "kitchen appliances, cooking area, food storage"
  },
  bathroom: {
    furniture: "bathtub, shower, toilet, sink, mirror, towel rack",
    description: "bathroom fixtures, hygiene area, water fixtures"
  },
  diningRoom: {
    furniture: "dining table, chairs, sideboard, chandelier",
    description: "dining furniture, eating area, formal seating"
  },
  office: {
    furniture: "desk, office chair, bookshelf, computer, printer, filing cabinet",
    description: "office furniture, workspace, professional equipment"
  },
  hallway: {
    furniture: "console table, mirror, coat rack, shoe cabinet",
    description: "hallway furniture, entry area, storage solutions"
  }
};

/**
 * Генерирует промпт для плана без мебели
 * @returns {string} Промпт для генерации
 */
export function generatePlanOnlyPrompt() {
  return BASE_PROMPTS.planOnly;
}

/**
 * Генерирует промпт для плана с мебелью
 * @param {string} roomType - Тип помещения (опционально)
 * @returns {string} Промпт для генерации
 */
export function generatePlanWithFurniturePrompt(roomType = null) {
  let prompt = BASE_PROMPTS.planWithFurniture;
  
  if (roomType && ROOM_SPECIFIC_PROMPTS[roomType]) {
    const roomData = ROOM_SPECIFIC_PROMPTS[roomType];
    prompt += `, ${roomData.furniture}, ${roomData.description}`;
  } else {
    // Универсальный набор мебели для всех помещений
    prompt += ", bed, sofa, table, chair, wardrobe, kitchen appliances, bathroom fixtures, living room furniture, bedroom furniture, dining room furniture, office furniture, hallway furniture";
  }
  
  return prompt;
}

/**
 * Анализирует изображение и определяет тип помещения
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<string|null>} Тип помещения или null
 */
export async function analyzeRoomType(imagePath) {
  try {
    // Простой анализ на основе ключевых слов в изображении
    // В будущем можно улучшить с помощью компьютерного зрения
    
    // Пока возвращаем null для универсального подхода
    return null;
  } catch (error) {
    console.error('Ошибка анализа типа помещения:', error);
    return null;
  }
}

/**
 * Генерирует улучшенный промпт с учетом центрирования
 * @param {string} basePrompt - Базовый промпт
 * @returns {string} Улучшенный промпт
 */
export function enhancePromptForCentering(basePrompt) {
  return `${basePrompt}, perfectly centered on canvas, symmetrical composition, balanced layout, professional architectural standards, clean white background, high resolution, detailed technical drawing`;
}
