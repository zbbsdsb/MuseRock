import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ObservabilityService, ObservabilityMiddleware } from './observability.service';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
