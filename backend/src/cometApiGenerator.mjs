// Полифилл для Buffer (совместимость со старыми версиями Node.js)
console.log('🔍 Проверка Buffer:', {
  globalThisBuffer: typeof globalThis.Buffer,
  globalBuffer: typeof global.Buffer,
  nodeVersion: process.version
});

if (typeof globalThis.Buffer === 'undefined') {
  try {
    globalThis.Buffer = require('buffer').Buffer;
    console.log('✅ Buffer загружен через require("buffer")');
  } catch (e) {
    // Fallback для старых версий Node.js
    globalThis.Buffer = global.Buffer || Buffer;
    console.log('✅ Buffer загружен через fallback');
  }
}

import fetch from 'node-fetch';
import FormData from 'form-data';
import { Buffer } from 'node:buffer';
// Базовый URL для генерации изображений COMETAPI (можно переопределить через env)
// Модель: gemini-2.5-flash-image-preview (CometAPI, формат generateContent)
const COMETAPI_IMAGE_URL = process.env.COMETAPI_IMAGE_URL || 'https://api.cometapi.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

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
 * Генерирует чистую комнату (удаление объектов) с помощью COMETAPI nano-banana-hd
 * @param {{imagePaths: string[]}} params
 * @returns {Promise<Buffer>} - Буфер с сгенерированным изображением
 */
export async function generateCleanupImage({ imagePaths = [] } = {}) {
  // Проверяем доступность Buffer
  if (typeof Buffer === 'undefined') {
    throw new Error('Buffer не доступен. Проверьте версию Node.js.');
  }
  
  const apiKey = process.env.COMET_API_KEY;
  if (!apiKey) throw new Error('COMET_API_KEY не установлен в переменных окружения');
  if (!imagePaths || imagePaths.length === 0) throw new Error('Не переданы изображения');

  const prompt = `Transform the uploaded interior photo into the same room completely empty: keep only the original walls (with their real finishes/texture/pattern) and the existing floor. Remove everything else that is not a structural part of the room. Preserve geometry, perspective, lighting, and colors.

Remove completely (no traces left):

All furniture and loose items: sofas, armchairs, tables, chairs/stools, lamps, shelves, carpets/rugs, blankets, pillows, plants, boxes, tools, ladders, trash, cords.

All kitchen casework and contents: upper/lower cabinets, shelves, countertop, sink, faucet, cooktop/oven, small appliances, dishes, food, jars.

All decor and small objects: frames, books, vases, bowls, kettles, containers, textiles, etc.

All shadows/reflections/prints belonging to the removed objects.

Keep exactly as is (do not alter, move, or restyle):

Walls with their original finish: exposed brick, plaster, paint, wallpaper, tile/mosaic backsplash (including grout width, tile size, and tone).

Floor with its real pattern and direction (e.g., herringbone boards, tile joints, thresholds, transitions).

Architectural/structural elements only: doors/door frames, baseboards, window reveals, ceiling, built-in track lights/ceiling lights, sockets/switches, vents/grilles, fixed ducts/shafts, radiators, and wall/ceiling junctions.

Camera framing, focal length feel, horizon line, and vanishing lines.

Inpainting rules for occluded areas:

Extend the exact surface that should be behind the removed item.

If an object covered brick, continue the brick with the same brick size, mortar lines, chips, and weathering.

If it covered a mosaic backsplash, continue the grid with the same tile size, spacing, grout color, and subtle variations.

If it covered herringbone wood, continue the plank direction, plank width, and join pattern in correct perspective.

Respect perspective and scale (lines must converge consistently).

Match illumination: reconstruct soft ambient shading from the original light sources; do not introduce new lights or stylized highlights.

Quality constraints / do not do:

Do not add any new objects, decor, or fixtures from imagination.

Do not crop, rotate, upscale, or change aspect ratio; keep original resolution and framing.

Do not restyle or “improve” materials; keep a documentary, photorealistic look.

Avoid repeating textures, smudges, blur halos, or warped edges; seams and corners must stay sharp and straight.

Acceptance checklist (self-check before output):

No furniture, kitchen casework, appliances, decor, or clutter remains.

Wall finishes and floor pattern are continuous and believable at 100% zoom (no visible inpaint seams).

Doors, baseboards, track lights, outlets, vents, and other structural details are preserved and natural.

Lighting/color balance matches the original shot; no extra glare or ghosting.

Output:
Generate one photorealistic image of the same room, empty (bare walls + floor only), same size/aspect as the input.`;

  try {
    const outputs = [];
    for (const imagePath of imagePaths) {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString('base64');
      const ext = path.extname(imagePath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mime, data: base64 } }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE']
        }
      };

      const response = await retryWithBackoff(async () => {
        const resp = await fetch(COMETAPI_IMAGE_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`COMETAPI ошибка ${resp.status} [${COMETAPI_IMAGE_URL}]: ${errorText}`);
        }
        
        return resp;
      });

      const result = await response.json();

      // Извлекаем base64 из разнообразных возможных форматов
      let base64Image;
      if (result?.data?.image && typeof result.data.image === 'string') {
        base64Image = result.data.image;
      }
      if (!base64Image) {
        const candidates = result?.candidates || result?.contents || result?.responses;
        if (Array.isArray(candidates) && candidates.length > 0) {
          const first = candidates[0].content || candidates[0];
          const parts = first?.parts || first;
          if (Array.isArray(parts)) {
            const inlinePart = parts.find(p => 
              p?.inline_data?.data || p?.inline_data?.image || 
              p?.inlineData?.data || p?.inlineData?.image
            );
            if (inlinePart?.inline_data?.data) base64Image = inlinePart.inline_data.data;
            else if (inlinePart?.inline_data?.image) base64Image = inlinePart.inline_data.image;
            else if (inlinePart?.inlineData?.data) base64Image = inlinePart.inlineData.data;
            else if (inlinePart?.inlineData?.image) base64Image = inlinePart.inlineData.image;
          }
        }
      }
      if (!base64Image && Array.isArray(result?.media)) {
        const mediaItem = result.media.find(m => typeof m?.data === 'string');
        if (mediaItem?.data) base64Image = mediaItem.data;
      }
      if (!base64Image && typeof result?.image === 'string') base64Image = result.image;
      if (!base64Image && typeof result?.output === 'string') base64Image = result.output;
      if (!base64Image) {
        const tryExtractBase64 = (obj, depth = 0) => {
          if (!obj || depth > 3) return null;
          if (typeof obj === 'string') return obj.length > 200 ? obj : null;
          if (Array.isArray(obj)) {
            for (const it of obj) {
              const found = tryExtractBase64(it, depth + 1);
              if (found) return found;
            }
            return null;
          }
          if (typeof obj === 'object') {
            const preferredKeys = ['image', 'data', 'inline_data'];
            for (const k of preferredKeys) {
              if (obj[k]) {
                const found = tryExtractBase64(obj[k], depth + 1);
                if (found) return found;
              }
            }
            for (const k of Object.keys(obj)) {
              if (!preferredKeys.includes(k)) {
                const found = tryExtractBase64(obj[k], depth + 1);
                if (found) return found;
              }
            }
          }
          return null;
        };
        base64Image = tryExtractBase64(result);
      }

      if (!base64Image) {
        const preview = JSON.stringify(result).slice(0, 500);
        throw new Error('COMETAPI не вернул изображение в ожидаемом формате: ' + preview);
      }

      outputs.push(Buffer.from(base64Image, 'base64'));
    }

    return outputs;
  } catch (e) {
    console.error('❌ Ошибка генерации очистки комнаты:', e);
    throw e;
  }
}

