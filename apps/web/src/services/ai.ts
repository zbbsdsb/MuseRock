import { GoogleGenAI } from "@google/genai";
import { ApiProvider } from "../types";

export class AIService {
  private geminiGenAI: GoogleGenAI | null = null;
  private provider: ApiProvider;
  private apiKey: string;

  constructor(provider: ApiProvider, apiKey: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    
    if (provider === 'gemini' && apiKey) {
      this.geminiGenAI = new GoogleGenAI({ apiKey });
    }
  }

  async getInspiration(context: string, type: string) {
    if (!this.apiKey) throw new Error("API Key not configured");
    
    if (this.provider === 'gemini' && this.geminiGenAI) {
      const response = await this.geminiGenAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Context: ${context}\n\nTask: Provide creation assistance for a creator based on this context. Focus on ${type}. Keep it brief, evocative, and high-impact. Avoid clichés.`,
        config: {
            systemInstruction: "You are MuseRock, an elite creation assistant. You provide sharp, non-obvious insights and materials for creators across various disciplines.",
            temperature: 0.8
        }
      });
      return response.text;
    }
    
    if (this.provider === 'openai' || this.provider === 'anthropic') {
        return `Experimental support for ${this.provider} is being integrated. Please ensure your key is valid. (Implementation pending SDK integration). In the meantime, MuseRock recommends the Gemini provider for stable results.`;
    }

    return "Provider not yet fully implemented.";
  }

  async sourceAssets(query: string) {
    if (!this.apiKey) throw new Error("API Key not configured");

    if (this.provider === 'gemini' && this.geminiGenAI) {
      const response = await this.geminiGenAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search Query: ${query}\n\nTask: Act as a creation assistant. Find 3-5 high-quality references, data points, or sources relevant to this query. Categorize them and explain why they are valuable for a creator.`,
        config: {
            systemInstruction: "You are MuseRock Creation Assistant. You find deep references (scientific, historical, artistic) that others miss for creators across various disciplines.",
            temperature: 0.3
        }
      });
      return response.text;
    }

    return `Sourcing assets via ${this.provider} is currently in alpha. Use Gemini for the full experience.`;
  }
}
