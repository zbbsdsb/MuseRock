import { Injectable } from '@nestjs/common';

export interface ModelResponse {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
  model?: string;
}

export interface ModelAdapter {
  provider: string;
  generateContent(prompt: string, systemPrompt: string, options: ModelOptions): Promise<ModelResponse>;
  supportsStructuredOutput(): boolean;
}

export interface ModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  responseFormat?: 'json' | 'text';
}

export interface ModelConfig {
  apiKey: string;
  defaultModel: string;
  baseUrl?: string;
}

@Injectable()
export abstract class BaseModelAdapter implements ModelAdapter {
  constructor(protected config: ModelConfig) {}
  
  abstract provider: string;
  abstract generateContent(prompt: string, systemPrompt: string, options: ModelOptions): Promise<ModelResponse>;
  
  supportsStructuredOutput(): boolean {
    return true;
  }
}
