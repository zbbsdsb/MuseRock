import { ModelAdapter, ModelOptions, ModelResponse } from './base.adapter';
import { OpenAIAdapter } from './openai.adapter';
import { GeminiAdapter } from './gemini.adapter';
import { AnthropicAdapter } from './anthropic.adapter';

export type ProviderType = 'openai' | 'gemini' | 'anthropic';

export class ModelAdapterFactory {
  private adapters: Map<ProviderType, ModelAdapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (openaiKey) {
      this.adapters.set('openai', new OpenAIAdapter({ apiKey: openaiKey }));
    }

    if (geminiKey) {
      this.adapters.set('gemini', new GeminiAdapter({ apiKey: geminiKey }));
    }

    if (anthropicKey) {
      this.adapters.set('anthropic', new AnthropicAdapter({ apiKey: anthropicKey }));
    }
  }

  getAdapter(provider: ProviderType): ModelAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Provider ${provider} is not configured or not supported`);
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

  addAdapter(provider: ProviderType, adapter: ModelAdapter): void {
    this.adapters.set(provider, adapter);
  }

  static validateApiKey(provider: ProviderType, apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }
    
    const key = apiKey.trim();
    
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20;
      case 'gemini':
        return key.length > 10;
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 20;
      default:
        return false;
    }
  }
}
