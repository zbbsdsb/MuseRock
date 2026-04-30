import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';
import { MemoryModule } from '../memory/memory.module';
import { ApprenticeModule } from '../apprentice/apprentice.module';
import { OasisModule } from '../oasis/oasis.module';
import { HealthModule } from '../health/health.module';
import { CodeExecutionService } from './services/code-execution.service';

@Module({
  imports: [MemoryModule, ApprenticeModule, OasisModule, HealthModule],
  controllers: [McpController],
  providers: [McpService, CodeExecutionService],
  exports: [McpService],
})
export class McpModule {}