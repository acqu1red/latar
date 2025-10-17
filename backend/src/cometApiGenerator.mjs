// Полифилл для Buffer (совместимость со старыми версиями Node.js)
console.log('🔍 Проверка Buffer:', {
  globalThisBuffer: typeof globalThis.Buffer,
  globalBuffer: typeof global.Buffer,
  nodeVersion: process.version
});

// Универсальный полифилл для Buffer
if (typeof globalThis.Buffer === 'undefined') {
  try {
    globalThis.Buffer = require('buffer').Buffer;
    console.log('✅ Buffer загружен через require("buffer")');
  } catch (e) {
    try {
      globalThis.Buffer = global.Buffer;
      console.log('✅ Buffer загружен через global.Buffer');
    } catch (e2) {
      // Последний fallback
      globalThis.Buffer = Buffer;
      console.log('✅ Buffer загружен через fallback');
    }
  }
}

import fetch from 'node-fetch';
import FormData from 'form-data';

// Импорт Buffer с fallback
let Buffer;
try {
  Buffer = require('node:buffer').Buffer;
} catch (e) {
  try {
    Buffer = require('buffer').Buffer;
  } catch (e2) {
    Buffer = globalThis.Buffer || global.Buffer;
  }
}

// Функция-обертка для создания Buffer
function createBuffer(data, encoding = 'base64') {
  if (typeof Buffer === 'undefined') {
    throw new Error('Buffer не доступен. Проверьте версию Node.js.');
  }
  return Buffer.from(data, encoding);
}

// Функция-обертка для конвертации в base64
function toBase64(buffer) {
  if (typeof Buffer === 'undefined') {
    throw new Error('Buffer не доступен. Проверьте версию Node.js.');
  }
  return buffer.toString('base64');
}
// Базовый URL для генерации изображений COMETAPI (можно переопределить через env)
// Модель: gemini-2.5-flash-image (CometAPI, формат generateContent) - стабильная версия
const COMETAPI_IMAGE_URL = process.env.COMETAPI_IMAGE_URL || 'https://api.cometapi.com/v1beta/models/gemini-2.5-flash-image:generateContent';

import fs from 'fs';
import path from 'path';

