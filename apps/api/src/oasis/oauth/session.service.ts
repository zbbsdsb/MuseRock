import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthSession } from './entities/oauth-session.entity';
import { OAuthTokens } from './oasis-oauth.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(OAuthSession)
    private readonly sessionRepository: Repository<OAuthSession>,
  ) {}

  async createSession(userId: string, tokens: OAuthTokens): Promise<OAuthSession> {
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    const session = this.sessionRepository.create({
      userId,
      provider: 'oasisbio',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
      scope: tokens.scope,
    });

    return this.sessionRepository.save(session);
  }

  async getSession(userId: string): Promise<OAuthSession | null> {
    return this.sessionRepository.findOne({
      where: { userId, provider: 'oasisbio' },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSession(sessionId: string, tokens: OAuthTokens): Promise<OAuthSession> {
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    await this.sessionRepository.update(sessionId, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
      scope: tokens.scope,
    });

    return this.sessionRepository.findOneOrFail({ where: { id: sessionId } });
  }

  async deleteSession(userId: string): Promise<void> {
    await this.sessionRepository.delete({ userId, provider: 'oasisbio' });
  }

  async isSessionValid(session: OAuthSession): Promise<boolean> {
    return session.expiresAt > new Date();
  }
}