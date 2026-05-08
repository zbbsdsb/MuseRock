import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './trpc';
import { APP_ROUTER_PROVIDER } from './trpc.providers';

export const trpcMiddlewareFactory = (router: any) => {
  return trpcExpress.createExpressMiddleware({
    router,
    createContext,
  });
};

export { APP_ROUTER_PROVIDER };
