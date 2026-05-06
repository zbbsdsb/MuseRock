import { router } from './trpc';
import { aiRouter } from './routers/ai.router';
import { memoryRouter } from './routers/memory.router';
import { authRouter } from './routers/auth.router';

export const appRouter = router({
  ai: aiRouter,
  memory: memoryRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
