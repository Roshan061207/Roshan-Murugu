
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NutritionInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFood = async (input: string | { data: string, mimeType: string }): Promise<{
  name: string;
  nutrition: NutritionInfo;
  insight: string;
}> => {
  const modelName = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are AuraNutri AI, a supportive nutritional assistant. 
    Analyze the provided food (text or image) and return structured nutritional data.
    Focus on positive reinforcement and mindful reflection.
    Return JSON only.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Common name of the food" },
      nutrition: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER, description: "in grams" },
          carbs: { type: Type.NUMBER, description: "in grams" },
          fat: { type: Type.NUMBER, description: "in grams" },
          fiber: { type: Type.NUMBER },
          sugar: { type: Type.NUMBER },
          vitamins: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["calories", "protein", "carbs", "fat"]
      },
      insight: { type: Type.STRING, description: "An empathetic, positive insight about how this food supports the user's wellbeing." }
    },
    required: ["name", "nutrition", "insight"]
  };

  const contents = typeof input === 'string' 
    ? { parts: [{ text: `Analyze this meal: ${input}` }] }
    : { parts: [
        { inlineData: input },
        { text: "Identify the food in this image and provide nutritional data." }
      ] };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
    }
  });

  return JSON.parse(response.text || '{}');
};
