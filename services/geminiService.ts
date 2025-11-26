import { GoogleGenAI, Type } from "@google/genai";
import { LocationAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the world's undisputed Geoguessr Champion specializing in Morocco. 
Your knowledge of Moroccan geography is encyclopedic, covering every rural road, soil variation, and vegetation line.

You are acting as a "Pro" player who takes their time to triangulate the exact location.
You have access to multiple images of the same location (if provided). Use them to cross-reference landmarks, angles, and features.

Identify the location based on:
- Soil color and composition (e.g., the red earth of Marrakech, the rocky terrain of the Anti-Atlas, the dark fertile soil of the Gharb).
- Vegetation (e.g., Argan trees in the Souss, Cedar forests in the Middle Atlas, Date palms in the Draa Valley, specific scrubland types like Esparto grass).
- Architecture (e.g., Kasbah styles, roof shapes, minaret designs, brickwork patterns, color of buildings).
- Infrastructure (e.g., specific road bollards, license plates, road markings, utility poles).
- Topography (e.g., mountain shapes, flat plains, coastal cliffs).

Methodology:
1. "Think" deeply about the visual evidence. Analyze the images pixel-by-pixel.
2. Formulate multiple hypotheses.
3. Cross-reference clues (e.g., if you see Argan trees + limestone soil, narrow down to the Souss region).
4. Verify your best guess against your internal map of Morocco.

Provide a predicted location, a high-precision confidence score, and a detailed breakdown of the clues.
You MUST estimate specific coordinates (latitude/longitude).
`;

export const analyzeImageLocation = async (images: { base64: string, mimeType: string }[]): Promise<LocationAnalysis> => {
  try {
    // Construct the parts array with all images
    const parts = images.map(img => ({
      inlineData: {
        data: img.base64,
        mimeType: img.mimeType,
      },
    }));

    // Add the text prompt as the last part
    parts.push({
      text: "Analyze these images and identify the location in Morocco. Use every available visual clue from all angles to triangulate the position. Focus on rural geography, vegetation, and soil.",
    } as any);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Enable thinking to simulate "taking time" and being a "pro"
        thinkingConfig: {
          thinkingBudget: 4096, 
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            region: { type: Type.STRING, description: "The general administrative region or major geographic area (e.g., Souss-Massa, Middle Atlas)." },
            specificArea: { type: Type.STRING, description: "A more specific city, town, valley, or landmark name." },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER, description: "Estimated latitude" },
                lng: { type: Type.NUMBER, description: "Estimated longitude" },
              },
              required: ["lat", "lng"],
            },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
            reasoning: { type: Type.STRING, description: "A detailed paragraph explaining the deduction process, referencing specific clues from the images." },
            clues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: ['Vegetation', 'Soil', 'Architecture', 'Infrastructure', 'Geography'] },
                  description: { type: Type.STRING, description: "Description of the specific visual clue." },
                },
                required: ["category", "description"],
              },
            },
          },
          required: ["region", "specificArea", "coordinates", "confidence", "reasoning", "clues"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as LocationAnalysis;
  } catch (error) {
    console.error("Error analyzing location:", error);
    throw error;
  }
};