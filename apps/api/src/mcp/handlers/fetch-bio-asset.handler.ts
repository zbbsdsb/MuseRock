import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OasisService } from '../../oasis/oasis.service';
import { MCPHandler } from './handler.registry';
import { Tool, FetchBioAssetParams, FetchBioAssetResult, User } from '../types/mcp.types';

/**
 * 获取 Bio 资产工具
 */
@Injectable()
export class FetchBioAssetHandler implements MCPHandler {
  constructor(private readonly oasisService: OasisService) {}

  getMethodName(): string {
    return 'fetch_bio_asset';
  }

  getToolDefinition(): Tool {
    return {
      name: 'fetch_bio_asset',
      description:
        'Fetch a specific bio asset by ID. Assets can be images, videos, text, 3D models, or documents. Supports format transformations and downloads.',
      inputSchema: {
        type: 'object',
        properties: {
          assetId: {
            type: 'string',
            description: 'Unique ID of the bio asset to fetch',
          },
          accessToken: {
            type: 'string',
            description: 'Optional access token for protected assets',
          },
          format: {
            type: 'string',
            description: 'Format to retrieve the asset in',
            enum: ['raw', 'processed', 'visualization'],
            default: 'raw',
          },
          transformations: {
            type: 'object',
            description: 'Optional asset transformations',
            properties: {
              resize: {
                type: 'object',
                properties: {
                  width: { type: 'number', description: 'Target width in pixels' },
                  height: { type: 'number', description: 'Target height in pixels' },
                },
              },
              format: { type: 'string', description: 'Target format' },
            },
          },
        },
        required: ['assetId'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    };
  }

  async execute(
    params: Record<string, unknown>,
    user?: User,
  ): Promise<FetchBioAssetResult> {
    const validatedParams = this.validateParams(params);
    const asset = await this.oasisService.fetchBioAsset(
      validatedParams.assetId,
      validatedParams.accessToken,
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

  private validateParams(params: Record<string, unknown>): FetchBioAssetParams {
    const schema = z.object({
      assetId: z.string().min(1, 'Asset ID is required'),
      accessToken: z.string().optional(),
      format: z
        .enum(['raw', 'processed', 'visualization'])
        .optional()
        .default('raw'),
      transformations: z
        .object({
          resize: z
            .object({
              width: z.number().int().positive().optional(),
              height: z.number().int().positive().optional(),
            })
            .optional(),
          format: z.string().optional(),
        })
        .optional(),
    });

    return schema.parse(params);
  }
}