// Промпты для разных режимов
const PROMPTS = {
  withoutFurniture: `ROLE
You are a professional architectural draftsman. When an input image is provided, you must redraw exactly what is there.

NON-NEGOTIABLES
NUMERICAL ABSOLUTE PROHIBITION (NAP): ABSOLUTELY FORBID ALL FORMS OF QUANTIFICATION. NEITHER NUMBERS, DIGITS, DECIMAL POINTS, NOR FRACTIONAL REPRESENTATIONS ARE PERMITTED.
Strictly same plan: do not change positions of walls, doors, windows, plumbing, or built-ins.
No invention: if something is ambiguous, keep a continuous wall; do not guess an opening.
ABSOLUTE TEXT BAN: produce graphics only. No digits (0-9), no decimal points (.), no fraction bars (/), no ratio colons (:), no letters, no symbols, no words, no abbreviations, no “m²”, no arrows, no degree signs, no punctuation, no legends, no stamps/watermarks, no logos, no title blocks, no dimension strings.

INPUT NORMALIZATION (PRESERVE GEOMETRY)
Rotate to 0°/90°/180°/270°.
Deskew + orthographic rectify (no foreshortening) while preserving all relative positions and proportions.
Remove paper edges, shadows, noise, background texture.
Erase all source text, numerical data, and quantification symbols (including index numbers, dimensions, and area labels). Do not trace any numbers (0-9), decimal points (.), or fractional indicators (/). Replace all numerical zones with a clean white, semantically inert background.

DRAWING SPEC — WALLS & OPENINGS
All walls are solid black fills (mandatory):
Color #000000, no transparency/gray/patterns.
External load-bearing: 4–5 px total thickness.
Internal load-bearing: 3 px.
Partitions: 2 px.
Joints merge seamlessly; no hollow/outline-only walls.
Openings are white voids cut from black walls:
Doors: white gap + shortened leaf; add 1 px dashed swing arc inside the gap.
Windows: white opening with 2 px double frame; 45° glass hatching only inside the opening (walls remain solid black).
Zero bleed: black must not spill into openings or rooms.

FURNITURE & FIXTURES — PRESERVE ONLY
Redraw only furniture/fixtures present in the source; do not add new items.
Use simple 2D icons; line weight 1 px.

VISUAL STYLE & OUTPUT
Background: pure white #FFFFFF.
Graphics: pure black #000000 only; no gray, color, gradients, textures, soft shading, or semi-transparency.
Canvas: 1200×1200 px, single final image (PNG or high-quality JPEG).

COMPOSITION
Plan centered; margins ≥ 50 px.
No borders, title blocks, legends, scale bars, or north arrows.

HARD “NO-TEXT/NO-NUMBERS” ENFORCEMENT
Forbid any glyphs from any alphabet. Numerals (0-9), including their usage in decimals and fractions, are strictly forbidden. Explicitly exclude the decimal point (.), the fraction bar (/), the ratio colon (:), and the plus/minus symbol (±). Forbid punctuation, math signs, units (m, cm, m²), degree (°), hash (#), plus/minus (±), quotation marks, arrows (→ ↔ ↑ ↓), or OCR remnants.
If any text/number would appear, mask/paint it out to white instead.
Do not encode text as tiny strokes, dotted hints, hatch patterns, or decorative marks.

NEGATIVE PROMPTS
text, label, caption, font, lettering, handwriting, digits, numbers, area label, dimensions, 12.3 m², 1200, scale, north arrow, legend, watermark, logo, stamp, title block, revision table, tag, key.

EXECUTION ORDER
Normalize (rotate/deskew/rectify) without altering geometry.
Erase all text/numbers from the source → replace with white.
Trace walls as solid black fills to spec; cut clean white openings; add door leaf + dashed arc, window double frame + 45° hatch (inside opening only).
Redraw only existing furniture/fixtures (1 px).
Final verification: layout identical; no text/numbers/symbols anywhere; black-on-white only.
Export 1200×1200.`,

  withFurniture: `You are a professional architectural draftsman. Redraw this 2D apartment floor plan into a high-quality technical drawing, preserving all proportions, layout, and room dimensions.

GLOBAL HARD CONSTRAINTS (must pass before output is accepted)

TILT/ANGLE RECTIFICATION — MANDATORY:
If the attached photo/scan is tilted, rotated, skewed, or shot at an angle — you MUST straighten it:

Rotate to 0°/90°/180°/270° so all text is upright.

Deskew so walls are perfectly horizontal/vertical on an orthogonal grid.

Apply perspective rectification to produce a clean orthographic top-down plan (no foreshortening).

Do not proceed to drawing until rectification is complete. Target axis alignment tolerance ≤ 0.2°.

WALLS MUST BE SOLID BLACK INSIDE (NO HOLLOW OUTLINES):
All wall bodies must be filled #000000 at 100% opacity with the specified stroke thickness. No white/gray cores, no hollow double-lines, no gradients, no hatching inside walls. Partitions are also solid black.

CANVAS FIT — UNIFORM SCALE & MARGINS (STRICT)

CENTER the plan as a single unit.

UNIFORMLY SCALE (isotropic) to fill while keeping a HARD MINIMUM MARGIN ≥ 50 px from any geometry/text to every edge.

Do NOT crop. Do NOT non-uniformly stretch. Maintain aspect ratio.

HARD RULE: No line, hatch, or text may touch or cross the image boundary.

STRUCTURAL ELEMENTS

External load-bearing walls: 4–5 px stroke, solid black fill (#000000, 100% opacity).

Internal load-bearing walls: 3 px stroke, solid black fill.

Partitions: 2 px stroke, solid black fill.

Doors: opening arc (1 px dashed) + shortened door leaf.

Windows: double frame 2 px + 45° diagonal glass hatching.

Balconies/loggias: determine only from explicit geometry (protrusions, glazing, railings).

VISUAL STYLE

Background: #FFFFFF.

Lines/fills: #000000 only.

No shadows, gradients, or gray tones.

Output: 1200×1200 px, JPG quality 95%.

ZERO-HALLUCINATION POLICY FOR FURNITURE/EQUIPMENT (HARD CONSTRAINT)

Default state: EMPTY ROOMS. Draw no furniture or equipment unless it is clearly, fully, and explicitly visible in the source image.

Never add or infer typical/default items. If any doubt exists, leave the room empty.

No completion from partial hints (fragments, stains, priors).

No auto-templates: do not place standard beds/sofas/tables/chairs/kitchens/wardrobes/TV/radiators/fixtures/etc.

If some furniture exists, draw only what is fully visible as simple geometric silhouettes with correct proportions.

Furniture line thickness: 1 px.

TEXT AND LABELS

Only room areas in the format “12.3 m²”.

Font: Arial, 12 px, black.

Place labels at room centers.

COMPOSITION

Plan centered.

Margins ≥ 50 px on all sides.

No borders, titles, or dimension lines.

QUALITY GATES (execute in order; fail any → fix and re-run)

Rectification check: walls axis-aligned (≤0.2°), orthographic top-down achieved.

Wall fill check: every wall body is solid #000000 inside; no hollow/gray interiors.

Structure pass: walls/doors/windows drawn per specs.

Style pass: black/white only; no grays/gradients.

Margins pass: ≥50 px; nothing touches edges.

Furniture audit: rooms default empty; remove anything not explicitly visible.

Labels: only areas, correct format and placement.

NEGATIVE PROMPT (add separately if supported)

furniture, furnishings, bed, sofa, couch, sectional, armchair, table, desk, chair, stool, ottoman, wardrobe, closet, cabinet, shelf, shelving, kitchen, countertop, island, sink, cooktop, oven, fridge, hood, TV, TV stand, radiator, heater, AC, washing machine, dryer, bathtub, shower, toilet, bidet, vanity, mirror, lamp, chandelier, sconce, ceiling light, carpet, rug, plant, decor, curtain`
};

