import { Module } from '@nestjs/common';
import { APP_ROUTER_PROVIDER } from './trpc.providers';
import { AIModule } from '../ai/ai.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [AIModule, MemoryModule],
  providers: [APP_ROUTER_PROVIDER],
  exports: [APP_ROUTER_PROVIDER],
})
export class TrpcModule {}
