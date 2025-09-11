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
  const prompt = `Create a MINIMALISTIC 2D apartment floor plan. 
STRICT REQUIREMENTS:
- APARTMENT ONLY (not house, no outdoor areas)
- Black lines on white background
- Rectangular rooms only
- NO decorative elements, plants, colors, shadows
- NO text labels inside rooms
- NO detailed furniture - only basic rectangles for major items
- Architectural blueprint style - clean and schematic
- Rooms: ${roomDescriptions}
- Total area: ${totalSqm} sq meters

Style: Technical drawing, blueprint, schematic floor plan`;

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
    if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error: ${error.status} ${error.name} - ${error.message}`);
    }
    throw new Error("Failed to generate image fallback from OpenAI API.");
  }
}
