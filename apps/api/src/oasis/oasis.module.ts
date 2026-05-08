import { Module } from '@nestjs/common';
import { OasisService } from './oasis.service';
import { OAuthModule } from './oauth/oauth.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule, OAuthModule],
  providers: [OasisService],
  exports: [OasisService],
})
export class OasisModule {}