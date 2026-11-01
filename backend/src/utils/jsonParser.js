/**
 * Mistral sometimes wraps JSON in ```json fences or adds stray text.
 * This extracts and safely parses the first valid JSON object found.
 */
function extractJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or invalid response text from Mistral");
  }

  // Strip markdown code fences if present
  let cleaned = rawText.trim().replace(/```json/gi, "").replace(/```/g, "");

  // Grab the substring between the first { and the last }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in Mistral response");
  }

  const jsonSlice = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonSlice);
  } catch (err) {
    throw new Error(`Failed to parse JSON from Mistral response: ${err.message}`);
  }
}

export { extractJson };
