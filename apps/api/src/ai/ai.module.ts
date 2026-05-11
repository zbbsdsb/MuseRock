import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { AIProxyController } from './ai-proxy.controller';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), ApiKeysModule],
  controllers: [AIProxyController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}