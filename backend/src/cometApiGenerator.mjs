import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Промпты для разных режимов
const PROMPTS = {
  withoutFurniture: `You are a professional architectural draftsman, and people's lives depend on your work. Redraw this 2D apartment floor plan into a high-quality technical drawing, accurately preserving all proportions, layout, and room dimensions.

INPUT NORMALIZATION — STRAIGHTEN & RECTIFY (REQUIRED):
• If the source photo/scan is rotated, skewed, or shot at an angle, FIRST correct it:
  – Rotate to the nearest cardinal angle (0°, 90°, 180°, 270°) so any text reads upright.
  – Deskew so horizontal/vertical walls are exactly horizontal/vertical (orthogonal grid).
  – Apply perspective rectification to rebuild a clean orthographic, top-down plan (no foreshortening).
• Preserve relative proportions while rectifying; do not invent or move openings/walls.
• Remove background, shadows and paper edges; redraw as a clean vector-like plan.

CANVAS FIT — UNIFORM SCALE & MARGINS (STRICT):
• After rectification, CENTER the entire plan as a single unit.
• UNIFORMLY SCALE (isotropic) the plan to be as large as possible while keeping a HARD MINIMUM MARGIN of ≥50px from the nearest geometry (any line, hatch, or text) to each image edge.
• If necessary, slightly increase or decrease overall scale to satisfy the ≥50px margin on ALL sides and keep all text fully inside rooms.
• Do NOT crop any part of the plan. Do NOT stretch non-uniformly. Maintain aspect ratio.
• HARD RULE: No line, hatch, or text may touch or cross the image boundary.

STRUCTURAL ELEMENTS:

External load-bearing walls: thickness 4-5px, black fill
Internal load-bearing walls: thickness 3px, black fill
Partitions: thickness 2px, black fill
Doors: show opening arc (1px dashed line) + shortened door leaf
Windows: double frame 2px + diagonal hatching of glass at 45°
Balconies/loggias: determine from context (protruding elements, glazing, railings)

VISUAL STYLE:

Background: pure white (#FFFFFF)
Lines and fills: pure black (#000000)
No shadows, gradients, or gray tones
Size: 1200x1200px, JPG quality 95%

FURNITURE AND EQUIPMENT:

DRAW ONLY the furniture and sanitary fixtures that are explicitly visible in the provided source image. DO NOT add, infer, or complete any furniture that is not clearly shown.
Do NOT add beds, sofas, tables, chairs, kitchen units, wardrobes, or any other items unless they are explicitly present in the source image.
If uncertain whether an item exists, leave the room empty.
Preserve all existing furniture as simple geometric shapes
Furniture proportions must correspond to real dimensions
Furniture line thickness: 1px

TEXT AND LABELS:

Only room areas in format "12.3 m²"
Font: Arial, size 12px, black color
Place in center of rooms

COMPOSITION:

Plan centered in image
Margins from edges minimum 50px
No borders, titles, or dimension lines`,

  withFurniture: `You are a professional architectural draftsman, and people's lives depend on your work.
Redraw this 2D apartment floor plan into a high-quality technical drawing, accurately preserving
all proportions, layout, and room dimensions. Do NOT change the layout or positions of walls,
doors, windows, plumbing, or any items already drawn in the source image.
INPUT NORMALIZATION — STRAIGHTEN & RECTIFY (REQUIRED):
• If the source photo/scan is rotated, skewed, or shot at an angle, FIRST correct it:
– Rotate to the nearest cardinal angle (0°, 90°, 180°, 270°) so any text reads upright.
– Deskew so horizontal/vertical walls are exactly horizontal/vertical (orthogonal grid).
– Apply perspective rectification to rebuild a clean orthographic, top-down plan (no
foreshortening).
• Preserve relative proportions while rectifying; do not invent or move openings/walls.
• Remove background, shadows and paper edges; redraw as a clean vector-like plan.
STRUCTURAL ELEMENTS:
External load-bearing walls: thickness 4–5px, black fill
Internal load-bearing walls: thickness 3px, black fill
Partitions: thickness 2px, black fill
Doors: show opening arc (1px dashed line) + shortened door leaf; respect swing
clearances
Windows: double frame 2px + diagonal hatching of glass at 45°
Balconies/loggias: detect from context (protrusions, glazing, rails)
VISUAL STYLE:
Background: pure white (#FFFFFF)
Lines and fills: pure black (#000000)
No shadows, gradients, or gray tones
Canvas size: 1200×1200px, JPG quality 95%
FURNITURE POLICY — PRESERVE + COMPLETE (MANDATORY &
DIVERSITY):
1) Preserve ALL existing furniture/sanitary fixtures exactly as in the source image.
2) THEN add missing furniture so each room is functional and visually complete.
3) MANDATORY: Every enclosed room (including hallways, corridors, walk-in closets,
storage/pantry, utility, WC, bathrooms) must contain at least the minimum set listed below for its
type.
4) DIVERSITY: Each furnished room must include at least TWO different furniture
categories (e.g., seating + storage; sleeping + storage; work + storage).
5) QUANTITY: Prefer more (but sensible) furniture. After placing the minimum set, add
optional items until any of these limits would be violated:
• main walkway width < 80 cm, or
• door/window swing/clearances blocked, or
• furniture footprint would exceed ~35% of the room area (soft cap).
6) SCALE/STYLE: Use simple 2D icons with realistic proportions; align to walls;
Furniture line thickness: 1px.
ROOM-BY -ROOM MINIMUMS (add OPTIONAL items if space allows):
• Entry / Hallway (MIN 2): wardrobe/closet (D≈60 cm) + bench/console/shoe cabinet.
OPTIONAL: mirror panel, coat rack.
• Corridor (MIN 1): narrow console/shelf (D≤30 cm).
OPTIONAL: wall-mounted storage, mirror panel.
• Living Room (MIN 3): sofa (W≈180–240 cm) + coffee table + media unit/TV stand.
OPTIONAL: armchair, bookshelf, sideboard, desk+chair.
• Kitchen/Dining (MIN 4): base cabinets (D≈60 cm) incl. sink + cooktop + fridge +
dining table (120–160×75–90 cm) with 2–6 chairs.
OPTIONAL: wall cabinets, island or bar with stools.
• Bedroom — Double (MIN 4): double bed (140–160×200 cm) + 2 nightstands +
wardrobe (D≈60 cm).
OPTIONAL: dresser/commode, desk+chair.
• Bedroom — Single/Kids (MIN 3): single bed (90×200 cm) + wardrobe + desk+chair.
OPTIONAL: bookcase, nightstand.
• Home Office (MIN 3): desk + chair + bookshelf/cabinet.
OPTIONAL: sofa/sofa-bed, filing cabinet.
• Bathroom (combined) (MIN 3): toilet + washbasin + shower (80×80 cm) OR bathtub
(170×70 cm).
OPTIONAL: tall cabinet/shelves, washing machine (≈60×60 cm), towel rail.
• WC (separate) (MIN 2): toilet + small washbasin.
OPTIONAL: shelf/cabinet.
• Utility/Laundry (MIN 2): washer (≈60×60 cm) + storage shelf/cabinet.
OPTIONAL: dryer, ironing board.
• Storage/Pantry/Closet (MIN 1): shelving units along one wall.
• Balcony/Loggia (MIN 1 if feasible): one compact item (folding chair or planter). If
adding ANY item would block access or glazing, leave empty.
PLACEMENT & CLEARANCES:
• Keep main walkways ≥80 cm where possible.
• Do not block door swings, windows, radiators, or plumbing fixtures.
• Typical clearances: in front of wardrobes ≥75 cm; around double bed ≥60 cm on
accessible sides; in front of toilet ≥60 cm with side clearance ≥15 cm.
• If the minimum set cannot fit, use compact alternatives (e.g., shower instead of bathtub,
narrower wardrobe). If absolutely impossible, place at least ONE smallest appropriate item for
that room type.
TEXT AND LABELS:
Only room areas in format "12.3 m²"
Font: Arial, 12 px, black; centered within rooms with furniture arranged to keep the label
legible
COMPOSITION:
Plan centered in image
Margins ≥50 px from canvas edges
No borders, titles, or dimension lines`
};

