import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { ModelAdapterFactory } from './adapters/adapter.factory';
import { OpenAIAdapter } from './adapters/openai.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';

@Module({
  providers: [
    ModelAdapterFactory,
    OpenAIAdapter,
    GeminiAdapter,
    AIService,
  ],
  exports: [AIService],
})
export class AIModule {}
