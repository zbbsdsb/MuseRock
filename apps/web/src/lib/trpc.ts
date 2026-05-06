import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';

export const trpc = createTRPCReact();

export function createTRPCClient(url: string = '/api/trpc') {
  const queryClient = new QueryClient();
  
  const client = trpc.createClient({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });

  return { client, queryClient };
}

export type { QueryClient };
