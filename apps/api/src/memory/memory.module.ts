import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { WorkingMemory } from './layers/working.memory';
import { EpisodicMemory } from './layers/episodic.memory';
import { ContextualMemory } from './layers/contextual.memory';
import { KnowledgeMemory } from './layers/knowledge.memory';
import { ComplianceMemory } from './layers/compliance.memory';

@Module({
  providers: [
    MemoryService,
    WorkingMemory,
    EpisodicMemory,
    ContextualMemory,
    KnowledgeMemory,
    ComplianceMemory,
  ],
  exports: [MemoryService],
})
export class MemoryModule {}