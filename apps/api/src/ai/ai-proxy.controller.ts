import { Controller, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { AIService } from './ai.service';
import { ApiProvider } from '../api-keys/entities/api-key.entity';

interface RequestWithUser extends Request {
  user: { id: string };
}

class GenerateContentDto {
  provider: ApiProvider;
  prompt: string;
  systemPrompt?: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

class GetInspirationDto {
  provider: ApiProvider;
  context: string;
  type: string;
}

class SourceAssetsDto {
  provider: ApiProvider;
  query: string;
}

@Controller('ai')
export class AIProxyController {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly aiService: AIService,
  ) {}

  @Post('generate')
  async generateContent(
    @Body() dto: GenerateContentDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const apiKey = await this.apiKeysService.getApiKey(userId, dto.provider);
    
    if (!apiKey) {
      throw new HttpException(
        `API key not configured for provider: ${dto.provider}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const result = await this.aiService.generateContent(
        dto.provider,
        apiKey,
        dto.prompt,
        dto.systemPrompt || 'You are a helpful assistant.',
        dto.options || {},
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('inspiration')
  async getInspiration(
    @Body() dto: GetInspirationDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const apiKey = await this.apiKeysService.getApiKey(userId, dto.provider);
    
    if (!apiKey) {
      throw new HttpException(
        `API key not configured for provider: ${dto.provider}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const result = await this.aiService.getInspiration(
        dto.provider,
        apiKey,
        dto.context,
        dto.type,
      );
      return { content: result };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get inspiration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('source-assets')
  async sourceAssets(
    @Body() dto: SourceAssetsDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const apiKey = await this.apiKeysService.getApiKey(userId, dto.provider);
    
    if (!apiKey) {
      throw new HttpException(
        `API key not configured for provider: ${dto.provider}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const result = await this.aiService.sourceAssets(
        dto.provider,
        apiKey,
        dto.query,
      );
      return { content: result };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to source assets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}