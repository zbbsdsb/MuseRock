import { Module } from '@nestjs/common';
import { ApprenticeService } from './apprentice.service';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule],
  providers: [ApprenticeService],
  exports: [ApprenticeService],
})
export class ApprenticeModule {}