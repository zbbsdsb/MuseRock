import { Provider } from '@nestjs/common';
import { router } from './trpc';
import { createAiRouter } from './routers/ai.router';
import { createMemoryRouter } from './routers/memory.router';
import { createQueueRouter } from './routers/queue.router';
import { createApiKeysRouter } from './routers/api-keys.router';
import { authRouter } from './routers/auth.router';
import { AIService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';
import { TaskQueueService } from '../queue/task-queue.service';
import { ApiKeysService } from '../api-keys/api-keys.service';

export const APP_ROUTER_PROVIDER: Provider = {
  provide: 'APP_ROUTER',
  useFactory: (aiService: AIService, memoryService: MemoryService, taskQueueService: TaskQueueService, apiKeysService: ApiKeysService) => {
    return router({
      ai: createAiRouter(aiService),
      memory: createMemoryRouter(memoryService),
      queue: createQueueRouter(taskQueueService),
      apiKeys: createApiKeysRouter(apiKeysService),
      auth: authRouter,
    });
  },
  inject: [AIService, MemoryService, TaskQueueService, ApiKeysService],
};
