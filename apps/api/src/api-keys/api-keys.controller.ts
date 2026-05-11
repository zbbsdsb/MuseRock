import { Controller, Post, Get, Delete, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiProvider } from './entities/api-key.entity';

interface RequestWithUser extends Request {
  user: { id: string };
}

class SaveApiKeyDto {
  provider: ApiProvider;
  apiKey: string;
}

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async saveApiKey(
    @Body() dto: SaveApiKeyDto,
    @Req() req: RequestWithUser,
  ) {
    // TODO: Add JWT auth guard
    const userId = req.user?.id || 'anonymous';
    await this.apiKeysService.saveApiKey(userId, dto.provider, dto.apiKey);
    return { success: true, message: 'API key saved securely' };
  }

  @Get()
  async listApiKeys(@Req() req: RequestWithUser) {
    const userId = req.user?.id || 'anonymous';
    const keys = await this.apiKeysService.listApiKeys(userId);
    return { keys };
  }

  @Delete(':provider')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApiKey(
    @Req() req: RequestWithUser,
    provider: ApiProvider,
  ) {
    const userId = req.user?.id || 'anonymous';
    await this.apiKeysService.deleteApiKey(userId, provider);
  }
}