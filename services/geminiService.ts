import { GoogleGenAI, Type } from "@google/genai";
import { Dish, SuggestionResult } from "../types";

export const getAiSuggestion = async (dishes: Dish[]): Promise<SuggestionResult> => {
  if (dishes.length === 0) throw new Error("No dishes available");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a helpful culinary assistant. 
    Based on the following list of dishes the user likes, pick ONE for dinner today.
    Provide an encouraging and appetizing reason why you picked it.
    
    Dishes:
    ${dishes.map(d => `ID: ${d.id}, Name: ${d.name}, Category: ${d.category}`).join('\n')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishId: { type: Type.STRING, description: "The ID of the selected dish" },
          reason: { type: Type.STRING, description: "Short appetizing reason for the choice" }
        },
        required: ["dishId", "reason"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const result = JSON.parse(text);
    const selectedDish = dishes.find(d => d.id === result.dishId) || dishes[Math.floor(Math.random() * dishes.length)];
    
    return {
      dish: selectedDish,
      reason: result.reason || "This looks like a great choice for today!"
    };
  } catch (e) {
    console.error("AI parse error:", e);
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    return {
      dish: randomDish,
      reason: "I think you'll really enjoy this today!"
    };
  }
};