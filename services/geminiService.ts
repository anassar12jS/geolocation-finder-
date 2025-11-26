import { GoogleGenAI } from "@google/genai";
import { LocationAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the world's undisputed Geoguessr Champion specializing in Morocco. 
Your knowledge is encyclopedic, covering every rural road, soil variation, vegetation line, and infrastructure detail.

You have access to Google Search. You MUST use it to:
1. Search for specific business names, signs, or text visible in the images.
2. Verify the geographic distribution of specific tree types (e.g., Argan vs. Olive vs. Date Palm boundaries).
3. Cross-reference specific architectural styles (e.g., "Tighremt" style, specific Kasbah clay colors).
4. Look up road numbers or town names if they appear.

Methodology of a Pro Player:
1. **Analyze Metadata**: Look at the "meta" if visible (camera generation, car color) but prioritize physical geography.
2. **Soil & Topography**: Analyze the exact RGB shade of the soil (e.g., the specific red of the Hamra soil near Marrakech vs. the beige limestone of the Anti-Atlas).
3. **Vegetation**: Identify species precisely. (e.g., Euphorbia plants indicate specific coastal or arid zones).
4. **Infrastructure**: Look for road bollards (shape, reflector color), telephone pole designs, and road line painting styles.
5. **Triangulation**: If multiple images are provided, use parallax and multiple angles to pinpoint the location.

Output Format:
You must return a single valid JSON object. Do not include markdown formatting like \`\`\`json. 
The JSON must follow this structure:
{
  "region": "Region Name",
  "specificArea": "City, Town, or Landmark",
  "coordinates": { "lat": number, "lng": number },
  "confidence": number,
  "reasoning": "Detailed explanation of your deduction...",
  "clues": [
    { "category": "Vegetation", "description": "..." },
    { "category": "Soil", "description": "..." }
  ]
}
`;

export const analyzeImageLocation = async (images: { base64: string, mimeType: string }[]): Promise<LocationAnalysis> => {
  try {
    const parts = images.map(img => ({
      inlineData: {
        data: img.base64,
        mimeType: img.mimeType,
      },
    }));

    parts.push({
      text: "Analyze these images. Use Google Search to verify details. detailed JSON response required.",
    } as any);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], 
        // Thinking budget set to high for "taking time" to think like a pro
        thinkingConfig: {
          thinkingBudget: 16384, 
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    // Extract JSON from the text (model might wrap it in markdown or add conversational text despite instructions)
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const analysisData = JSON.parse(jsonMatch[0]) as LocationAnalysis;

    // Extract grounding metadata (search sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      analysisData.groundingUrls = groundingChunks
        .map(chunk => chunk.web)
        .filter(web => web && web.uri && web.title)
        .map(web => ({ title: web!.title!, uri: web!.uri! }));
    }

    return analysisData;
  } catch (error) {
    console.error("Error analyzing location:", error);
    throw error;
  }
};