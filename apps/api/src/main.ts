import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on http://localhost:${port}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received. Starting graceful shutdown...');
    await app.close();
    logger.log('Application closed gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received. Starting graceful shutdown...');
    await app.close();
    logger.log('Application closed gracefully');
    process.exit(0);
  });
}

bootstrap().catch(err => {
  logger.error('Failed to bootstrap application', err.stack);
  process.exit(1);
});