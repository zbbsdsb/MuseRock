import { Injectable } from '@nestjs/common';
import { MemoryService, SearchResult } from '../../memory/memory.service';
import { MCPHandler } from './handler.registry';
import { SearchMemoryParams, SearchMemoryResult, MemorySearchItem } from '../types/mcp.types';

@Injectable()
export class MemoryHandler implements MCPHandler {
  constructor(private readonly memoryService: MemoryService) {}

  getMethodName(): string {
    return 'search_memory';
  }

  async execute(params: Record<string, unknown>, user?: { id: string; permissions: string[] }): Promise<SearchMemoryResult> {
    const searchParams = params as SearchMemoryParams;
    const startTime = Date.now();

    const results = await this.memoryService.searchMemory({
      userId: user?.id || 'mcp-user',
      query: searchParams.query,
      layers: searchParams.layers,
      limit: searchParams.limit || 20,
      sensitivity: searchParams.sensitivity,
    });

    const memoryItems: MemorySearchItem[] = results.map((result: SearchResult) => ({
      id: result.item.id,
      content: result.item.content,
      layer: result.layer,
      metadata: result.item.metadata,
      score: result.score,
      createdAt: new Date(result.item.timestamp).toISOString(),
    }));

    return {
      results: memoryItems,
      total: memoryItems.length,
      took: Date.now() - startTime,
    };
  }
}