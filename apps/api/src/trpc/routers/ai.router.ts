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
      }))
      .mutation(async ({ input }) => {
        return aiService.generateContent({
          prompt: input.prompt,
          role: input.role,
          provider: input.provider,
          options: input.parameters,
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

    getAvailableProviders: publicProcedure
      .query(() => {
        return aiService.getAvailableProviders();
      }),
  });
}
