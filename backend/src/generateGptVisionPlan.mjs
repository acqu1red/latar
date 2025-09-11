import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a 2D floor plan using GPT-4o Vision with full room data
 * @param {Array} rooms - Array of room objects with layout, analysis, and connection data
 * @param {number} totalSqm - Total square meters
 * @returns {Promise<{pngDataUrl: string}>} Generated floor plan image
 */
export async function generateGptVisionPlan(rooms, totalSqm, bathroomConfig = null) {
  // Create detailed layout description with all data
  const layoutDescription = rooms.map(room => {
    const layout = room.layout || { x: 0, y: 0, width: 0.2, height: 0.2 };
    const objects = room.objects || [];
    const doors = room.doors || [];
    const windows = room.windows || [];
    const connections = room.connections || [];
    
    let roomInfo = `${room.name} (${room.sqm} м²): position (${(layout.x * 100).toFixed(0)}%, ${(layout.y * 100).toFixed(0)}%), size ${(layout.width * 100).toFixed(0)}% x ${(layout.height * 100).toFixed(0)}%`;
    
    if (objects.length > 0) {
      const majorObjects = objects.filter(obj => obj.w * obj.h > 0.02).slice(0, 4);
      if (majorObjects.length > 0) {
        roomInfo += `\n  - Furniture: ${majorObjects.map(obj => obj.type).join(', ')}`;
      }
    }
    
    if (doors.length > 0) {
      roomInfo += `\n  - Doors: ${doors.map(d => `${d.side} wall at ${(d.pos * 100).toFixed(0)}%`).join(', ')}`;
    }
    
    if (windows.length > 0) {
      roomInfo += `\n  - Windows: ${windows.map(w => `${w.side} wall at ${(w.pos * 100).toFixed(0)}%`).join(', ')}`;
    }
    
    if (connections.length > 0) {
      const connectedRooms = connections.map(key => rooms.find(r => r.key === key)?.name || key).join(', ');
      roomInfo += `\n  - Connected to: ${connectedRooms}`;
    }
    
    return roomInfo;
  }).join('\n\n');

  // Add bathroom configuration info
  let bathroomInfo = '';
  if (bathroomConfig) {
    bathroomInfo = `\n\nBATHROOM CONFIGURATION: ${bathroomConfig.type === 'combined' ? 'Combined bathroom and toilet' : 'Separate bathroom and toilet'}`;
  }

  const prompt = `Top-down 2D apartment floor plan in ultra-minimal line-art. Black lines on a white background only. Thick exterior walls, thinner interior walls. Uniform stroke weight; no shadows, no color, no textures, no hatching. Doors as gaps with quarter-circle swing arcs; windows as thin double lines in the walls. Allowed furniture icons only: simple silhouettes of a bed, sofa, coffee table, bathtub, toilet, sink, stove, armchair. No text, labels, dimensions, numbers, arrows, legends, compass, scale, or grid. No perspective—strictly top-down. Centered layout with small margins. Square image.

Room layout specifications:
${layoutDescription}${bathroomInfo}

Follow the exact room positions and sizes provided above. Total area: ${totalSqm} square meters.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an architectural designer. Create minimalistic 2D floor plans based on exact specifications. Follow the layout coordinates precisely."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000
    });

    // GPT-4o doesn't generate images directly, so we'll use DALL-E with the refined prompt
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "standard", // или "hd" для лучшего качества
      style: "natural", // или "vivid"
    });

    const b64Json = imageResponse.data[0].b64_json;
    if (!b64Json) {
      throw new Error("OpenAI API did not return a base64 JSON image.");
    }
    
    return {
      pngDataUrl: `data:image/png;base64,${b64Json}`,
    };
  } catch (error) {
    console.error("Error calling OpenAI Vision API:", error);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.status} ${error.name} - ${error.message}`);
    }
    throw new Error("Failed to generate floor plan from OpenAI Vision API.");
  }
}
