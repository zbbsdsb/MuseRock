import { Module } from '@nestjs/common';
import { OasisService } from './oasis.service';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule],
  providers: [OasisService],
  exports: [OasisService],
})
export class OasisModule {}