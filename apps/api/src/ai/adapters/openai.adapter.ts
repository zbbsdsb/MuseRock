import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAI } from 'openai';
import { BaseModelAdapter, ModelResponse, ModelOptions } from './base.adapter';

@Injectable()
export class OpenAIAdapter extends BaseModelAdapter {
  provider = 'openai';
  private client: OpenAI;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    super({
      apiKey: config.apiKey,
      defaultModel: 'gpt-4o-mini',
      baseUrl: config.baseUrl,
    });
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateContent(prompt: string, systemPrompt: string, options: ModelOptions): Promise<ModelResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.config.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        top_p: options.topP,
        presence_penalty: options.presencePenalty,
        frequency_penalty: options.frequencyPenalty,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      });

      return {
        content: response.choices[0].message.content || '',
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        finishReason: response.choices[0].finish_reason,
        model: response.model,
      };
    } catch (error) {
      throw new HttpException(
        `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
