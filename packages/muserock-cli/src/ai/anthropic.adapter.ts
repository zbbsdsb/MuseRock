import Anthropic from '@anthropic-ai/sdk';
import { BaseModelAdapter, ModelResponse, ModelOptions } from './base.adapter';

export class AnthropicAdapter extends BaseModelAdapter {
  provider = 'anthropic';
  private client: Anthropic;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    super({
      apiKey: config.apiKey,
      defaultModel: 'claude-3-5-sonnet-20241022',
      baseUrl: config.baseUrl,
    });

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateContent(
    prompt: string,
    systemPrompt: string,
    options: ModelOptions,
  ): Promise<ModelResponse> {
    try {
      const response = await this.client.messages.create({
        model: options.model || this.config.defaultModel,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return {
        content: textContent || '',
        tokensUsed: {
          prompt: response.usage?.input_tokens || 0,
          completion: response.usage?.output_tokens || 0,
          total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        },
        finishReason: response.stop_reason || undefined,
        model: response.model,
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
