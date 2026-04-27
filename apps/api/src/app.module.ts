import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MemoryModule } from './memory/memory.module';
import { ApprenticeModule } from './apprentice/apprentice.module';
import { OasisModule } from './oasis/oasis.module';
import { McpModule } from './mcp/mcp.module';
import { ObservabilityModule, ObservabilityMiddleware } from './observability/observability.service';
import { ComplianceModule } from './compliance/compliance.module';

@Module({
  imports: [AuthModule, MemoryModule, ApprenticeModule, OasisModule, McpModule, ObservabilityModule, ComplianceModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}