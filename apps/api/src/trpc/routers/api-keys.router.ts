import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { ApiProvider } from '../../api-keys/entities/api-key.entity';

const modelParametersSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  topP: z.number().optional(),
  presencePenalty: z.number().optional(),
  frequencyPenalty: z.number().optional(),
});

export function createApiKeysRouter(apiKeysService: ApiKeysService) {
  return router({
    create: protectedProcedure
      .input(z.object({
        provider: z.enum(['gemini', 'openai', 'anthropic', 'custom', 'deo', 'dia']),
        apiKey: z.string(),
        endpoint: z.string().optional(),
        modelParameters: modelParametersSchema.optional(),
        displayName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const key = await apiKeysService.createApiKey(userId, input);
        return { success: true, key };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        apiKey: z.string().optional(),
        endpoint: z.string().optional(),
        modelParameters: modelParametersSchema.optional(),
        displayName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const key = await apiKeysService.updateApiKey(userId, input.id, input);
        return { success: true, key };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const success = await apiKeysService.deleteApiKey(userId, input.id);
        return { success };
      }),

    setActive: protectedProcedure
      .input(z.object({
        id: z.string(),
        provider: z.enum(['gemini', 'openai', 'anthropic', 'custom', 'deo', 'dia']),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const success = await apiKeysService.setActiveApiKey(userId, input.provider, input.id);
        return { success };
      }),

    testConnection: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const result = await apiKeysService.testConnection(userId, input.id);
        return result;
      }),

    listByProvider: protectedProcedure
      .input(z.object({
        provider: z.enum(['gemini', 'openai', 'anthropic', 'custom', 'deo', 'dia']),
      }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const keys = await apiKeysService.listApiKeysByProvider(userId, input.provider);
        return { keys };
      }),

    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const keys = await apiKeysService.listAllApiKeys(userId);
        return { keys };
      }),

    getActive: protectedProcedure
      .input(z.object({
        provider: z.enum(['gemini', 'openai', 'anthropic', 'custom', 'deo', 'dia']),
      }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.user?.id || 'anonymous';
        const key = await apiKeysService.getActiveApiKey(userId, input.provider);
        return { key };
      }),
  });
}