/**
 * Retry функция с экспоненциальной задержкой
 * @param {Function} fn - Функция для выполнения
 * @param {number} maxRetries - Максимальное количество попыток
 * @param {number} baseDelay - Базовая задержка в мс
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Определяем типы ошибок для повторных попыток
      const isServerError = error.message.includes('500') || 
                           error.message.includes('502') ||
                           error.message.includes('503') ||
                           error.message.includes('504') ||
                           error.message.includes('当前分组上游负载已饱和') ||
                           error.message.includes('shell_api_error') ||
                           error.message.includes('No available channels') ||
                           error.message.includes('comet_api_error');
      
      // Специальная обработка ошибки 503 (No available channels)
      if (error.message.includes('503') && error.message.includes('No available channels')) {
        console.error('🚫 COMETAPI: Нет доступных каналов для модели. Сервис перегружен.');
        throw new Error('Сервис генерации временно недоступен. Попробуйте позже.');
      }
      
      if (isLastAttempt || !isServerError) {
        // Логируем финальную ошибку с подробностями
        console.error(`❌ Финальная ошибка после ${attempt + 1} попыток:`, error.message);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`⏳ Попытка ${attempt + 1}/${maxRetries} неудачна (${error.message.slice(0, 100)}...), повтор через ${Math.round(delay)}мс...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Генерирует технический план квартиры с помощью COMETAPI nano-banana-hd
 * @param {string} imagePath - Путь к загруженному изображению
 * @param {string} mode - Режим: 'withFurniture' или 'withoutFurniture'
 * @returns {Promise<Buffer>} - Буфер с сгенерированным изображением
 */
