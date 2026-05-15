import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ApiKey, ApiProvider, ModelParameters } from './entities/api-key.entity';

const scryptAsync = promisify(scrypt);

interface CreateApiKeyDto {
  provider: ApiProvider;
  apiKey: string;
  endpoint?: string;
  modelParameters?: ModelParameters;
  displayName?: string;
}

@Injectable()
export class ApiKeysService {
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly configService: ConfigService,
  ) {
    const masterKeyHex = this.configService.get<string>('API_KEY_ENCRYPTION_KEY');
    if (!masterKeyHex) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is required');
    }
  }

  private getMasterKey(): Buffer {
    const masterKeyHex = this.configService.get<string>('API_KEY_ENCRYPTION_KEY');
    return Buffer.from(masterKeyHex, 'hex');
  }

  async createApiKey(userId: string, dto: CreateApiKeyDto): Promise<ApiKey> {
    const { encrypted, iv } = await this.encrypt(dto.apiKey);

    const newKey = this.apiKeyRepository.create({
      userId,
      provider: dto.provider,
      encryptedKey: encrypted,
      iv,
      endpoint: dto.endpoint,
      modelParameters: dto.modelParameters,
      displayName: dto.displayName,
      isActive: false,
    });

    return this.apiKeyRepository.save(newKey);
  }

  async updateApiKey(
    userId: string,
    keyId: string,
    dto: Partial<CreateApiKeyDto>,
  ): Promise<ApiKey | null> {
    const key = await this.apiKeyRepository.findOne({
      where: { id: keyId, userId },
    });

    if (!key) {
      return null;
    }

    if (dto.apiKey) {
      const { encrypted, iv } = await this.encrypt(dto.apiKey);
      key.encryptedKey = encrypted;
      key.iv = iv;
    }

    if (dto.endpoint !== undefined) {
      key.endpoint = dto.endpoint;
    }

    if (dto.modelParameters) {
      key.modelParameters = dto.modelParameters;
    }

    if (dto.displayName !== undefined) {
      key.displayName = dto.displayName;
    }

    key.updatedAt = new Date();
    return this.apiKeyRepository.save(key);
  }

  async deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    const result = await this.apiKeyRepository.delete({ id: keyId, userId });
    return result.affected > 0;
  }

  async setActiveApiKey(userId: string, provider: ApiProvider, keyId: string): Promise<boolean> {
    await this.apiKeyRepository.update(
      { userId, provider },
      { isActive: false },
    );

    const result = await this.apiKeyRepository.update(
      { id: keyId, userId, provider },
      { isActive: true },
    );

    return result.affected > 0;
  }

  async getActiveApiKey(userId: string, provider: ApiProvider): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { userId, provider, isActive: true },
    });
  }

  async getDecryptedKey(userId: string, provider: ApiProvider): Promise<string | null> {
    const keyRecord = await this.getActiveApiKey(userId, provider);

    if (!keyRecord) {
      return null;
    }

    keyRecord.lastUsedAt = new Date();
    await this.apiKeyRepository.save(keyRecord);

    return this.decrypt(keyRecord.encryptedKey, keyRecord.iv);
  }

  async getApiKeyConfig(userId: string, provider: ApiProvider): Promise<{
    apiKey: string;
    endpoint?: string;
    modelParameters?: ModelParameters;
  } | null> {
    const keyRecord = await this.getActiveApiKey(userId, provider);

    if (!keyRecord) {
      return null;
    }

    keyRecord.lastUsedAt = new Date();
    await this.apiKeyRepository.save(keyRecord);

    return {
      apiKey: await this.decrypt(keyRecord.encryptedKey, keyRecord.iv),
      endpoint: keyRecord.endpoint,
      modelParameters: keyRecord.modelParameters,
    };
  }

  async listApiKeysByProvider(userId: string, provider: ApiProvider): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId, provider },
      order: { createdAt: 'DESC' },
    });
  }

  async listAllApiKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { provider: 'ASC', createdAt: 'DESC' },
    });
  }

  async testConnection(
    userId: string,
    keyId: string,
  ): Promise<{ success: boolean; message: string }> {
    const key = await this.apiKeyRepository.findOne({
      where: { id: keyId, userId },
    });

    if (!key) {
      return { success: false, message: 'API Key not found' };
    }

    key.lastTestedAt = new Date();
    key.isTested = true;

    try {
      const decryptedKey = await this.decrypt(key.encryptedKey, key.iv);

      let testSuccess = false;
      let testMessage = '';

      switch (key.provider) {
        case 'openai':
        case 'custom':
        case 'deo':
        case 'dia':
          testSuccess = await this.testOpenAiCompatibleConnection(decryptedKey, key.endpoint);
          testMessage = testSuccess ? 'Connection successful' : 'Connection failed';
          break;
        case 'anthropic':
          testSuccess = await this.testAnthropicConnection(decryptedKey);
          testMessage = testSuccess ? 'Connection successful' : 'Connection failed';
          break;
        case 'gemini':
          testSuccess = await this.testGeminiConnection(decryptedKey);
          testMessage = testSuccess ? 'Connection successful' : 'Connection failed';
          break;
        default:
          testMessage = 'Test not implemented for this provider';
      }

      key.testSuccess = testSuccess;
      await this.apiKeyRepository.save(key);

      return { success: testSuccess, message: testMessage };
    } catch (error) {
      key.testSuccess = false;
      await this.apiKeyRepository.save(key);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async testOpenAiCompatibleConnection(apiKey: string, endpoint?: string): Promise<boolean> {
    try {
      const baseUrl = endpoint || 'https://api.openai.com/v1';
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testAnthropicConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      return response.ok || response.status === 401;
    } catch {
      return false;
    }
  }

  private async testGeminiConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private async encrypt(text: string): Promise<{ encrypted: string; iv: string }> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.getMasterKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  private async decrypt(encrypted: string, iv: string): Promise<string> {
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedBuffer = Buffer.from(encrypted.slice(0, -32), 'hex');
    const authTag = Buffer.from(encrypted.slice(-32), 'hex');
    
    const decipher = createDecipheriv(this.algorithm, this.getMasterKey(), ivBuffer);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedBuffer.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
