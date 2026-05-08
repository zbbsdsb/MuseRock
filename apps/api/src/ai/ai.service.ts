import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ModelAdapterFactory, ProviderType } from './adapters/adapter.factory';
import { ModelOptions, ModelResponse } from './adapters/base.adapter';
import { PromptRegistryService, PromptTemplate } from './prompt-registry.service';

export interface GenerationRequest {
  prompt: string;
  role: string;
  provider?: ProviderType;
  options?: ModelOptions;
  context?: Record<string, any>;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface TemplateGenerationRequest {
  templateId: string;
  variables: Record<string, string>;
  userInput: string;
  provider?: ProviderType;
  options?: ModelOptions;
  context?: Record<string, any>;
}

@Injectable()
export class AIService {
  constructor(
    private adapterFactory: ModelAdapterFactory,
    private promptRegistry: PromptRegistryService,
  ) {}

  async generateContent(request: GenerationRequest): Promise<ModelResponse> {
    const { prompt, role, provider = 'openai', options = {}, templateId, variables } = request;

    let systemPrompt: string;

    if (templateId && variables) {
      systemPrompt = this.promptRegistry.renderPrompt(templateId, {
        variables,
        context: request.context,
      });
    } else {
      systemPrompt = this.getSystemPromptForRole(role, request.context);
    }

    try {
      return await this.adapterFactory.generateContent(
        provider,
        prompt,
        systemPrompt,
        options,
      );
    } catch (error) {
      throw new HttpException(
        `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateStructuredContent(request: GenerationRequest): Promise<ModelResponse> {
    return this.generateContent({
      ...request,
      options: {
        ...request.options,
        responseFormat: 'json',
      },
    });
  }

  async generateFromTemplate(request: TemplateGenerationRequest): Promise<ModelResponse> {
    const { templateId, variables, userInput, provider = 'openai', options = {}, context } = request;

    const missingVars = this.promptRegistry.validateVariables(templateId, variables);
    if (missingVars.length > 0) {
      throw new HttpException(
        `Missing required variables: ${missingVars.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const systemPrompt = this.promptRegistry.renderPrompt(templateId, {
      variables,
      context,
    });

    const schema = this.promptRegistry.getSchema(templateId);
    
    try {
      return await this.adapterFactory.generateContent(
        provider,
        userInput,
        systemPrompt,
        {
          ...options,
          responseFormat: 'json',
        },
      );
    } catch (error) {
      throw new HttpException(
        `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getSystemPromptForRole(role: string, context?: Record<string, any>): string {
    const basePrompts: Record<string, string> = {
      researcher: `You are MuseRock's Researcher. Your responsibilities are:
1. Explore topics broadly first, then narrow down
2. Identify high-value inspiration directions
3. Formulate key research questions
4. Suggest credible source types
5. Distinguish between facts, assumptions, and unverified clues
6. Always output in the specified JSON format`,
      
      writer: `You are MuseRock's Writer. Your responsibilities are:
1. Transform briefs, research packages, and feedback into readable drafts
2. Maintain consistent voice, pacing, and length targets
3. Cite sources properly when using research references
4. Include summary, body, open questions, and change log in output
5. Always output in the specified JSON format`,
      
      designer: `You are MuseRock's Designer. Your responsibilities are:
1. Convert textual themes into visual directions
2. Provide color palettes, typography, and layout principles
3. Distinguish between visual concepts, design tokens, and risks
4. Never overwrite Writer's narrative intent
5. Always output in the specified JSON format`,
      
      musician: `You are MuseRock's Musician. Your responsibilities are:
1. Convert emotional beats and structure into musical concepts
2. Provide mood arcs, tempo ranges, and instrumentation suggestions
3. Create cue sheets for different sections
4. Ensure musical direction aligns with visual and narrative goals
5. Always output in the specified JSON format`,
    };

    const basePrompt = basePrompts[role] || basePrompts.writer;
    
    if (context) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');
      return `${basePrompt}\n\nAdditional context:\n${contextStr}`;
    }
    
    return basePrompt;
  }

  getAvailableProviders(): ProviderType[] {
    return this.adapterFactory.getAvailableProviders();
  }

  getPromptTemplates(): PromptTemplate[] {
    return this.promptRegistry.getAllPrompts();
  }

  getPromptTemplateById(id: string): PromptTemplate | undefined {
    return this.promptRegistry.getPromptById(id);
  }

  createPromptTemplate(prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): PromptTemplate {
    return this.promptRegistry.createPrompt(prompt);
  }
}
