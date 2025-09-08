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
  const prompt = `Create a simple, clean 2D floor plan of an APARTMENT (not a house) with total area ${totalSqm} sq meters. Rooms: ${roomDescriptions}. 
REQUIREMENTS:
- Simple schematic apartment layout with rectangular rooms
- Only basic furniture icons (bed, sofa, table, chairs, kitchen appliances)
- No outdoor areas, no gardens, no decorative elements
- Black lines on white background
- Minimal, architectural blueprint style
- Show only essential furniture, no plants or decorations
- This is an INDOOR apartment plan, not a house with yard`;

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
