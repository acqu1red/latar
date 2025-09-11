import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Styles an existing SVG floor plan using DALL-E for better visual quality
 * @param {string} svgDataUrl - Base64 SVG data URL
 * @param {Array} rooms - Room data for context
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{pngDataUrl: string}>} Styled floor plan image
 */
export async function styleSvgWithDalle(svgDataUrl, rooms, totalSqm) {
  // Image A: our precise SVG as PNG input
  const imageA = svgDataUrl;

  const prompt = [
    'Перерисуй входное изображение как строго минималистичный плоский 2D‑план квартиры.',
    'Используй вход ТОЛЬКО как геометрию (точные контуры стен/проёмов/окон/иконок).',
    'Ничего не добавляй, не удаляй и не смещай. Сохрани пропорции и позиции один в один.',
    'Стиль: чёрные линии на белом фоне; без текста, цифр, размеров, стрелок, легенд, компаса, сетки, теней и цвета.',
    'Толщины: внешние стены 24 px; внутренние стены 12 px; иконки/сантехника 6 px.',
    'Двери: проём + четверть‑дуги хода. Окна: две параллельные тонкие линии в стене.',
    'Если элемент отсутствует на входном изображении — не рисуй. Если распознать нельзя — сохрани как есть, без догадок.',
    'Холст 1024×1024, поля по 36 px; ничего не центрируй и не масштабируй автоматически.',
    'Строго content‑preserving redraw. Do not invent.'
  ].join('\n');

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
      image: imageA,
      // Some SDKs don't support multi-image directly; if unsupported, we still have A as strict guide
      quality: 'standard',
      style: 'natural'
    });

    const b64Json = response.data[0]?.b64_json;
    if (!b64Json) {
      throw new Error('OpenAI API did not return a base64 JSON image.');
    }
    return { pngDataUrl: `data:image/png;base64,${b64Json}` };
  } catch (error) {
    console.error('Error styling SVG with DALL-E:', error);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.status} ${error.name} - ${error.message}`);
    }
    throw new Error('Failed to style floor plan with DALL-E.');
  }
}