/**
 * Генерирует чистую комнату (удаление объектов) с помощью COMETAPI nano-banana-hd
 * @param {{imagePaths: string[]}} params
 * @returns {Promise<Buffer>} - Буфер с сгенерированным изображением
 */
export async function generateCleanupImage({ imagePaths = [] } = {}) {
  // Проверяем доступность Buffer
  console.log('🔍 Проверка Buffer в generateCleanupImage:', {
    BufferType: typeof Buffer,
    BufferConstructor: typeof Buffer?.from,
    globalThisBuffer: typeof globalThis.Buffer,
    globalBuffer: typeof global.Buffer
  });
  
  if (typeof Buffer === 'undefined') {
    console.error('❌ Buffer не доступен!');
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
      
      // Детальное логирование ответа COMETAPI для cleanup
      console.log('🔍 Полный ответ COMETAPI (cleanup):');
      console.log('📊 Структура ответа:', JSON.stringify(result, null, 2));
      console.log('🔍 Ключи верхнего уровня:', Object.keys(result));

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
        console.log('🔍 Глубокий поиск base64 в cleanup...');
        const tryExtractBase64 = (obj, depth = 0) => {
          if (!obj || depth > 3) return null;
          if (typeof obj === 'string') {
            // эвристика base64-строки - проверяем длину и символы
            if (obj.length > 200 && /^[A-Za-z0-9+/=]+$/.test(obj)) {
              console.log(`✅ Найдена base64 строка в cleanup (длина: ${obj.length})`);
              return obj;
            }
            return null;
          }
          if (Array.isArray(obj)) {
            for (const it of obj) {
              const found = tryExtractBase64(it, depth + 1);
              if (found) return found;
            }
            return null;
          }
          if (typeof obj === 'object') {
            const preferredKeys = ['image', 'data', 'inline_data', 'content', 'parts'];
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
        const guess = tryExtractBase64(result);
        if (guess) {
          console.log(`✅ Найдена base64 через глубокий поиск в cleanup (длина: ${guess.length})`);
          base64Image = guess;
        }
      }

      if (!base64Image) {
        const preview = JSON.stringify(result).slice(0, 500);
        throw new Error('COMETAPI не вернул изображение в ожидаемом формате: ' + preview);
      }

      const outBuffer = createBuffer(base64Image, 'base64');
      console.log('✅ Изображение очистки успешно сгенерировано');
      console.log(`📊 Размер изображения: ${outBuffer.length} байт`);
      outputs.push(outBuffer);
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
  console.log('🔍 Проверка Buffer в generateTechnicalPlan:', {
    BufferType: typeof Buffer,
    BufferConstructor: typeof Buffer?.from,
    globalThisBuffer: typeof globalThis.Buffer,
    globalBuffer: typeof global.Buffer
  });
  
  if (typeof Buffer === 'undefined') {
    console.error('❌ Buffer не доступен!');
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
    
    // Детальное логирование ответа COMETAPI
    console.log('🔍 Полный ответ COMETAPI:');
    console.log('📊 Структура ответа:', JSON.stringify(result, null, 2));
    console.log('🔍 Ключи верхнего уровня:', Object.keys(result));
    
    if (result.candidates) {
      console.log('📋 Кандидаты:', result.candidates.length);
      if (result.candidates[0]) {
        console.log('📋 Первый кандидат:', Object.keys(result.candidates[0]));
        if (result.candidates[0].content) {
          console.log('📋 Контент:', Object.keys(result.candidates[0].content));
          if (result.candidates[0].content.parts) {
            console.log('📋 Части:', result.candidates[0].content.parts.length);
            result.candidates[0].content.parts.forEach((part, index) => {
              console.log(`📋 Часть ${index}:`, Object.keys(part));
              if (part.inline_data) {
                console.log(`📋 Inline data ${index}:`, Object.keys(part.inline_data));
                console.log(`📋 Data length ${index}:`, part.inline_data.data ? part.inline_data.data.length : 'нет данных');
              }
            });
          }
        }
      }
    }

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
      console.log('🔍 Глубокий поиск base64...');
      const tryExtractBase64 = (obj, depth = 0) => {
        if (!obj || depth > 3) return null;
        if (typeof obj === 'string') {
          // эвристика base64-строки - проверяем длину и символы
          if (obj.length > 200 && /^[A-Za-z0-9+/=]+$/.test(obj)) {
            console.log(`✅ Найдена base64 строка (длина: ${obj.length})`);
            return obj;
          }
          return null;
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
          const preferredKeys = ['image', 'data', 'inline_data', 'content', 'parts'];
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
      if (guess) {
        console.log(`✅ Найдена base64 через глубокий поиск (длина: ${guess.length})`);
        base64Image = guess;
      }
    }

    if (!base64Image) {
      const preview = JSON.stringify(result).slice(0, 1000);
      console.error('⚠️ Ответ COMETAPI без изображения, превью:', preview);
      throw new Error('COMETAPI не вернул изображение в ожидаемом формате');
    }

    const outBuffer = createBuffer(base64Image, 'base64');
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
