import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { MemoryService } from '../../memory/memory.service';

export function createMemoryRouter(memoryService: MemoryService) {
  return router({
    store: protectedProcedure
      .input(z.object({
        content: z.string(),
        type: z.enum(['episodic', 'contextual', 'knowledge', 'working']),
        sensitivity: z.enum(['public', 'restricted', 'private']).default('private'),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return memoryService.storeMemory({
          userId: ctx.user!.id,
          content: input.content,
          type: input.type,
          sensitivity: input.sensitivity,
          metadata: input.metadata,
        });
      }),

    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().optional(),
        layers: z.array(z.string()).optional(),
        sensitivity: z.array(z.enum(['public', 'restricted', 'private'])).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return memoryService.searchMemory({
          userId: ctx.user!.id,
          query: input.query,
          limit: input.limit,
          layers: input.layers,
          sensitivity: input.sensitivity,
        });
      }),

    recall: protectedProcedure
      .input(z.object({
        layer: z.enum(['episodic', 'working', 'knowledge', 'contextual']),
        limit: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return memoryService.recallMemory({
          userId: ctx.user!.id,
          layer: input.layer,
          limit: input.limit,
        });
      }),
  });
}
