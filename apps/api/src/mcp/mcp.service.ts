import { Injectable, OnModuleInit } from '@nestjs/common';
import { HandlerRegistry, MCPHandler } from './handlers/handler.registry';
import { MemoryHandler } from './handlers/memory.handler';
import { ApprenticeHandler } from './handlers/apprentice.handler';
import { BioHandler } from './handlers/bio.handler';
import { ContentHandler } from './handlers/content.handler';
import { PromptHandler } from './handlers/prompt.handler';

@Injectable()
export class McpService implements OnModuleInit {
  constructor(
    private readonly handlerRegistry: HandlerRegistry,
    private readonly memoryHandler: MemoryHandler,
    private readonly apprenticeHandler: ApprenticeHandler,
    private readonly bioHandler: BioHandler,
    private readonly contentHandler: ContentHandler,
    private readonly promptHandler: PromptHandler,
  ) {}

  onModuleInit() {
    this.registerHandlers([
      this.memoryHandler,
      this.apprenticeHandler,
      this.bioHandler,
      this.contentHandler,
      this.promptHandler,
    ]);
  }

  private registerHandlers(handlers: MCPHandler[]) {
    handlers.forEach(handler => {
      this.handlerRegistry.register(handler);
    });
  }

  getHandlerRegistry(): HandlerRegistry {
    return this.handlerRegistry;
  }
}