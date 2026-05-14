import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { MemoryService, SearchResult } from '../../memory/memory.service';
import { MCPHandler } from './handler.registry';
import {
  Tool,
  SearchMemoryParams,
  SearchMemoryResult,
  MemorySearchItem,
  User,
} from '../types/mcp.types';
import { ObservabilityService } from '../../observability/observability.service';

/**
 * 内存搜索工具：搜索项目记忆库
 */
@Injectable()
export class MemoryHandler implements MCPHandler {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  getMethodName(): string {
    return 'search_memory';
  }

  getToolDefinition(): Tool {
    return {
      name: 'search_memory',
      description:
        'Search the memory store for relevant content across different memory layers. Can filter by project, sensitivity level, and layer type.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query string to match against memory content',
          },
          layers: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['working', 'episodic', 'knowledge', 'contextual', 'compliance'],
            },
            description:
              'Memory layers to search: working (current session), episodic (events), knowledge (facts), contextual (context), compliance (policies)',
            default: ['working', 'episodic', 'knowledge'],
          },
          projectId: {
            type: 'string',
            description: 'Optional project ID to filter results to a specific project',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 20,
            minimum: 1,
            maximum: 100,
          },
          offset: {
            type: 'number',
            description: 'Offset for pagination',
            default: 0,
          },
          sensitivity: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['public', 'restricted', 'private'],
            },
            description: 'Sensitivity levels to include in search results',
            default: ['public', 'restricted'],
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
  ): Promise<SearchMemoryResult> {
    // 验证和转换参数
    const validatedParams = this.validateParams(params);
    const startTime = Date.now();

    const results = await this.memoryService.searchMemory({
      userId: user?.id || 'mcp-user',
      query: validatedParams.query,
      layers: validatedParams.layers,
      limit: validatedParams.limit || 20,
      sensitivity: validatedParams.sensitivity,
    });

    const duration = Date.now() - startTime;
    const layer =
      validatedParams.layers && validatedParams.layers.length > 0
        ? validatedParams.layers[0]
        : 'all';
    const sensitivity =
      validatedParams.sensitivity && validatedParams.sensitivity.length > 0
        ? validatedParams.sensitivity[0]
        : 'all';

    this.observabilityService.recordMemorySearch(
      layer,
      sensitivity,
      results.length,
      duration,
    );

    const memoryItems: MemorySearchItem[] = results.map(
      (result: SearchResult) => ({
        id: result.item.id,
        content: result.item.content,
        layer: result.layer,
        metadata: result.item.metadata,
        score: result.score,
        createdAt: new Date(result.item.timestamp).toISOString(),
      }),
    );

    return {
      results: memoryItems,
      total: memoryItems.length,
      took: duration,
    };
  }

  private validateParams(params: Record<string, unknown>): SearchMemoryParams {
    const schema = z.object({
      query: z.string().min(1, 'Search query cannot be empty'),
      layers: z
        .array(
          z.enum(['working', 'episodic', 'knowledge', 'contextual', 'compliance']),
        )
        .optional()
        .default(['working', 'episodic', 'knowledge']),
      projectId: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional().default(20),
      offset: z.number().int().min(0).optional().default(0),
      sensitivity: z
        .array(z.enum(['public', 'restricted', 'private']))
        .optional()
        .default(['public', 'restricted']),
    });

    return schema.parse(params);
  }
}
