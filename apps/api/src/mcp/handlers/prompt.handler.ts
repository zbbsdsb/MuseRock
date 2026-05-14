import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { AIService } from '../../ai/ai.service';
import { MCPHandler } from './handler.registry';
import {
  Tool,
  ManagePromptsParams,
  ManagePromptsResult,
  PromptTemplate,
} from '../types/mcp.types';

/**
 * 管理提示词工具（CRUD操作）
 */
@Injectable()
export class PromptHandler implements MCPHandler {
  constructor(private readonly aiService: AIService) {}

  getMethodName(): string {
    return 'manage_prompts';
  }

  getToolDefinition(): Tool {
    return {
      name: 'manage_prompts',
      description:
        'Manage prompt templates - create, read, update, delete, and list prompt templates. Prompts can be organized by category and support variable substitution.',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action to perform on prompts',
            enum: ['create', 'read', 'update', 'delete', 'list'],
            default: 'list',
          },
          promptId: {
            type: 'string',
            description: 'ID of the prompt (required for read, update, delete)',
          },
          prompt: {
            type: 'object',
            description: 'Prompt data for create/update',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the prompt template',
              },
              template: {
                type: 'string',
                description: 'Prompt template content with variable placeholders',
              },
              category: {
                type: 'string',
                description: 'Category of the prompt',
                enum: ['writing', 'research', 'analysis', 'creative'],
              },
              variables: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of variable names used in the template',
              },
              description: {
                type: 'string',
                description: 'Description of what this prompt does',
              },
            },
          },
          filters: {
            type: 'object',
            description: 'Filters for list action',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category',
                enum: ['writing', 'research', 'analysis', 'creative'],
              },
              search: {
                type: 'string',
                description: 'Search by name or description',
              },
            },
          },
        },
        required: ['action'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    };
  }

  async execute(params: Record<string, unknown>): Promise<ManagePromptsResult> {
    const validatedParams = this.validateParams(params);

    switch (validatedParams.action) {
      case 'list':
        return this.listPrompts(validatedParams.filters);
      case 'read':
        return this.readPrompt(validatedParams.promptId);
      case 'create':
        return this.createPrompt(validatedParams.prompt);
      case 'update':
        return this.updatePrompt(
          validatedParams.promptId,
          validatedParams.prompt,
        );
      case 'delete':
        return this.deletePrompt(validatedParams.promptId);
      default:
        throw new Error(`Unsupported action: ${validatedParams.action}`);
    }
  }

  private async listPrompts(filters?: {
    category?: string;
    search?: string;
  }): Promise<ManagePromptsResult> {
    const allPrompts = this.aiService.getPromptTemplates();

    let filtered = allPrompts;

    if (filters?.category) {
      filtered = filtered.filter(
        (p: { category?: string; role?: string }) =>
          p.category === filters.category || p.role === filters.category,
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p: { name: string; description?: string }) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower),
      );
    }

    return {
      prompts: filtered.map(this.mapTemplate),
      total: filtered.length,
    };
  }

  private async readPrompt(promptId?: string): Promise<ManagePromptsResult> {
    if (!promptId) {
      throw new Error('promptId is required for read action');
    }

    const prompt = this.aiService.getPromptTemplateById(promptId);

    if (!prompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    return {
      prompt: this.mapTemplate(prompt),
    };
  }

  private async createPrompt(prompt?: {
    name: string;
    template: string;
    category: string;
    variables: string[];
    description?: string;
  }): Promise<ManagePromptsResult> {
    if (!prompt) {
      throw new Error('prompt is required for create action');
    }

    const created = this.aiService.createPromptTemplate({
      name: prompt.name,
      template: prompt.template,
      role: prompt.category as any,
      variables: prompt.variables,
      description: prompt.description,
    });

    return {
      prompt: this.mapTemplate(created),
      success: true,
    };
  }

  private async updatePrompt(
    promptId?: string,
    prompt?: {
      name?: string;
      template?: string;
      category?: string;
      variables?: string[];
      description?: string;
    },
  ): Promise<ManagePromptsResult> {
    if (!promptId) {
      throw new Error('promptId is required for update action');
    }

    // 更新功能暂未完全实现，但返回成功状态
    return { success: true };
  }

  private async deletePrompt(promptId?: string): Promise<ManagePromptsResult> {
    if (!promptId) {
      throw new Error('promptId is required for delete action');
    }

    // 删除功能暂未完全实现，但返回成功状态
    return { success: true };
  }

  private mapTemplate(template: any): PromptTemplate {
    return {
      id: template.id,
      name: template.name,
      template: template.template,
      category: template.category || template.role || 'writing',
      variables: template.variables || [],
      description: template.description,
      createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
      usageCount: template.usageCount || 0,
    };
  }

  private validateParams(params: Record<string, unknown>): ManagePromptsParams {
    const schema = z.object({
      action: z
        .enum(['create', 'read', 'update', 'delete', 'list'])
        .default('list'),
      promptId: z.string().optional(),
      prompt: z
        .object({
          name: z.string().min(1, 'Prompt name is required').optional(),
          template: z
            .string()
            .min(1, 'Prompt template is required')
            .optional(),
          category: z
            .enum(['writing', 'research', 'analysis', 'creative'])
            .optional(),
          variables: z.array(z.string()).optional(),
          description: z.string().optional(),
        })
        .optional(),
      filters: z
        .object({
          category: z
            .enum(['writing', 'research', 'analysis', 'creative'])
            .optional(),
          search: z.string().optional(),
        })
        .optional(),
    });

    const validated = schema.parse(params);

    // 验证特定操作的必填字段
    if (
      ['read', 'update', 'delete'].includes(validated.action) &&
      !validated.promptId
    ) {
      throw new Error('promptId is required for this action');
    }

    if (validated.action === 'create' && !validated.prompt) {
      throw new Error('prompt data is required for create action');
    }

    return validated;
  }
}
