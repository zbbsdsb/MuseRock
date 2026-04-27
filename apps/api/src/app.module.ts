import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MemoryModule } from './memory/memory.module';
import { ApprenticeModule } from './apprentice/apprentice.module';
import { OasisModule } from './oasis/oasis.module';
import { McpModule } from './mcp/mcp.module';
import { ObservabilityModule } from './observability/observability.module';
import { ObservabilityMiddleware } from './observability/observability.service';
import { ComplianceModule } from './compliance/compliance.module';
import { HealthModule } from './health/health.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'muserock.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables in development
    }),
    AuthModule,
    MemoryModule,
    ApprenticeModule,
    OasisModule,
    McpModule,
    ObservabilityModule,
    ComplianceModule,
    HealthModule,
    AIModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}