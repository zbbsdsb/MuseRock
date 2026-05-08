import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OasisOAuthService, OAuthTokens, OasisUserInfo } from '../oasis/oauth/oasis-oauth.service';
import { SessionService } from '../oasis/oauth/session.service';

export interface OasisUser {
  sub: string;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  email?: string;
}

@Injectable()
export class AuthService {
  private stateStore: Map<string, { state: string; verifier: string; createdAt: number }> = new Map();

  constructor(
    private readonly oasisOAuthService: OasisOAuthService,
    private readonly sessionService: SessionService,
  ) {
    setInterval(() => this.cleanupExpiredStates(), 5 * 60 * 1000);
  }

  private cleanupExpiredStates() {
    const now = Date.now();
    for (const [state, data] of this.stateStore.entries()) {
      if (now - data.createdAt > 10 * 60 * 1000) {
        this.stateStore.delete(state);
      }
    }
  }

  async getOasisAuthUrl(): Promise<string> {
    const { url, codeVerifier, state } = await this.oasisOAuthService.buildAuthorizationUrlWithChallenge([
      'profile',
      'email',
      'oasisbios:read',
    ]);

    this.stateStore.set(state, { state, verifier: codeVerifier, createdAt: Date.now() });

    return url;
  }

  async exchangeCodeForTokens(code: string, state: string): Promise<OAuthTokens> {
    const storedState = this.stateStore.get(state);
    if (!storedState) {
      throw new HttpException('Invalid or expired state', HttpStatus.BAD_REQUEST);
    }

    const { verifier } = storedState;
    this.stateStore.delete(state);

    const tokens = await this.oasisOAuthService.exchangeCodeForTokens(code, verifier);
    return tokens;
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    return this.oasisOAuthService.refreshAccessToken(refreshToken);
  }

  async getUserInfo(accessToken: string): Promise<OasisUser> {
    const userInfo = await this.oasisOAuthService.getUserInfo(accessToken);
    return {
      sub: userInfo.sub,
      username: userInfo.username,
      display_name: userInfo.displayName,
      avatar_url: userInfo.avatarUrl,
      email: userInfo.email,
    };
  }

  async createSession(userId: string, tokens: OAuthTokens): Promise<void> {
    await this.sessionService.createSession(userId, tokens);
  }

  async getSession(userId: string) {
    return this.sessionService.getSession(userId);
  }

  async updateSession(sessionId: string, tokens: OAuthTokens): Promise<void> {
    await this.sessionService.updateSession(sessionId, tokens);
  }

  async deleteSession(userId: string): Promise<void> {
    await this.sessionService.deleteSession(userId);
  }
}