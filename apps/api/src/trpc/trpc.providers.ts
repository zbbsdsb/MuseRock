import { Provider } from '@nestjs/common';
import { router } from './trpc';
import { createAiRouter } from './routers/ai.router';
import { createMemoryRouter } from './routers/memory.router';
import { createQueueRouter } from './routers/queue.router';
import { authRouter } from './routers/auth.router';
import { AIService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';
import { TaskQueueService } from '../queue/task-queue.service';

export const APP_ROUTER_PROVIDER: Provider = {
  provide: 'APP_ROUTER',
  useFactory: (aiService: AIService, memoryService: MemoryService, taskQueueService: TaskQueueService) => {
    return router({
      ai: createAiRouter(aiService),
      memory: createMemoryRouter(memoryService),
      queue: createQueueRouter(taskQueueService),
      auth: authRouter,
    });
  },
  inject: [AIService, MemoryService, TaskQueueService],
};