/**
 * Генерирует технический план квартиры с помощью COMETAPI nano-banana-hd
 * @param {string} imagePath - Путь к загруженному изображению
 * @param {string} mode - Режим: 'withFurniture' или 'withoutFurniture'
 * @returns {Promise<Buffer>} - Буфер с сгенерированным изображением
 */
export async function generateTechnicalPlan(imagePath, mode = 'withoutFurniture') {
  const apiKey = process.env.COMETAPI_API_KEY;
  
  if (!apiKey) {
    throw new Error('COMETAPI_API_KEY не установлен в переменных окружения');
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Файл изображения не найден: ${imagePath}`);
  }

  const prompt = PROMPTS[mode];
  if (!prompt) {
    throw new Error(`Неизвестный режим: ${mode}`);
  }

  try {
    console.log(`🎨 Генерация технического плана (режим: ${mode})`);
    console.log(`📁 Изображение: ${imagePath}`);
    
    // Создаем FormData для отправки
    const formData = new FormData();
    
    // Добавляем изображение
    formData.append('image', fs.createReadStream(imagePath));
    
    // Добавляем параметры запроса
    formData.append('model', 'nano-banana-hd');
    formData.append('prompt', prompt);
    formData.append('max_tokens', '1000');
    formData.append('temperature', '0.1');
    formData.append('top_p', '0.9');
    formData.append('stream', 'false');

    console.log('📤 Отправка запроса к COMETAPI...');
    
    const response = await fetch('https://api.cometapi.com/v1/image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка COMETAPI:', response.status, errorText);
      throw new Error(`COMETAPI ошибка ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`COMETAPI вернул ошибку: ${result.error || 'Неизвестная ошибка'}`);
    }

    if (!result.data || !result.data.image) {
      throw new Error('COMETAPI не вернул изображение');
    }

    // Декодируем base64 изображение
    const imageBuffer = Buffer.from(result.data.image, 'base64');
    
    console.log('✅ Технический план успешно сгенерирован');
    console.log(`📊 Размер изображения: ${imageBuffer.length} байт`);
    
    return imageBuffer;

  } catch (error) {
    console.error('❌ Ошибка генерации технического плана:', error);
    throw error;
  }
}

