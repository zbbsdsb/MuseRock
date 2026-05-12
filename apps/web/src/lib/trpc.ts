import { createTRPCReact, httpBatchLink, createTRPCProxyClient } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';

export const trpc = createTRPCReact();

export function createTRPCClient(url: string = '/api/trpc') {
  const queryClient = new QueryClient();
  
  const client = createTRPCProxyClient({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });

  return { client, queryClient };
}

export type { QueryClient };
