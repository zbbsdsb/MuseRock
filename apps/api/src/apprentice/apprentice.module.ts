import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprenticeService } from './apprentice.service';
import { MemoryModule } from '../memory/memory.module';
import { AIModule } from '../ai/ai.module';
import { Apprentice } from './entities/apprentice.entity';
import { Job } from './entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Apprentice, Job]),
    MemoryModule,
    AIModule,
  ],
  providers: [ApprenticeService],
  exports: [ApprenticeService],
})
export class ApprenticeModule {}