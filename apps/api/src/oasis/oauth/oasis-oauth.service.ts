import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateCodeVerifier, generateCodeChallenge, generateState } from './pkce.utils';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}

export interface OasisUserInfo {
  sub: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  email?: string;
}

export interface Character {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  identityMode?: string;
}

export interface CharacterDetail extends Character {
  abilities: any[];
  worlds: any[];
  eras: any[];
  references: any[];
}

export interface DCOSFile {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

@Injectable()
export class OasisOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly authUrl: string;
  private readonly tokenUrl: string;
  private readonly userInfoUrl: string;
  private readonly resourcesUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('OASIS_OAUTH_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('OASIS_OAUTH_CLIENT_SECRET') || '';
    this.redirectUri = this.configService.get<string>('OASIS_OAUTH_REDIRECT_URI') || '';
    this.authUrl = this.configService.get<string>('OASIS_AUTH_URL') || 'https://oasisbio.com/oauth/authorize';
    this.tokenUrl = this.configService.get<string>('OASIS_TOKEN_URL') || 'https://api.oasisbio.com/api/oauth/token';
    this.userInfoUrl = this.configService.get<string>('OASIS_USERINFO_URL') || 'https://api.oasisbio.com/api/oauth/userinfo';
    this.resourcesUrl = this.configService.get<string>('OASIS_RESOURCES_URL') || 'https://api.oasisbio.com/api/oauth/resources';
  }

  buildAuthorizationUrl(scopes: string[], state?: string): { url: string; codeVerifier: string; state: string } {
    const codeVerifier = generateCodeVerifier();
    const finalState = state || generateState();

    const url = new URL(this.authUrl);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', finalState);
    url.searchParams.set('code_challenge_method', 'S256');

    return {
      url: url.toString(),
      codeVerifier,
      state: finalState,
    };
  }

  async buildAuthorizationUrlWithChallenge(scopes: string[], state?: string): Promise<{ url: string; codeVerifier: string; state: string }> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const finalState = state || generateState();

    const url = new URL(this.authUrl);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', finalState);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    return {
      url: url.toString(),
      codeVerifier,
      state: finalState,
    };
  }

  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<OAuthTokens> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.error_description || 'Failed to exchange code for tokens',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to exchange code for tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.error_description || 'Failed to refresh access token',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to refresh access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserInfo(accessToken: string): Promise<OasisUserInfo> {
    try {
      const response = await fetch(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.error_description || 'Failed to fetch user info',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        sub: data.sub,
        username: data.username,
        displayName: data.display_name,
        avatarUrl: data.avatar_url || null,
        email: data.email,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCharacters(accessToken: string): Promise<Character[]> {
    try {
      const response = await fetch(`${this.resourcesUrl}/oasisbios`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.error_description || 'Failed to fetch characters',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        coverImage: item.cover_image,
        identityMode: item.identity_mode,
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch characters',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCharacterById(accessToken: string, id: string): Promise<CharacterDetail> {
    try {
      const response = await fetch(`${this.resourcesUrl}/oasisbios/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.error_description || 'Failed to fetch character',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        coverImage: data.cover_image,
        identityMode: data.identity_mode,
        abilities: data.abilities || [],
        worlds: data.worlds || [],
        eras: data.eras || [],
        references: data.references || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch character',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCharacterDCOS(accessToken: string, id: string): Promise<DCOSFile[]> {
    try {
      const response = await fetch(`${this.resourcesUrl}/oasisbios/${id}/dcos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          data.error_description || 'Failed to fetch DCOS files',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        content: item.content,
        createdAt: item.created_at,
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch DCOS files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async revokeToken(token: string, tokenType: 'access_token' | 'refresh_token'): Promise<void> {
    try {
      await fetch(`${this.tokenUrl}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token,
          token_type_hint: tokenType,
        }),
      });
    } catch (error) {
      throw new HttpException(
        'Failed to revoke token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}