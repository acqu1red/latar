import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a floor plan image using DALL-E as a fallback.
 *
 * @param {Array<object>} rooms - The list of enabled rooms with their names and sqm.
 * @param {number} totalSqm - The total square meters.
 * @returns {Promise<{pngDataUrl: string}>} An object containing the base64 data URL of the generated PNG image.
 */
export async function generateImageFallback(rooms, totalSqm) {
  const roomDescriptions = rooms.map(r => `${r.name} (${r.sqm} м²)`).join(', ');
  const prompt = `Create a clean, modern, 2D top-down architectural floor plan for an apartment with a total area of approximately ${totalSqm} sq meters. The apartment includes the following rooms: ${roomDescriptions}. Show the layout of the rooms with furniture. Do not include any text, labels, or dimensions. The style should be minimalist and clear, with black lines on a white background.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3", // Or another suitable image model
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64Json = response.data[0].b64_json;
    if (!b64Json) {
        throw new Error("The OpenAI API did not return a base64 JSON image.");
    }
    
    return {
      pngDataUrl: `data:image/png;base64,${b64Json}`,
    };
  } catch (error) {
    console.error("Error calling OpenAI Image API:", error);
    throw new Error("Failed to generate image fallback from OpenAI API.");
  }
}
