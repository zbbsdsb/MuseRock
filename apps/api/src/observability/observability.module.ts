import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ObservabilityService, ObservabilityMiddleware } from './observability.service';

@Module({
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
