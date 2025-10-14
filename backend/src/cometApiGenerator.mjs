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
  withoutFurniture: `You are a professional architectural draftsman, and people's lives depend on your work.
Redraw this 2D apartment floor plan into a high-quality technical drawing, accurately preserving all proportions and the exact locations of walls, doors, windows, and plumbing. Do NOT change the layout.

HARD BAN — NO TEXT / NO NUMBERS (GLOBAL, TOP PRIORITY)
• Absolutely no text of any kind on the final image.
• No room names, legends, labels, titles, watermarks, symbols with letters, or any annotations.
• No digits 0–9; no decimals/fractions; no ordinals (“1st/2nd”); no ranges (“3–5”); no dates; no scales; no coordinates; no degrees.
• No spelled-out numbers or ordinal words (“one, two…”, “first, second…”). Treat ALL words that represent quantities as forbidden.
• No units with or without numbers (“m²”, “cm”, “mm”, “deg”, “ft”, “in”, etc.).
• If any step attempts to add text or numbers, BLOCK and OMIT it.
• Output only geometry and symbols (walls, doors, windows, fixtures) as shapes/paths.
• Ensure there are ZERO text layers (including hidden/empty/locked). Final export must be pure graphics.

VISUAL STYLE (STRICT)
• Background: pure white (#FFFFFF).
• All lines and all fills: pure black (#000000) ONLY. No grayscale, no gradients, no patterns, no anti-aliased gray fringe, no transparency (alpha = 1).
• Canvas: 1200×1200 px; JPG quality 95%. No borders, titles, or dimension lines.

WALLS — SOLID BLACK #000000 (MANDATORY)
• External load-bearing walls: draw as solid polygons with black fill #000000; apparent thickness 4–5 px.
• Internal load-bearing walls: solid black fill #000000; apparent thickness 3 px.
• Partitions: solid black fill #000000; apparent thickness 2 px.
• No hatching, no textures, no outlines of other colors; only solid #000000 mass for wall bodies. Edges must be crisp (no dithering).
• Preserve all existing wall geometry (including diagonal/curved segments) exactly.

OPENINGS & FIXTURES
• Doors: show opening arc (1 px dashed line) + shortened door leaf; must not intersect walls incorrectly.
• Windows: double frame 2 px; glass indicated with diagonal hatching at 45° (black lines on white; do NOT place any text/marks).
• Plumbing fixtures: draw as simple black outlines/icons (no letters, no size labels).

INPUT NORMALIZATION — STRAIGHTEN & RECTIFY (REQUIRED)
• If the source is rotated/skewed/perspective-distorted:
– Rotate to the nearest 0°/90°/180°/270° so any original text (if present in the source) appears upright only during analysis (do NOT copy it).
– Deskew to orthogonal grid; apply perspective rectification to orthographic top-down (no foreshortening).
• Preserve relative proportions while rectifying; do not invent or move openings/walls.
• Remove background, shadows, paper edges; redraw as a clean vector-like plan.

FURNITURE POLICY — PRESERVE ONLY (SAFE MODE)
• Preserve ALL existing furniture/sanitary fixtures exactly as in the source.
• Do NOT add new furniture items if they are not present in the source.
• Furniture line thickness: 1 px; simple 2D icons; align to walls; no labels, no text.

PLACEMENT & CLEARANCES (NON-TEXTUAL)
• Keep walkways and fixture clearances logically unobstructed.
• Do not block door swings, windows, radiators, or plumbing.
• If any clearance cannot be represented without using text or numbers, omit the label and keep only geometry.

QUALITY CHECK — ENFORCEMENT BEFORE EXPORT

Scan all layers and objects: there must be ZERO text elements (including hidden, locked, or empty text frames).

Verify all wall bodies are solid fills of pure #000000 (no gray pixels, no semi-transparent edges).

Verify background is pure #FFFFFF.

Verify there are NO dimension lines, tick marks with numbers, scale bars, or any numeric graphics.

Export at 1200×1200 px, JPG 95%, with only pure black graphics on pure white background.

OVERRIDE PRECEDENCE
• The “NO TEXT / NO NUMBERS” and “WALLS SOLID BLACK #000000” rules override ANY other instruction.
• If a rule would require text or numeric annotation, omit that annotation entirely and keep only the geometry.
• Final image MUST be visually clean: pure geometry, zero text, zero numbers.`
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
