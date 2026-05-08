import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { AIService } from '../../ai/ai.service';

export function createAiRouter(aiService: AIService) {
  return router({
    generateContent: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        role: z.enum(['researcher', 'writer', 'designer', 'musician', 'general']).default('general'),
        provider: z.enum(['openai', 'gemini']).optional(),
        parameters: z.object({
          model: z.string().optional(),
          maxTokens: z.number().optional(),
          temperature: z.number().optional(),
          topP: z.number().optional(),
          presencePenalty: z.number().optional(),
          frequencyPenalty: z.number().optional(),
          responseFormat: z.enum(['json', 'text']).optional(),
        }).optional(),
        templateId: z.string().optional(),
        variables: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return aiService.generateContent({
          prompt: input.prompt,
          role: input.role,
          provider: input.provider,
          options: input.parameters,
          templateId: input.templateId,
          variables: input.variables,
        });
      }),

    generateStructuredContent: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        role: z.enum(['researcher', 'writer', 'designer', 'musician']),
        provider: z.enum(['openai', 'gemini']).optional(),
        parameters: z.object({
          model: z.string().optional(),
          maxTokens: z.number().optional(),
          temperature: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        return aiService.generateStructuredContent({
          prompt: input.prompt,
          role: input.role,
          provider: input.provider,
          options: input.parameters,
        });
      }),

    generateFromTemplate: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        variables: z.record(z.string(), z.string()),
        userInput: z.string(),
        provider: z.enum(['openai', 'gemini']).optional(),
        parameters: z.object({
          model: z.string().optional(),
          maxTokens: z.number().optional(),
          temperature: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        return aiService.generateFromTemplate({
          templateId: input.templateId,
          variables: input.variables,
          userInput: input.userInput,
          provider: input.provider,
          options: input.parameters,
        });
      }),

    getAvailableProviders: publicProcedure
      .query(() => {
        return aiService.getAvailableProviders();
      }),

    getPromptTemplates: publicProcedure
      .query(() => {
        return aiService.getPromptTemplates();
      }),

    getPromptTemplateById: publicProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        return aiService.getPromptTemplateById(input.id);
      }),

    createPromptTemplate: protectedProcedure
      .input(z.object({
        name: z.string(),
        role: z.enum(['researcher', 'writer', 'designer', 'musician']),
        template: z.string(),
        variables: z.array(z.string()),
        description: z.string().optional(),
        schema: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        return aiService.createPromptTemplate(input);
      }),
  });
}
