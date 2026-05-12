import { Injectable } from '@nestjs/common';
import { AIService } from '../../ai/ai.service';
import { MCPHandler } from './handler.registry';
import { ManagePromptsParams, ManagePromptsResult, PromptTemplate } from '../types/mcp.types';

@Injectable()
export class PromptHandler implements MCPHandler {
  constructor(private readonly aiService: AIService) {}

  getMethodName(): string {
    return 'manage_prompts';
  }

  async execute(params: Record<string, unknown>): Promise<ManagePromptsResult> {
    const promptParams = params as unknown as ManagePromptsParams;

    switch (promptParams.action) {
      case 'list':
        return this.listPrompts(promptParams.filters);
      case 'read':
        return this.readPrompt(promptParams.promptId);
      case 'create':
        return this.createPrompt(promptParams.prompt);
      case 'update':
        return this.updatePrompt(promptParams.promptId, promptParams.prompt);
      case 'delete':
        return this.deletePrompt(promptParams.promptId);
      default:
        throw new Error(`Unsupported action: ${promptParams.action}`);
    }
  }

  private async listPrompts(filters?: { category?: string; search?: string }): Promise<ManagePromptsResult> {
    const allPrompts = this.aiService.getPromptTemplates();
    
    let filtered = allPrompts;
    
    if (filters?.category) {
      filtered = filtered.filter((p: { category?: string; role?: string }) => p.category === filters.category || p.role === filters.category);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((p: { name: string; description?: string }) => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
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

  private async updatePrompt(promptId?: string, prompt?: {
    name?: string;
    template?: string;
    category?: string;
    variables?: string[];
    description?: string;
  }): Promise<ManagePromptsResult> {
    return { success: true };
  }

  private async deletePrompt(promptId?: string): Promise<ManagePromptsResult> {
    if (!promptId) {
      throw new Error('promptId is required for delete action');
    }
    return { success: true };
  }

  private mapTemplate(template: any): PromptTemplate {
    return {
      id: template.id,
      name: template.name,
      template: template.template,
      category: template.category,
      variables: template.variables || [],
      description: template.description,
      createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
      usageCount: template.usageCount || 0,
    };
  }
}