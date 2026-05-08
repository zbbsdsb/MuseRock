import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { MCPGateway } from './mcp.gateway';

import { HandlerRegistry } from './handlers/handler.registry';
import { MemoryHandler } from './handlers/memory.handler';
import { ApprenticeHandler } from './handlers/apprentice.handler';
import { BioHandler } from './handlers/bio.handler';
import { ContentHandler } from './handlers/content.handler';
import { PromptHandler } from './handlers/prompt.handler';

import { AuthMiddleware } from './middleware/auth.middleware';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';

import { AuditService } from './services/audit.service';
import { CodeExecutionService } from './services/code-execution.service';

import { PluginValidator } from './plugins/plugin.validator';
import { PluginManager } from './plugins/plugin.manager';

import { MemoryModule } from '../memory/memory.module';
import { ApprenticeModule } from '../apprentice/apprentice.module';
import { OasisModule } from '../oasis/oasis.module';
import { HealthModule } from '../health/health.module';
import { AIModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [
    MemoryModule,
    ApprenticeModule,
    OasisModule,
    HealthModule,
    AIModule,
    AuthModule,
    ObservabilityModule,
  ],
  controllers: [McpController],
  providers: [
    McpService,
    MCPGateway,
    HandlerRegistry,
    MemoryHandler,
    ApprenticeHandler,
    BioHandler,
    ContentHandler,
    PromptHandler,
    AuditService,
    CodeExecutionService,
    PluginValidator,
    PluginManager,
  ],
  exports: [McpService, HandlerRegistry],
})
export class McpModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, ValidationMiddleware, RateLimitMiddleware)
      .forRoutes('mcp');
  }
}