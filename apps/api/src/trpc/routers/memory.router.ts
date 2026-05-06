import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { MemoryService } from '../../memory/memory.service';

export const memoryRouter = router({
  store: protectedProcedure
    .input(z.object({
      content: z.string(),
      type: z.enum(['episodic', 'contextual', 'knowledge', 'working']),
      sensitivity: z.enum(['public', 'restricted', 'private']).default('private'),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        userId: ctx.user!.id,
        content: input.content,
        metadata: {
          type: input.type,
          ...input.metadata,
        },
        sensitivity: input.sensitivity,
      };
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().optional(),
      layers: z.array(z.string()).optional(),
      sensitivity: z.array(z.enum(['public', 'restricted', 'private'])).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        userId: ctx.user!.id,
        query: input.query,
        options: {
          limit: input.limit,
          layers: input.layers,
          sensitivity: input.sensitivity,
        },
      };
    }),

  recall: protectedProcedure
    .input(z.object({
      layer: z.enum(['episodic', 'working', 'knowledge', 'contextual']),
      limit: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        userId: ctx.user!.id,
        layer: input.layer,
        limit: input.limit,
      };
    }),
});
