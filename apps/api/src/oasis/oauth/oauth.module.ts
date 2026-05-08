import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OasisOAuthService } from './oasis-oauth.service';
import { SessionService } from './session.service';
import { OAuthSession } from './entities/oauth-session.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OAuthSession]),
  ],
  providers: [OasisOAuthService, SessionService],
  exports: [OasisOAuthService, SessionService],
})
export class OAuthModule {}