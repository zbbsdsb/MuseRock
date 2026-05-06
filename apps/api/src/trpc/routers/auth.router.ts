import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const authRouter = router({
  getOasisAuthUrl: publicProcedure
    .mutation(async () => {
      return { authUrl: '/auth/oasis' };
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        id: ctx.user!.id,
        email: ctx.user!.email,
      };
    }),
});
