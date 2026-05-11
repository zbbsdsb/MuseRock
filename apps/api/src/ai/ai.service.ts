import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { ApiProvider } from '../api-keys/entities/api-key.entity';

@Injectable()
export class AIService {
  async generateContent(
    provider: ApiProvider,
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    switch (provider) {
      case 'gemini':
        return this.generateWithGemini(apiKey, prompt, systemPrompt, options);
      case 'openai':
        return this.generateWithOpenAI(apiKey, prompt, systemPrompt, options);
      case 'anthropic':
        return this.generateWithAnthropic(apiKey, prompt, systemPrompt, options);
      default:
        throw new HttpException(`Unsupported provider: ${provider}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getInspiration(
    provider: ApiProvider,
    apiKey: string,
    context: string,
    type: string,
  ): Promise<string> {
    const prompt = `Context: ${context}\n\nTask: Provide creation assistance for a creator based on this context. Focus on ${type}. Keep it brief, evocative, and high-impact. Avoid clichés.`;
    const systemPrompt = 'You are MuseRock, an elite creation assistant. You provide sharp, non-obvious insights and materials for creators across various disciplines.';
    
    const result = await this.generateContent(provider, apiKey, prompt, systemPrompt, {
      temperature: 0.8,
    });
    
    return result.content;
  }

  async sourceAssets(
    provider: ApiProvider,
    apiKey: string,
    query: string,
  ): Promise<string> {
    const prompt = `Search Query: ${query}\n\nTask: Act as a creation assistant. Find 3-5 high-quality references, data points, or sources relevant to this query. Categorize them and explain why they are valuable for a creator.`;
    const systemPrompt = 'You are MuseRock Creation Assistant. You find deep references (scientific, historical, artistic) that others miss for creators across various disciplines.';
    
    const result = await this.generateContent(provider, apiKey, prompt, systemPrompt, {
      temperature: 0.3,
    });
    
    return result.content;
  }

  private async generateWithGemini(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.getGenerativeModel({
      model: options.model || 'gemini-1.5-flash',
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    });

    const response = await result.response;
    const content = response.text();
    
    // Estimate tokens (Gemini doesn't provide exact token counts in the SDK)
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(content.length / 4);
    
    return {
      content,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
      },
    };
  }

  private async generateWithOpenAI(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    return {
      content,
      tokensUsed: {
        prompt: usage?.prompt_tokens || 0,
        completion: usage?.completion_tokens || 0,
        total: usage?.total_tokens || 0,
      },
    };
  }

  private async generateWithAnthropic(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new HttpException(
        `Anthropic API error: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const usage = data.usage;

    return {
      content,
      tokensUsed: {
        prompt: usage?.input_tokens || 0,
        completion: usage?.output_tokens || 0,
        total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
      },
    };
  }
}