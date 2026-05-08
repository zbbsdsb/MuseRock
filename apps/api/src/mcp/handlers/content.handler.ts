import { Injectable } from '@nestjs/common';
import { AIService } from '../../ai/ai.service';
import { MCPHandler } from './handler.registry';
import { GenerateContentParams, GenerateContentResult } from '../types/mcp.types';
import { ProviderType } from '../../ai/adapters/adapter.factory';

@Injectable()
export class ContentHandler implements MCPHandler {
  constructor(private readonly aiService: AIService) {}

  getMethodName(): string {
    return 'generate_content';
  }

  async execute(params: Record<string, unknown>): Promise<GenerateContentResult> {
    const genParams = params as unknown as GenerateContentParams;
    const startTime = Date.now();

    const provider = this.mapModelToProvider(genParams.model);
    
    const result = await this.aiService.generateContent({
      prompt: genParams.prompt,
      role: 'writer',
      provider,
      options: genParams.parameters ? {
        temperature: genParams.parameters.temperature,
        maxTokens: genParams.parameters.maxTokens,
        topP: genParams.parameters.topP,
        frequencyPenalty: genParams.parameters.frequencyPenalty,
      } : undefined,
    });

    return {
      content: result.content,
      model: genParams.model || 'gpt-4',
      usage: {
        promptTokens: result.tokensUsed?.prompt || 0,
        completionTokens: result.tokensUsed?.completion || 0,
        totalTokens: result.tokensUsed?.total || 0,
      },
      latency: Date.now() - startTime,
      citations: [],
    };
  }

  private mapModelToProvider(model?: string): ProviderType {
    if (!model) return 'openai';
    
    if (model.startsWith('gemini')) return 'gemini';
    if (model.startsWith('claude')) return 'openai';
    
    return 'openai';
  }
}