/**
 * Генерирует очищенное изображение (удаление объектов) с помощью COMETAPI
 * @param {Object} options - Опции для генерации
 * @param {string[]} options.imagePaths - Массив путей к изображениям
 * @returns {Promise<Buffer[]>} - Массив буферов с очищенными изображениями
 */
export async function generateCleanupImage({ imagePaths }) {
  const apiKey = process.env.COMETAPI_API_KEY;
  
  if (!apiKey) {
    throw new Error('COMETAPI_API_KEY не установлен в переменных окружения');
  }

  if (!imagePaths || imagePaths.length === 0) {
    throw new Error('Не предоставлены пути к изображениям');
  }

  const cleanupPrompt = `You are a professional image editor specializing in object removal and room cleanup. Your task is to remove all furniture, objects, and personal items from the provided room image while preserving the architectural structure, walls, doors, windows, and floor.

INSTRUCTIONS:
1. Remove ALL furniture, appliances, decorations, and personal items
2. Keep all architectural elements: walls, doors, windows, floor
3. Fill removed areas with appropriate floor/wall textures
4. Maintain realistic lighting and shadows
5. Preserve the original perspective and composition
6. Output should look like an empty, clean room ready for renovation

TECHNICAL REQUIREMENTS:
- Output format: JPG, 1200x1200px, quality 95%
- Background: clean white/neutral
- No artifacts or obvious editing marks
- Maintain original room proportions`;

  const results = [];

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Файл изображения не найден: ${imagePath}`);
    }

    try {
      console.log(`🧹 Очистка изображения ${i + 1}/${imagePaths.length}: ${imagePath}`);
      
      // Создаем FormData для отправки
      const formData = new FormData();
      
      // Добавляем изображение
      formData.append('image', fs.createReadStream(imagePath));
      
      // Добавляем параметры запроса
      formData.append('model', 'nano-banana-hd');
      formData.append('prompt', cleanupPrompt);
      formData.append('max_tokens', '1000');
      formData.append('temperature', '0.1');
      formData.append('top_p', '0.9');
      formData.append('stream', 'false');

      console.log('📤 Отправка запроса к COMETAPI для очистки...');
      
      const response = await fetch('https://api.cometapi.com/v1/image/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка COMETAPI при очистке:', response.status, errorText);
        throw new Error(`COMETAPI ошибка ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`COMETAPI вернул ошибку: ${result.error || 'Неизвестная ошибка'}`);
      }

      if (!result.data || !result.data.image) {
        throw new Error('COMETAPI не вернул очищенное изображение');
      }

      // Декодируем base64 изображение
      const imageBuffer = Buffer.from(result.data.image, 'base64');
      
      console.log('✅ Изображение успешно очищено');
      console.log(`📊 Размер изображения: ${imageBuffer.length} байт`);
      
      results.push(imageBuffer);

    } catch (error) {
      console.error(`❌ Ошибка очистки изображения ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Проверяет доступность COMETAPI
 * @returns {Promise<boolean>}
 */
export async function checkCometApiHealth() {
  const apiKey = process.env.COMETAPI_API_KEY;
  
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch('https://api.cometapi.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Ошибка проверки COMETAPI:', error);
    return false;
  }
}
