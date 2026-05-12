import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { AIProxyController } from './ai-proxy.controller';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { ModelAdapterFactory } from './adapters/adapter.factory';
import { PromptRegistryService } from './prompt-registry.service';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), ApiKeysModule, ObservabilityModule],
  controllers: [AIProxyController],
  providers: [
    ModelAdapterFactory,
    PromptRegistryService,
    AIService,
  ],
  exports: [AIService, PromptRegistryService],
})
export class AIModule {}
