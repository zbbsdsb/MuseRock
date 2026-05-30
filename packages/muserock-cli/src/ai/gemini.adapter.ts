import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { BaseModelAdapter, ModelResponse, ModelOptions } from './base.adapter';

export class GeminiAdapter extends BaseModelAdapter {
  provider = 'gemini';
  private client: GoogleGenerativeAI;

  constructor(config: { apiKey: string }) {
    super({
      apiKey: config.apiKey,
      defaultModel: 'gemini-1.5-flash',
    });
    
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateContent(prompt: string, systemPrompt: string, options: ModelOptions): Promise<ModelResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: options.model || this.config.defaultModel,
        systemInstruction: systemPrompt,
      });

      const generationConfig: GenerationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1000,
        topP: options.topP,
        responseMimeType: options.responseFormat === 'json' ? 'application/json' : undefined,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();
      
      const promptTokens = Math.ceil((systemPrompt.length + prompt.length) / 4);
      const completionTokens = Math.ceil((text?.length || 0) / 4);

      return {
        content: text || '',
        tokensUsed: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        },
        finishReason: undefined,
        model: options.model || this.config.defaultModel,
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
