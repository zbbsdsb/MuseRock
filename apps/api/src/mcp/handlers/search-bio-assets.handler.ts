import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OasisService } from '../../oasis/oasis.service';
import { MCPHandler } from './handler.registry';
import {
  Tool,
  SearchBioAssetsParams,
  SearchBioAssetsResult,
  User,
} from '../types/mcp.types';

/**
 * 搜索 Bio 资产工具
 */
@Injectable()
export class SearchBioAssetsHandler implements MCPHandler {
  constructor(private readonly oasisService: OasisService) {}

  getMethodName(): string {
    return 'search_bio_assets';
  }

  getToolDefinition(): Tool {
    return {
      name: 'search_bio_assets',
      description:
        'Search for bio assets using keywords. Can filter by asset type and sensitivity level.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query to match against asset names, descriptions, and tags',
          },
          accessToken: {
            type: 'string',
            description: 'Optional access token for accessing restricted assets',
          },
          type: {
            type: 'string',
            description: 'Asset type to filter by',
            enum: ['image', 'audio', 'video', 'document'],
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            minimum: 1,
            maximum: 50,
            default: 20,
          },
          sensitivity: {
            type: 'array',
            description: 'Sensitivity levels to include in results',
            items: { type: 'string', enum: ['public', 'restricted', 'private'] },
            default: ['public'],
          },
        },
        required: ['query'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    };
  }

  async execute(
    params: Record<string, unknown>,
    user?: User,
  ): Promise<SearchBioAssetsResult> {
    const validatedParams = this.validateParams(params);
    const assets = await this.oasisService.searchBioAssets(
      validatedParams.query,
      validatedParams.accessToken,
      {
        type: validatedParams.type,
        limit: validatedParams.limit,
        sensitivity: validatedParams.sensitivity,
      },
    );

    return {
      results: assets.map((asset) => ({
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

  private validateParams(params: Record<string, unknown>): SearchBioAssetsParams {
    const schema = z.object({
      query: z.string().min(1, 'Search query cannot be empty'),
      accessToken: z.string().optional(),
      type: z.enum(['image', 'audio', 'video', 'document']).optional(),
      limit: z.number().int().min(1).max(50).optional().default(20),
      sensitivity: z
        .array(z.enum(['public', 'restricted', 'private']))
        .optional()
        .default(['public']),
    });

    return schema.parse(params);
  }
}
