import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { AIService, GenerationRequest } from '../../ai/ai.service';
import { MCPHandler } from './handler.registry';
import { Tool, GenerateContentParams, GenerateContentResult } from '../types/mcp.types';
import { ProviderType } from '../../ai/adapters/adapter.factory';

/**
 * 内容生成工具：使用 AI 生成写作内容
 */
@Injectable()
export class ContentHandler implements MCPHandler {
  constructor(private readonly aiService: AIService) {}

  getMethodName(): string {
    return 'generate_content';
  }

  getToolDefinition(): Tool {
    return {
      name: 'generate_content',
      description:
        'Generate content using AI models. Supports multiple providers including Gemini, Claude, and GPT. Can optionally include memory context from your project.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The prompt/instructions for content generation',
          },
          model: {
            type: 'string',
            description: 'AI model to use',
            enum: [
              'gemini-1.5-pro',
              'gemini-2.0-flash',
              'claude-3-opus',
              'claude-3-5-sonnet',
              'gpt-4o',
              'gpt-4-turbo',
            ],
            default: 'gemini-2.0-flash',
          },
          parameters: {
            type: 'object',
            description: 'Generation parameters',
            properties: {
              temperature: {
                type: 'number',
                description: 'Controls randomness (0 = deterministic, 1 = creative)',
                minimum: 0,
                maximum: 2,
                default: 0.7,
              },
              maxTokens: {
                type: 'number',
                description: 'Maximum tokens in the response',
                minimum: 1,
                maximum: 8192,
                default: 2048,
              },
              topP: {
                type: 'number',
                description: 'Nucleus sampling threshold',
                minimum: 0,
                maximum: 1,
                default: 0.9,
              },
              frequencyPenalty: {
                type: 'number',
                description: 'Reduces repetition of the same tokens',
                minimum: 0,
                maximum: 2,
                default: 0,
              },
            },
          },
          stream: {
            type: 'boolean',
            description: 'Whether to stream the response (not supported yet)',
            default: false,
          },
          memoryContext: {
            type: 'object',
            description: 'Optional memory context to include',
            properties: {
              projectId: {
                type: 'string',
                description: 'Project ID for context',
              },
              includeMemory: {
                type: 'boolean',
                description: 'Whether to include memory in the generation',
                default: true,
              },
            },
          },
        },
        required: ['prompt'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    };
  }

  async execute(params: Record<string, unknown>): Promise<GenerateContentResult> {
    const validatedParams = this.validateParams(params);
    const startTime = Date.now();

    const provider = this.mapModelToProvider(validatedParams.model);

    const result = await this.aiService.generateContent({
      prompt: validatedParams.prompt,
      role: 'writer',
      provider,
      options: validatedParams.parameters
        ? {
            temperature: validatedParams.parameters.temperature,
            maxTokens: validatedParams.parameters.maxTokens,
            topP: validatedParams.parameters.topP,
            frequencyPenalty: validatedParams.parameters.frequencyPenalty,
          }
        : undefined,
    });

    return {
      content: result.content,
      model: validatedParams.model || 'gemini-2.0-flash',
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
    if (!model) return 'gemini';

    if (model.startsWith('gemini')) return 'gemini';
    if (model.startsWith('claude')) return 'anthropic';
    if (model.startsWith('gpt')) return 'openai';

    return 'gemini';
  }

  private validateParams(params: Record<string, unknown>): GenerateContentParams {
    const schema = z.object({
      prompt: z.string().min(1, 'Prompt cannot be empty'),
      model: z
        .enum([
          'gemini-1.5-pro',
          'gemini-2.0-flash',
          'claude-3-opus',
          'claude-3-5-sonnet',
          'gpt-4o',
          'gpt-4-turbo',
        ])
        .optional()
        .default('gemini-2.0-flash'),
      parameters: z
        .object({
          temperature: z.number().min(0).max(2).optional().default(0.7),
          maxTokens: z.number().int().min(1).max(8192).optional().default(2048),
          topP: z.number().min(0).max(1).optional().default(0.9),
          frequencyPenalty: z.number().min(0).max(2).optional().default(0),
        })
        .optional()
        .default({
          temperature: 0.7,
          maxTokens: 2048,
          topP: 0.9,
          frequencyPenalty: 0,
        }),
      stream: z.boolean().optional().default(false),
      memoryContext: z
        .object({
          projectId: z.string().optional(),
          includeMemory: z.boolean().optional().default(true),
        })
        .optional(),
    });

    return schema.parse(params);
  }
}
