import { Controller, Post, Get, Delete, Put, Body, Req, UseGuards, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiProvider, ModelParameters } from './entities/api-key.entity';

interface RequestWithUser extends Request {
  user: { id: string };
}

class CreateApiKeyDto {
  provider: ApiProvider;
  apiKey: string;
  endpoint?: string;
  modelParameters?: ModelParameters;
  displayName?: string;
}

class UpdateApiKeyDto {
  apiKey?: string;
  endpoint?: string;
  modelParameters?: ModelParameters;
  displayName?: string;
}

class SetActiveDto {
  provider: ApiProvider;
}

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createApiKey(
    @Body() dto: CreateApiKeyDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const key = await this.apiKeysService.createApiKey(userId, dto);
    return { success: true, key };
  }

  @Put(':id')
  async updateApiKey(
    @Param('id') id: string,
    @Body() dto: UpdateApiKeyDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const key = await this.apiKeysService.updateApiKey(userId, id, dto);
    return { success: true, key };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApiKey(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    await this.apiKeysService.deleteApiKey(userId, id);
  }

  @Put(':id/activate')
  async setActiveApiKey(
    @Param('id') id: string,
    @Body() dto: SetActiveDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const success = await this.apiKeysService.setActiveApiKey(userId, dto.provider, id);
    return { success };
  }

  @Post(':id/test')
  async testConnection(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const result = await this.apiKeysService.testConnection(userId, id);
    return result;
  }

  @Get('provider/:provider')
  async listKeysByProvider(
    @Param('provider') provider: ApiProvider,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const keys = await this.apiKeysService.listApiKeysByProvider(userId, provider);
    return { keys };
  }

  @Get()
  async listAllApiKeys(@Req() req: RequestWithUser) {
    const userId = req.user?.id || 'anonymous';
    const keys = await this.apiKeysService.listAllApiKeys(userId);
    return { keys };
  }

  @Get('active/:provider')
  async getActiveKey(
    @Param('provider') provider: ApiProvider,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || 'anonymous';
    const key = await this.apiKeysService.getActiveApiKey(userId, provider);
    return { key };
  }
}
