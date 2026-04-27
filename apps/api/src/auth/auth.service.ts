import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

interface OasisTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface OasisUser {
  sub: string;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  email?: string;
}

@Injectable()
export class AuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private authUrl: string;
  private tokenUrl: string;
  private userinfoUrl: string;
  private stateStore: Map<string, { state: string; verifier: string; createdAt: number }> = new Map();

  constructor() {
    this.clientId = process.env.OASIS_CLIENT_ID || '';
    this.clientSecret = process.env.OASIS_CLIENT_SECRET || '';
    this.redirectUri = process.env.OASIS_REDIRECT_URI || 'http://localhost:3001/auth/callback';
    this.authUrl = process.env.OASIS_AUTH_URL || 'https://oasisbio.com/oauth/authorize';
    this.tokenUrl = process.env.OASIS_TOKEN_URL || 'https://oasisbio.com/api/oauth/token';
    this.userinfoUrl = process.env.OASIS_USERINFO_URL || 'https://oasisbio.com/api/oauth/userinfo';

    // Clean up expired states every 5 minutes
    setInterval(() => this.cleanupExpiredStates(), 5 * 60 * 1000);
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private sha256(plain: string): string {
    return crypto.createHash('sha256').update(plain).digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private cleanupExpiredStates() {
    const now = Date.now();
    for (const [state, data] of this.stateStore.entries()) {
      if (now - data.createdAt > 10 * 60 * 1000) { // 10 minutes
        this.stateStore.delete(state);
      }
    }
  }

  async getOasisAuthUrl(): Promise<string> {
    const verifier = this.generateRandomString(64);
    const challenge = this.sha256(verifier);
    const state = this.generateRandomString(16);

    // Store state and verifier
    this.stateStore.set(state, { state, verifier, createdAt: Date.now() });

    const params = {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'profile email',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    };

    return `${this.authUrl}?${querystring.stringify(params)}`;
  }

  async exchangeCodeForTokens(code: string, state: string): Promise<OasisTokens> {
    const storedState = this.stateStore.get(state);
    if (!storedState) {
      throw new Error('Invalid or expired state');
    }

    const { verifier } = storedState;
    this.stateStore.delete(state);

    const params = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier,
    };

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: querystring.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    return response.json();
  }

  async refreshTokens(refreshToken: string): Promise<OasisTokens> {
    const params = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    };

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: querystring.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token refresh failed');
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<OasisUser> {
    const response = await fetch(this.userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }
}