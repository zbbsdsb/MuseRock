import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}