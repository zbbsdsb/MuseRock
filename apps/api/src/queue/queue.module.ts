import { Module } from '@nestjs/common';
import { TaskQueueService } from './task-queue.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  providers: [TaskQueueService],
  exports: [TaskQueueService],
})
export class QueueModule {}
