import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { MemoryModule } from '../memory/memory.module';
import { ApprenticeModule } from '../apprentice/apprentice.module';
import { OasisModule } from '../oasis/oasis.module';

@Module({
  imports: [MemoryModule, ApprenticeModule, OasisModule],
  controllers: [McpController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}