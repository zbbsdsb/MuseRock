import { ApiProvider } from '../types';

export interface OasisUser {
  sub: string;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  email?: string;
}

export interface OasisTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export class OasisAuthService {
  private clientId: string;
  private redirectUri: string;
  private authUrl: string;
  private tokenUrl: string;
  private userinfoUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.clientId = import.meta.env.VITE_OASIS_CLIENT_ID || '';
    this.redirectUri = import.meta.env.VITE_OASIS_REDIRECT_URI || 'http://localhost:3000/auth/callback';
    this.authUrl = import.meta.env.VITE_OASIS_AUTH_URL || 'https://oasisbio.com/oauth/authorize';
    this.tokenUrl = import.meta.env.VITE_OASIS_TOKEN_URL || 'https://oasisbio.com/api/oauth/token';
    this.userinfoUrl = import.meta.env.VITE_OASIS_USERINFO_URL || 'https://oasisbio.com/api/oauth/userinfo';
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(b => chars[b % chars.length]).join('');
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  }

  private base64url(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  public async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const verifier = this.generateRandomString(64);
    const challenge = this.base64url(await this.sha256(verifier));
    return { verifier, challenge };
  }

  public getAuthorizationUrl(scope: string = 'profile email oasisbios:read'): Promise<string> {
    return this.generatePKCE().then(({ verifier, challenge }) => {
      const state = this.generateRandomString(16);
      
      sessionStorage.setItem('oasis_pkce_verifier', verifier);
      sessionStorage.setItem('oasis_oauth_state', state);

      const url = new URL(this.authUrl);
      url.searchParams.set('client_id', this.clientId);
      url.searchParams.set('redirect_uri', this.redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', scope);
      url.searchParams.set('state', state);
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');

      return url.toString();
    });
  }

  public async exchangeCodeForTokens(code: string): Promise<OasisTokens> {
    const verifier = sessionStorage.getItem('oasis_pkce_verifier');
    if (!verifier) {
      throw new Error('PKCE verifier not found');
    }

    const response = await fetch(`${this.apiBaseUrl}/auth/oasis/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: new URLSearchParams({
        code: code,
        code_verifier: verifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const tokens: OasisTokens = await response.json();
    
    sessionStorage.removeItem('oasis_pkce_verifier');
    sessionStorage.removeItem('oasis_oauth_state');

    return tokens;
  }

  public async refreshTokens(): Promise<OasisTokens> {
    const response = await fetch(`${this.apiBaseUrl}/auth/oasis/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token refresh failed');
    }

    return response.json();
  }

  public async getUserInfo(): Promise<OasisUser> {
    const response = await fetch(`${this.apiBaseUrl}/auth/oasis/userinfo`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  public getAccessToken(): Promise<string | null> {
    return fetch(`${this.apiBaseUrl}/auth/oasis/token`, {
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        return null;
      }
      return response.json().then(data => data.access_token || null);
    }).catch(() => null);
  }

  public async clearTokens(): Promise<void> {
    await fetch(`${this.apiBaseUrl}/auth/oasis/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  public validateState(state: string): boolean {
    const storedState = sessionStorage.getItem('oasis_oauth_state');
    return state === storedState;
  }
}

export const oasisAuthService = new OasisAuthService();