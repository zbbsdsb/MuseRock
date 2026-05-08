import { Provider } from '@nestjs/common';
import { router } from './trpc';
import { createAiRouter } from './routers/ai.router';
import { createMemoryRouter } from './routers/memory.router';
import { authRouter } from './routers/auth.router';
import { AIService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';

export const APP_ROUTER_PROVIDER: Provider = {
  provide: 'APP_ROUTER',
  useFactory: (aiService: AIService, memoryService: MemoryService) => {
    return router({
      ai: createAiRouter(aiService),
      memory: createMemoryRouter(memoryService),
      auth: authRouter,
    });
  },
  inject: [AIService, MemoryService],
};
