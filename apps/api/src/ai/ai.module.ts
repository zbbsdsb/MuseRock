import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { ModelAdapterFactory } from './adapters/adapter.factory';
import { OpenAIAdapter } from './adapters/openai.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { PromptRegistryService } from './prompt-registry.service';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [ObservabilityModule],
  providers: [
    ModelAdapterFactory,
    OpenAIAdapter,
    GeminiAdapter,
    PromptRegistryService,
    AIService,
  ],
  exports: [AIService, PromptRegistryService],
})
export class AIModule {}
