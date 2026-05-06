import { Module } from '@nestjs/common';
import { appRouter } from './app.router';
import { AIService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';

@Module({
  providers: [
    {
      provide: 'APP_ROUTER',
      useValue: appRouter,
    },
    AIService,
    MemoryService,
  ],
  exports: ['APP_ROUTER'],
})
export class TrpcModule {}
