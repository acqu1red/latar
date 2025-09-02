/**
 * Extracts the first valid JSON object from a string.
 * It handles cases where the JSON is embedded within other text or code blocks.
 *
 * @param {string} str The string to parse.
 * @returns {object | null} The parsed JSON object, or null if no valid JSON is found.
 */
export function parseJson(str) {
  if (!str || typeof str !== 'string') {
    return null;
  }

  // Attempt to find JSON within markdown code blocks (```json ... ```)
  const jsonMarkdownRegex = /```json\s*([\s\S]*?)\s*```/;
  const markdownMatch = str.match(jsonMarkdownRegex);
  if (markdownMatch && markdownMatch[1]) {
    try {
      return JSON.parse(markdownMatch[1]);
    } catch (e) {
      // Ignore parsing errors here and proceed to the next method
    }
  }

  // Attempt to find the first occurrence of a JSON object using regex
  const jsonRegex = /{\s*["'a-zA-Z]/;
  const startIndex = str.search(jsonRegex);

  if (startIndex === -1) {
    return null;
  }

  // Use a counter to find the matching closing brace
  let braceCount = 0;
  let endIndex = -1;

  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') {
      braceCount++;
    } else if (str[i] === '}') {
      braceCount--;
    }

    if (braceCount === 0) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return null;
  }

  const jsonString = str.substring(startIndex, endIndex + 1);

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse extracted JSON string:", error);
    return null;
  }
}
