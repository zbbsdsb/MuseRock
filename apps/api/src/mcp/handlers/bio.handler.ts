import { Injectable } from '@nestjs/common';
import { OasisService } from '../../oasis/oasis.service';
import { MCPHandler } from './handler.registry';
import { FetchBioAssetParams, FetchBioAssetResult } from '../types/mcp.types';

@Injectable()
export class BioHandler implements MCPHandler {
  constructor(private readonly oasisService: OasisService) {}

  getMethodName(): string {
    return 'fetch_bio_asset';
  }

  async execute(params: Record<string, unknown>): Promise<FetchBioAssetResult> {
    const fetchParams = params as FetchBioAssetParams;
    
    const asset = await this.oasisService.fetchBioAsset(
      fetchParams.assetId,
      'dummy-token',
    );

    return {
      assetId: asset.id,
      name: asset.name || 'Unknown',
      type: 'image',
      content: asset.data || '',
      metadata: {
        size: asset.size || 0,
        sensitivity: 'normal',
      },
      downloadUrl: `https://api.muserock.io/assets/${asset.id}/download`,
    };
  }
}