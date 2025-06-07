
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { Truck, GroundingChunk } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Gemini features will be unavailable.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getSimpleTruckInsights = async (trucks: Truck[]): Promise<string> => {
  if (!ai) return "Gemini API key not configured. Insights unavailable.";
  if (trucks.length === 0) return "No truck data available to analyze.";

  const truckSummary = trucks.slice(0, 5).map(t => 
    `- Truck ${t.plateNumber}: ${t.location}, ${t.distance ? `${t.distance.toFixed(0)}m away` : 'distance unknown'}${t.isWatched ? ' (Watched)' : ''}`
  ).join('\n');

  const prompt = `
    You are a helpful assistant for users of a garbage truck tracking app in Kaohsiung.
    Here is a summary of some nearby or watched trucks:
    ${truckSummary}

    Briefly provide one interesting observation or a general piece of advice related to garbage collection based on this data. Be concise and friendly.
    Example: "It looks like truck ${trucks[0]?.plateNumber || 'ABC-123'} is quite close! Remember to prepare your trash in advance."
    Or, if many are watched: "You're keeping an eye on several trucks! Good job staying informed about collection times."
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights from Gemini:", error);
    return "Sorry, I couldn't fetch insights at the moment.";
  }
};


export const queryGeminiWithGrounding = async (query: string): Promise<{text: string, sources: GroundingChunk[]}> => {
  if (!ai) return {text: "Gemini API key not configured. Search unavailable.", sources: []};

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {text: response.text, sources};

  } catch (error) {
    console.error("Error querying Gemini with grounding:", error);
    if (error instanceof Error && error.message.includes("application/json")) {
       return {text: "Sorry, I encountered an issue with the search tool. Please try a different query.", sources:[]};
    }
    return {text: "Sorry, I couldn't perform the search at the moment.", sources:[]};
  }
};
    