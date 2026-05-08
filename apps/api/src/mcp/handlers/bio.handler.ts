import { Injectable } from '@nestjs/common';
import { OasisService } from '../../oasis/oasis.service';
import { MCPHandler } from './handler.registry';
import { FetchBioAssetParams, FetchBioAssetResult, SearchBioAssetsParams, SearchBioAssetsResult, GetCharactersParams, GetCharactersResult, GetCharacterDetailParams, GetCharacterDetailResult } from '../types/mcp.types';

@Injectable()
export class BioHandler implements MCPHandler {
  constructor(private readonly oasisService: OasisService) {}

  getMethodName(): string {
    return 'fetch_bio_asset';
  }

  async execute(params: Record<string, unknown>, user?: { id: string; permissions: string[] }): Promise<FetchBioAssetResult | SearchBioAssetsResult | GetCharactersResult | GetCharacterDetailResult> {
    const accessToken = params.accessToken as string || '';
    const method = params.method as string || 'fetch_bio_asset';

    switch (method) {
      case 'search_bio_assets': {
        const searchParams = params as unknown as SearchBioAssetsParams;
        const assets = await this.oasisService.searchBioAssets(
          searchParams.query,
          accessToken,
          {
            type: searchParams.type,
            limit: searchParams.limit,
            sensitivity: searchParams.sensitivity,
          },
        );

        return {
          results: assets.map(asset => ({
            assetId: asset.id,
            name: asset.name,
            type: asset.type,
            description: asset.description,
            url: asset.url,
            sensitivity: asset.sensitivity,
            tags: asset.tags,
          })),
          total: assets.length,
        };
      }

      case 'list_characters': {
        const characters = await this.oasisService.getCharacters(accessToken);
        return {
          characters: characters.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            coverImage: c.coverImage,
            identityMode: c.identityMode,
          })),
          total: characters.length,
        };
      }

      case 'get_character': {
        const charParams = params as unknown as GetCharacterDetailParams;
        const character = await this.oasisService.getCharacterDetail(accessToken, charParams.characterId);
        
        if (!character) {
          return {
            error: 'Character not found',
          };
        }

        return {
          id: character.id,
          name: character.name,
          slug: character.slug,
          coverImage: character.coverImage,
          identityMode: character.identityMode,
          abilities: character.abilities,
          worlds: character.worlds,
          eras: character.eras,
          references: character.references,
        };
      }

      case 'fetch_bio_asset':
      default: {
        const fetchParams = params as unknown as FetchBioAssetParams;
        const asset = await this.oasisService.fetchBioAsset(
          fetchParams.assetId,
          accessToken,
        );

        return {
          assetId: asset.id,
          name: asset.name,
          type: asset.type,
          content: '',
          metadata: {
            ...asset.metadata,
            sensitivity: asset.sensitivity,
          },
          downloadUrl: asset.url,
        };
      }
    }
  }
}