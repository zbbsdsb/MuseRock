import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './app.router';
import { createContext } from './trpc';

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});