export async function generateTechnicalPlan(imagePath, mode = 'withoutFurniture') {
  // Проверяем доступность Buffer
  if (typeof Buffer === 'undefined') {
    throw new Error('Buffer не доступен. Проверьте версию Node.js.');
  }
  
  const apiKey = process.env.COMET_API_KEY;
  
  if (!apiKey) {
    throw new Error('COMET_API_KEY не установлен в переменных окружения');
  }

  // Дополнительная проверка API ключа
  if (apiKey === 'YOUR_COMET_API_KEY_HERE' || apiKey === 'YOUR_ACTUAL_COMET_API_KEY' || apiKey.length < 10) {
    console.error('❌ API ключ недействителен:', {
      keyLength: apiKey.length,
      keyStart: apiKey.substring(0, 10) + '...',
      isDefault: apiKey === 'YOUR_COMET_API_KEY_HERE' || apiKey === 'YOUR_ACTUAL_COMET_API_KEY'
    });
    throw new Error('COMET_API_KEY недействителен. Проверьте настройки переменных окружения на хостинге.');
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
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mime, data: base64 } }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE']
      }
    };

    console.log('📤 Отправка запроса к COMETAPI (Nano-Banana)...');
    console.log(`📝 Промпт длина: ${prompt.length} символов`);
    console.log(`🖼️ Изображение: ${mime}, ${base64.length} символов base64`);
    console.log(`🔑 API ключ: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
    console.log(`🌐 URL: ${COMETAPI_IMAGE_URL}`);

    // Используем retry логику для обработки ошибок сервера
    const response = await retryWithBackoff(async () => {
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      console.log('📋 Заголовки запроса:', headers);
      console.log('📦 Тело запроса (первые 500 символов):', JSON.stringify(requestBody).substring(0, 500) + '...');
      
      const resp = await fetch(COMETAPI_IMAGE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`COMETAPI ошибка ${resp.status} [${COMETAPI_IMAGE_URL}]: ${errorText?.slice(0, 500)}`);
      }
      
      return resp;
    });

    const result = await response.json();

    let base64Image;

    // Вариант 1: старый формат { data: { image: base64 } }
    if (result?.data?.image && typeof result.data.image === 'string') {
      base64Image = result.data.image;
    }

    // Вариант 2: Gemini-подобный формат candidates -> content(parts[]) -> inline_data
    if (!base64Image) {
      const candidates = result?.candidates || result?.contents || result?.responses;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const first = candidates[0].content || candidates[0];
        const parts = first?.parts || first;
        if (Array.isArray(parts)) {
          // ищем часть с изображением (поддерживаем оба формата: inline_data и inlineData)
          const inlinePart = parts.find(p => 
            p?.inline_data?.data || p?.inline_data?.image || 
            p?.inlineData?.data || p?.inlineData?.image
          );
          if (inlinePart?.inline_data?.data) {
            base64Image = inlinePart.inline_data.data;
          } else if (inlinePart?.inline_data?.image) {
            base64Image = inlinePart.inline_data.image;
          } else if (inlinePart?.inlineData?.data) {
            base64Image = inlinePart.inlineData.data;
          } else if (inlinePart?.inlineData?.image) {
            base64Image = inlinePart.inlineData.image;
          }
        }
      }
    }

    // Вариант 3: media массив с { mime_type, data }
    if (!base64Image && Array.isArray(result?.media)) {
      const mediaItem = result.media.find(m => typeof m?.data === 'string');
      if (mediaItem?.data) base64Image = mediaItem.data;
    }

    // Вариант 4: плоский поиск по известным путям
    if (!base64Image && typeof result?.image === 'string') base64Image = result.image;
    if (!base64Image && typeof result?.output === 'string') base64Image = result.output;

    // Вариант 5: глубокий поиск по объекту первых найденных 2-3 уровней
    if (!base64Image) {
      const tryExtractBase64 = (obj, depth = 0) => {
        if (!obj || depth > 3) return null;
        if (typeof obj === 'string') {
          // эвристика base64-строки
          return obj.length > 200 ? obj : null;
        }
        if (Array.isArray(obj)) {
          for (const it of obj) {
            const found = tryExtractBase64(it, depth + 1);
            if (found) return found;
          }
          return null;
        }
        if (typeof obj === 'object') {
          // приоритетные ключи
          const preferredKeys = ['image', 'data', 'inline_data'];
          for (const k of preferredKeys) {
            if (obj[k]) {
              const found = tryExtractBase64(obj[k], depth + 1);
              if (found) return found;
            }
          }
          // иначе любой ключ
          for (const k of Object.keys(obj)) {
            if (!preferredKeys.includes(k)) {
              const found = tryExtractBase64(obj[k], depth + 1);
              if (found) return found;
            }
          }
        }
        return null;
      };
      const guess = tryExtractBase64(result);
      if (guess) base64Image = guess;
    }

    if (!base64Image) {
      const preview = JSON.stringify(result).slice(0, 1000);
      console.error('⚠️ Ответ COMETAPI без изображения, превью:', preview);
      throw new Error('COMETAPI не вернул изображение в ожидаемом формате');
    }

    const outBuffer = Buffer.from(base64Image, 'base64');

    console.log('✅ Технический план успешно сгенерирован');
    console.log(`📊 Размер изображения: ${outBuffer.length} байт`);
    
    return outBuffer;

  } catch (error) {
    console.error('❌ Ошибка генерации технического плана:', error);
    throw error;
  }
}


/**
 * Проверяет доступность COMETAPI
 * @returns {Promise<boolean>}
 */
export async function checkCometApiHealth() {
  const apiKey = process.env.COMET_API_KEY;
  
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
