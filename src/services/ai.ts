import { GoogleGenAI } from "@google/genai";

export class AIService {
  private genAI: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  async getInspiration(context: string, type: string) {
    if (!this.genAI) throw new Error("API Key not configured");
    
    // We'll use the prompt-based approach as per gemini-api skill
    const response = await this.genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context}\n\nTask: Provide creative inspiration for a creator based on this context. Focus on ${type}. Keep it brief, evocative, and high-impact. Avoid clichés.`,
      config: {
          systemInstruction: "You are MuseRock, an elite creative collaborator. You provide sharp, non-obvious insights and materials for creators.",
          temperature: 0.8
      }
    });

    return response.text;
  }

  async sourceAssets(query: string) {
    if (!this.genAI) throw new Error("API Key not configured");

    const response = await this.genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search Query: ${query}\n\nTask: Act as a research assistant. Find 3-5 high-quality references, data points, or sources relevant to this query. Categorize them and explain why they are valuable for a creator.`,
      config: {
          systemInstruction: "You are MuseRock Research. You find deep references (scientific, historical, artistic) that others miss.",
          temperature: 0.3
      }
    });

    return response.text;
  }
}
