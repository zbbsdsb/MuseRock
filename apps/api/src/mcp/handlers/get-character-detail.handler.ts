import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OasisService } from '../../oasis/oasis.service';
import { MCPHandler } from './handler.registry';
import {
  Tool,
  GetCharacterDetailParams,
  GetCharacterDetailResult,
  User,
} from '../types/mcp.types';

/**
 * 获取角色详情工具
 */
@Injectable()
export class GetCharacterDetailHandler implements MCPHandler {
  constructor(private readonly oasisService: OasisService) {}

  getMethodName(): string {
    return 'get_character_detail';
  }

  getToolDefinition(): Tool {
    return {
      name: 'get_character_detail',
      description:
        'Get detailed information about a specific character including abilities, associated worlds, historical eras, and reference materials.',
      inputSchema: {
        type: 'object',
        properties: {
          characterId: {
            type: 'string',
            description: 'Unique ID of the character to retrieve details for',
          },
          accessToken: {
            type: 'string',
            description: 'Optional access token for restricted character data',
          },
        },
        required: ['characterId'],
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
  ): Promise<GetCharacterDetailResult> {
    const validatedParams = this.validateParams(params);
    const character = await this.oasisService.getCharacterDetail(
      validatedParams.accessToken,
      validatedParams.characterId,
    );

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

  private validateParams(params: Record<string, unknown>): GetCharacterDetailParams {
    const schema = z.object({
      characterId: z.string().min(1, 'Character ID is required'),
      accessToken: z.string().optional(),
    });

    return schema.parse(params);
  }
}
