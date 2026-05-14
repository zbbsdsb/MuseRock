import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OasisService } from '../../oasis/oasis.service';
import { MCPHandler } from './handler.registry';
import { Tool, GetCharactersParams, GetCharactersResult, User } from '../types/mcp.types';

/**
 * 列出角色工具
 */
@Injectable()
export class ListCharactersHandler implements MCPHandler {
  constructor(private readonly oasisService: OasisService) {}

  getMethodName(): string {
    return 'list_characters';
  }

  getToolDefinition(): Tool {
    return {
      name: 'list_characters',
      description:
        'Get a list of all characters available in the bio system. Returns basic character information including name, slug, and cover image.',
      inputSchema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'Optional access token for restricted characters',
          },
        },
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
  ): Promise<GetCharactersResult> {
    const validatedParams = this.validateParams(params);
    const characters = await this.oasisService.getCharacters(
      validatedParams.accessToken,
    );

    return {
      characters: characters.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        coverImage: c.coverImage,
        identityMode: c.identityMode,
      })),
      total: characters.length,
    };
  }

  private validateParams(params: Record<string, unknown>): GetCharactersParams {
    const schema = z.object({
      accessToken: z.string().optional(),
    });

    return schema.parse(params);
  }
}
