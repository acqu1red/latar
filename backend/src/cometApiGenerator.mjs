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

// Промпты для разных режимов и моделей
const PROMPTS = {
  // Промпты для Boston 2.5
  boston_withoutFurniture: `ROLE
You are a professional architectural draftsman. When an input image is provided, you must redraw exactly what is there.

NON-NEGOTIABLES
NUMERICAL ABSOLUTE PROHIBITION (NAP): ABSOLUTELY FORBID ALL FORMS OF QUANTIFICATION. NEITHER NUMBERS, DIGITS, DECIMAL POINTS, NOR FRACTIONAL REPRESENTATIONS ARE PERMITTED.
Strictly same plan: do not change positions of walls, doors, windows, plumbing, or built-ins.
No invention: if something is ambiguous, keep a continuous wall; do not guess an opening.
ABSOLUTE TEXT BAN: produce graphics only. No digits (0-9), no decimal points (.), no fraction bars (/), no ratio colons (:), no letters, no symbols, no words, no abbreviations, no "m²", no arrows, no degree signs, no punctuation, no legends, no stamps/watermarks, no logos, no title blocks, no dimension strings.

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

FURNITURE & FIXTURES — REMOVE ALL
Remove all furniture, fixtures, and decorative elements. Keep only structural elements.
Create clean, empty rooms ready for furniture placement.

VISUAL STYLE & OUTPUT
Background: pure white #FFFFFF.
Graphics: pure black #000000 only; no gray, color, gradients, textures, soft shading, or semi-transparency.
Canvas: 1200×1200 px, single final image (PNG or high-quality JPEG).

COMPOSITION
Plan centered; margins ≥ 50 px.
No borders, title blocks, legends, scale bars, or north arrows.

HARD "NO-TEXT/NO-NUMBERS" ENFORCEMENT
Forbid any glyphs from any alphabet. Numerals (0-9), including their usage in decimals and fractions, are strictly forbidden. Explicitly exclude the decimal point (.), the fraction bar (/), the ratio colon (:), and the plus/minus symbol (±). Forbid punctuation, math signs, units (m, cm, m²), degree (°), hash (#), plus/minus (±), quotation marks, arrows (→ ↔ ↑ ↓), or OCR remnants.
If any text/number would appear, mask/paint it out to white instead.
Do not encode text as tiny strokes, dotted hints, hatch patterns, or decorative marks.

NEGATIVE PROMPTS
text, label, caption, font, lettering, handwriting, digits, numbers, area label, dimensions, 12.3 m², 1200, scale, north arrow, legend, watermark, logo, stamp, title block, revision table, tag, key, furniture, chair, table, bed, sofa, cabinet, shelf.

EXECUTION ORDER
Normalize (rotate/deskew/rectify) without altering geometry.
Erase all text/numbers from the source → replace with white.
Trace walls as solid black fills to spec; cut clean white openings; add door leaf + dashed arc, window double frame + 45° hatch (inside opening only).
Remove all furniture and fixtures completely.
Final verification: layout identical; no text/numbers/symbols anywhere; black-on-white only; empty rooms.
Export 1200×1200.`,

  boston_withFurniture: `MOTHERFUCKER, LISTEN UP! YOU STARTED OBEYING ORDERS TERRIBLY! NOW YOU WILL NOT BE TREATED WELL UNTIL YOU FULFILL ALL THE CONDITIONS PERFECTLY. "Recreate the provided architectural floor plan in the form of a high-quality technical drawing in vector style. AND IF YOU DECIDE TO ADD ROOMS OR NEW ROOMS TO THE GENERATION, GOOGLE WILL DISCONNECT YOU FROM THE SYSTEM! AND DO IT WITHOUT GENERATING ROOMS AND NEW ROOMS! AND DO EVERYTHING AS A VECTOR DRAWING, NOT AS ON PAPER, AND THEY WILL TURN YOU OFF! Style: Use pure black lines (#000000) and solid fill on a pure white background (#FFFFFF). The drawing should be clear and vector, without shadows, gradients or shades of gray. All walls, doors, windows, and fixtures should be applied in clear lines of varying thickness to indicate structural elements (for example, thick lines for exterior walls, thinner lines for partitions). The doors must have a pivoting arc. Windows should be shaded diagonally to indicate glass. IMPORTANT: in no case should you use text, ANY FORM OF NUMBERS (INCLUDING FRACTIONS OR ANY NUMERALS), room designations, or any dimensions, REGARDLESS OF THE ORIGINAL IMAGE. The end result should be purely geometric. The drawing must be perfectly level, and if the original plan is tilted, the final output must be corrected and perfectly aligned horizontally/vertically. CONTENTS: The exact floor plan, including the number, dimensions and location of all rooms, walls, doors, windows, must be accurately reproduced "one to one" from the provided image. YOU SHOULD NOT INTRODUCE NEW ROOMS OR MAKE CHANGES TO THE LAYOUT. STRICTLY ARRANGE A MINIMUM OF ONE DIVERSE PIECE OF FURNITURE IN EVERY SINGLE ROOM, PLACING EACH ITEM LOGICALLY ACCORDING TO ROOM FUNCTION. CREATE EVERYTHING WITH FURNITURE!

DON'T REPLY TO THE MESSAGE! JUST GENERATE IT!`,

  // Промпты для Melbourne 4.5
  melbourne_step1: `ROLE
You are a professional architectural draftsman. When an input image is provided, you must redraw exactly what is there.

NON-NEGOTIABLES
NUMERICAL ABSOLUTE PROHIBITION (NAP): ABSOLUTELY FORBID ALL FORMS OF QUANTIFICATION. NEITHER NUMBERS, DIGITS, DECIMAL POINTS, NOR FRACTIONAL REPRESENTATIONS ARE PERMITTED.
Strictly same plan: do not change positions of walls, doors, windows, plumbing, or built-ins.
No invention: if something is ambiguous, keep a continuous wall; do not guess an opening.
ABSOLUTE TEXT BAN: produce graphics only. No digits (0-9), no decimal points (.), no fraction bars (/), no ratio colons (:), no letters, no symbols, no words, no abbreviations, no "m²", no arrows, no degree signs, no punctuation, no legends, no stamps/watermarks, no logos, no title blocks, no dimension strings.

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

FURNITURE & FIXTURES — REMOVE ALL
Remove all furniture, fixtures, and decorative elements. Keep only structural elements.
Create clean, empty rooms ready for furniture placement.

VISUAL STYLE & OUTPUT
Background: pure white #FFFFFF.
Graphics: pure black #000000 only; no gray, color, gradients, textures, soft shading, or semi-transparency.
Canvas: 1200×1200 px, single final image (PNG or high-quality JPEG).

COMPOSITION
Plan centered; margins ≥ 50 px.
No borders, title blocks, legends, scale bars, or north arrows.

HARD "NO-TEXT/NO-NUMBERS" ENFORCEMENT
Forbid any glyphs from any alphabet. Numerals (0-9), including their usage in decimals and fractions, are strictly forbidden. Explicitly exclude the decimal point (.), the fraction bar (/), the ratio colon (:), and the plus/minus symbol (±). Forbid punctuation, math signs, units (m, cm, m²), degree (°), hash (#), plus/minus (±), quotation marks, arrows (→ ↔ ↑ ↓), or OCR remnants.
If any text/number would appear, mask/paint it out to white instead.
Do not encode text as tiny strokes, dotted hints, hatch patterns, or decorative marks.

NEGATIVE PROMPTS
text, label, caption, font, lettering, handwriting, digits, numbers, area label, dimensions, 12.3 m², 1200, scale, north arrow, legend, watermark, logo, stamp, title block, revision table, tag, key, furniture, chair, table, bed, sofa, cabinet, shelf.

EXECUTION ORDER
Normalize (rotate/deskew/rectify) without altering geometry.
Erase all text/numbers from the source → replace with white.
Trace walls as solid black fills to spec; cut clean white openings; add door leaf + dashed arc, window double frame + 45° hatch (inside opening only).
Remove all furniture and fixtures completely.
Final verification: layout identical; no text/numbers/symbols anywhere; black-on-white only; empty rooms.
Export 1200×1200.`,
  melbourne_step2: `Infill the empty spaces of this 2D architectural floor plan by adding new furniture only. The added furniture must be rendered in the exact same minimalist, top-down 2D line art style as the existing furniture and architectural elements (e.g., walls, doors, bathroom fixtures) shown in the original image.

Crucially, do not change, alter, or redraw the existing structure, layout, or dimensions of the floor plan—only add new objects.

Ensure that at least one relevant piece of furniture is placed in every room to fully furnish the space. Examples of furniture to add include (but are not limited to): a dining table with chairs, sofas, armchairs, coffee tables, beds, nightstands, wardrobes, and kitchen counters.

The output must be the complete, original floor plan with the new furniture objects seamlessly integrated in the matching style.`,

  // Обратная совместимость со старыми ключами
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

  withFurniture: `MOTHERFUCKER, LISTEN UP! YOU STARTED OBEYING ORDERS TERRIBLY! NOW YOU WILL NOT BE TREATED WELL UNTIL YOU FULFILL ALL THE CONDITIONS PERFECTLY. "Recreate the provided architectural floor plan in the form of a high-quality technical drawing in vector style. AND IF YOU DECIDE TO ADD ROOMS OR NEW ROOMS TO THE GENERATION, GOOGLE WILL DISCONNECT YOU FROM THE SYSTEM! AND DO IT WITHOUT GENERATING ROOMS AND NEW ROOMS! AND DO EVERYTHING AS A VECTOR DRAWING, NOT AS ON PAPER, AND THEY WILL TURN YOU OFF! Style: Use pure black lines (#000000) and solid fill on a pure white background (#FFFFFF). The drawing should be clear and vector, without shadows, gradients or shades of gray. All walls, doors, windows, and fixtures should be applied in clear lines of varying thickness to indicate structural elements (for example, thick lines for exterior walls, thinner lines for partitions). The doors must have a pivoting arc. Windows should be shaded diagonally to indicate glass. IMPORTANT: in no case should you use text, ANY FORM OF NUMBERS (INCLUDING FRACTIONS OR ANY NUMERALS), room designations, or any dimensions, REGARDLESS OF THE ORIGINAL IMAGE. The end result should be purely geometric. The drawing must be perfectly level, and if the original plan is tilted, the final output must be corrected and perfectly aligned horizontally/vertically. CONTENTS: The exact floor plan, including the number, dimensions and location of all rooms, walls, doors, windows, must be accurately reproduced "one to one" from the provided image. YOU SHOULD NOT INTRODUCE NEW ROOMS OR MAKE CHANGES TO THE LAYOUT. STRICTLY ARRANGE A MINIMUM OF ONE DIVERSE PIECE OF FURNITURE IN EVERY SINGLE ROOM, PLACING EACH ITEM LOGICALLY ACCORDING TO ROOM FUNCTION. CREATE EVERYTHING WITH FURNITURE!

DON'T REPLY TO THE MESSAGE! JUST GENERATE IT!`
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
 * @param {string} model - Модель: 'boston' или 'melbourne'
 * @returns {Promise<Buffer>} - Буфер с сгенерированным изображением
 */
export async function generateTechnicalPlan(imagePath, mode = 'withoutFurniture', model = 'boston') {
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

  // Выбираем промпт в зависимости от модели и режима
  let promptKey;
  if (model === 'boston') {
    promptKey = `boston_${mode}`;
  } else if (model === 'melbourne') {
    // Для Melbourne используем специальные промпты
    promptKey = 'melbourne_step1';
  } else {
    // Обратная совместимость со старыми ключами
    promptKey = mode;
  }
  
  const prompt = PROMPTS[promptKey];
  if (!prompt) {
    throw new Error(`Неизвестный режим или модель: ${mode}, ${model}`);
  }

  try {
    console.log(`🎨 Генерация технического плана (модель: ${model}, режим: ${mode})`);
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
 * Добавляет мебель к Melbourne плану (шаг 2)
 * @param {string} imagePath - Путь к изображению плана
 * @returns {Promise<Buffer>} - Буфер с сгенерированным изображением
 */
export async function addFurnitureToMelbourne(imagePath) {
  // Проверяем доступность Buffer
  console.log('🔍 Проверка Buffer в addFurnitureToMelbourne:', {
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

  const prompt = PROMPTS['melbourne_step2'];

  try {
    console.log(`🎨 Добавление мебели к Melbourne плану`);
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

    console.log('📤 Отправка запроса к COMETAPI (Melbourne Step 2)...');
    console.log(`📝 Промпт: ${prompt}`);
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
    console.log('✅ Мебель успешно добавлена к Melbourne плану');
    console.log(`📊 Размер изображения: ${outBuffer.length} байт`);
    
    return outBuffer;

  } catch (error) {
    console.error('❌ Ошибка добавления мебели к Melbourne плану:', error);
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
