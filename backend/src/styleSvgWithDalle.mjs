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
  // Extract base64 data from data URL
  const base64Data = svgDataUrl.split(',')[1];
  
  const roomDescriptions = rooms.map(r => `${r.name} (${r.sqm} м²)`).join(', ');
  
  const prompt = `НАРИСУЙ плоский 2D-план квартиры строго по данным JSON.
Чёрные линии на белом фоне. Толстые внешние стены, тоньше внутренние. Единая толщина для каждой группы, без теней/цвета/текстур/штриховки. Никаких текстов, цифр, размеров, стрелок, легенд, компаса, сетки. Вид строго сверху.
Координаты — в пикселях, система координат: (0,0) — левый верхний угол, ось X вправо, Y вниз. Размер холста брать из canvas.width/height. Ничего не выравнивай и не центрируй, используй позиции из JSON как есть.
Запреты: не добавляй объекты, которых нет в JSON; не меняй размеры; не «исправляй» пересечения; не округляй числа. При конфликте данных следуй JSON. Если чего-то не хватает — оставь пусто.
Допустимые пиктограммы мебели/сантехники: кровать, диван, столик, ванна, унитаз, раковина, плита, кресло. Двери — проём + дуга четверть-окружности по полю swing. Окна — двойные тонкие линии.

Use only objects listed in JSON; if an element is absent, do not render it.
1 JSON unit = 1 pixel on the canvas.
Draw walls → windows → doors → fixtures → furniture; do not reorder.
If any value is invalid or outside the canvas, skip that element instead of guessing.
Square 1024×1024.

Rooms: ${roomDescriptions}
Total area: ${totalSqm} square meters.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "standard",
      style: "natural"
    });

    const b64Json = response.data[0].b64_json;
    if (!b64Json) {
      throw new Error("OpenAI API did not return a base64 JSON image.");
    }
    
    return {
      pngDataUrl: `data:image/png;base64,${b64Json}`,
    };
  } catch (error) {
    console.error("Error styling SVG with DALL-E:", error);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.status} ${error.name} - ${error.message}`);
    }
    throw new Error("Failed to style floor plan with DALL-E.");
  }
}
