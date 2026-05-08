import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ModelAdapter, ModelOptions, ModelResponse } from './base.adapter';
import { OpenAIAdapter } from './openai.adapter';
import { GeminiAdapter } from './gemini.adapter';

export type ProviderType = 'openai' | 'gemini' | 'anthropic';

@Injectable()
export class ModelAdapterFactory {
  private adapters: Map<ProviderType, ModelAdapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey) {
      this.adapters.set('openai', new OpenAIAdapter({ apiKey: openaiKey }));
    }

    if (geminiKey) {
      this.adapters.set('gemini', new GeminiAdapter({ apiKey: geminiKey }));
    }
  }

  getAdapter(provider: ProviderType): ModelAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new HttpException(
        `Provider ${provider} is not configured or not supported`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return adapter;
  }

  getAvailableProviders(): ProviderType[] {
    return Array.from(this.adapters.keys());
  }

  async generateContent(
    provider: ProviderType,
    prompt: string,
    systemPrompt: string,
    options: ModelOptions,
  ): Promise<ModelResponse> {
    const adapter = this.getAdapter(provider);
    return adapter.generateContent(prompt, systemPrompt, options);
  }
}
