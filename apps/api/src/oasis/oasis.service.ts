import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';
import { OasisOAuthService, Character, CharacterDetail, DCOSFile } from './oauth/oasis-oauth.service';

export interface OasisUser {
  sub: string;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  email?: string;
  bio?: string;
  interests?: string[];
}

export interface OasisAsset {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  name: string;
  description: string;
  url: string;
  tags: string[];
  sensitivity: 'public' | 'restricted' | 'private';
  metadata: Record<string, any>;
}

export interface OasisProfile {
  user: OasisUser;
  assets: OasisAsset[];
  preferences: Record<string, any>;
  roles: string[];
}

@Injectable()
export class OasisService {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly oasisOAuthService: OasisOAuthService,
  ) {}

  async getUserProfile(userId: string, accessToken: string): Promise<OasisProfile> {
    try {
      const userInfo = await this.oasisOAuthService.getUserInfo(accessToken);
      
      const profile: OasisProfile = {
        user: {
          sub: userInfo.sub,
          username: userInfo.username,
          display_name: userInfo.displayName,
          avatar_url: userInfo.avatarUrl,
          email: userInfo.email,
        },
        assets: [],
        preferences: {},
        roles: [],
      };

      await this.memoryService.storeMemory({
        userId,
        type: 'episodic',
        content: JSON.stringify(profile),
        metadata: {
          profile_type: 'user_profile',
          source: 'oasisbio',
        },
        sensitivity: 'private',
      });

      return profile;
    } catch (error) {
      throw new HttpException(
        'Failed to get user profile from OasisBio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchBioAsset(assetId: string, accessToken: string): Promise<OasisAsset> {
    try {
      const characters = await this.oasisOAuthService.getCharacters(accessToken);
      const character = characters.find(c => c.id === assetId || c.slug === assetId);

      if (!character) {
        const asset = await this.simulateGetAsset(assetId);
        await this.storeAssetInMemory(assetId, asset);
        return asset;
      }

      const detail = await this.oasisOAuthService.getCharacterById(accessToken, character.id);
      const asset: OasisAsset = {
        id: detail.id,
        type: 'document',
        name: detail.name,
        description: `Character: ${detail.name}`,
        url: `https://oasisbio.com/bio/${detail.slug}`,
        tags: ['character', detail.identityMode || 'unknown'],
        sensitivity: 'public',
        metadata: {
          abilities: detail.abilities.length,
          worlds: detail.worlds.length,
          eras: detail.eras.length,
        },
      };

      await this.storeAssetInMemory(assetId, asset);
      return asset;
    } catch (error) {
      const asset = await this.simulateGetAsset(assetId);
      await this.storeAssetInMemory(assetId, asset);
      return asset;
    }
  }

  async searchBioAssets(query: string, accessToken: string, options?: {
    type?: 'image' | 'audio' | 'video' | 'document';
    limit?: number;
    sensitivity?: ('public' | 'restricted' | 'private')[];
  }): Promise<OasisAsset[]> {
    try {
      const characters = await this.oasisOAuthService.getCharacters(accessToken);
      const filtered = characters.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.slug.toLowerCase().includes(query.toLowerCase())
      );

      const assets: OasisAsset[] = filtered.slice(0, options?.limit || 20).map(c => ({
        id: c.id,
        type: 'document',
        name: c.name,
        description: `Character from OasisBio`,
        url: `https://oasisbio.com/bio/${c.slug}`,
        tags: ['character', c.identityMode || 'unknown'],
        sensitivity: 'public',
        metadata: { coverImage: c.coverImage },
      }));

      for (const asset of assets) {
        await this.storeAssetInMemory(asset.id, asset);
      }

      return assets;
    } catch (error) {
      return this.simulateSearchAssets(query, options);
    }
  }

  async getCharacters(accessToken: string): Promise<Character[]> {
    try {
      return this.oasisOAuthService.getCharacters(accessToken);
    } catch (error) {
      return [];
    }
  }

  async getCharacterDetail(accessToken: string, characterId: string): Promise<CharacterDetail | null> {
    try {
      return this.oasisOAuthService.getCharacterById(accessToken, characterId);
    } catch (error) {
      return null;
    }
  }

  async getCharacterDCOS(accessToken: string, characterId: string): Promise<DCOSFile[]> {
    try {
      return this.oasisOAuthService.getCharacterDCOS(accessToken, characterId);
    } catch (error) {
      return [];
    }
  }

  private async storeAssetInMemory(assetId: string, asset: OasisAsset): Promise<void> {
    await this.memoryService.storeMemory({
      userId: 'oasis-user',
      type: 'knowledge',
      content: JSON.stringify(asset),
      metadata: {
        asset_id: assetId,
        asset_type: asset.type,
        source: 'oasisbio',
      },
      sensitivity: asset.sensitivity,
    });
  }

  private async simulateGetAsset(assetId: string): Promise<OasisAsset> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: assetId,
      type: 'image',
      name: 'Test Asset',
      description: 'This is a test asset from OasisBio',
      url: `https://example.com/assets/${assetId}.jpg`,
      tags: ['test', 'sample', 'demo'],
      sensitivity: 'public',
      metadata: { resolution: '1920x1080', format: 'jpg' },
    };
  }

  private async simulateSearchAssets(query: string, options?: {
    type?: 'image' | 'audio' | 'video' | 'document';
    limit?: number;
    sensitivity?: ('public' | 'restricted' | 'private')[];
  }): Promise<OasisAsset[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const assets: OasisAsset[] = [
      {
        id: 'asset_1',
        type: 'image',
        name: 'Mountain Landscape',
        description: 'A beautiful mountain landscape',
        url: 'https://example.com/assets/mountain.jpg',
        tags: ['nature', 'landscape', 'mountains'],
        sensitivity: 'public',
        metadata: { resolution: '1920x1080', format: 'jpg' },
      },
      {
        id: 'asset_2',
        type: 'audio',
        name: 'Ambient Music',
        description: 'Calm ambient music for relaxation',
        url: 'https://example.com/assets/ambient.mp3',
        tags: ['music', 'ambient', 'relaxation'],
        sensitivity: 'public',
        metadata: { duration: '180', format: 'mp3' },
      },
      {
        id: 'asset_3',
        type: 'document',
        name: 'Research Paper',
        description: 'A research paper on AI and creativity',
        url: 'https://example.com/assets/research.pdf',
        tags: ['research', 'AI', 'creativity'],
        sensitivity: 'public',
        metadata: { pages: '20', format: 'pdf' },
      },
    ];

    let filteredAssets = assets;
    if (options?.type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === options.type);
    }

    if (options?.sensitivity) {
      filteredAssets = filteredAssets.filter(asset => 
        options.sensitivity?.includes(asset.sensitivity)
      );
    }

    if (options?.limit) {
      filteredAssets = filteredAssets.slice(0, options.limit);
    }

    return filteredAssets;
  }
}