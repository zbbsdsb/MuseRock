import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { AIService } from '../../ai/ai.service';

const aiService = new AIService();

export const aiRouter = router({
  generateContent: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      role: z.enum(['researcher', 'writer', 'designer', 'musician', 'general']).default('general'),
      parameters: z.object({
        model: z.string().optional(),
        maxTokens: z.number().optional(),
        temperature: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      return aiService.generateContent(input.prompt, input.role, input.parameters || {});
    }),
});
