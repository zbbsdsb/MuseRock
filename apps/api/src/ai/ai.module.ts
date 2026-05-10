import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { ModelAdapterFactory } from './adapters/adapter.factory';
import { PromptRegistryService } from './prompt-registry.service';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [ObservabilityModule],
  providers: [
    ModelAdapterFactory,
    PromptRegistryService,
    AIService,
  ],
  exports: [AIService, PromptRegistryService],
})
export class AIModule {}
