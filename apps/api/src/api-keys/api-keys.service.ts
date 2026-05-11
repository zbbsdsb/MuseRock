import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ApiKey, ApiProvider } from './entities/api-key.entity';

const scryptAsync = promisify(scrypt);

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

  async saveApiKey(userId: string, provider: ApiProvider, apiKey: string): Promise<ApiKey> {
    const { encrypted, iv } = await this.encrypt(apiKey);

    const existingKey = await this.apiKeyRepository.findOne({
      where: { userId, provider },
    });

    if (existingKey) {
      existingKey.encryptedKey = encrypted;
      existingKey.iv = iv;
      existingKey.isActive = true;
      existingKey.updatedAt = new Date();
      return this.apiKeyRepository.save(existingKey);
    }

    const newKey = this.apiKeyRepository.create({
      userId,
      provider,
      encryptedKey: encrypted,
      iv,
      isActive: true,
    });

    return this.apiKeyRepository.save(newKey);
  }

  async getApiKey(userId: string, provider: ApiProvider): Promise<string | null> {
    const keyRecord = await this.apiKeyRepository.findOne({
      where: { userId, provider, isActive: true },
    });

    if (!keyRecord) {
      return null;
    }

    // Update last used timestamp
    keyRecord.lastUsedAt = new Date();
    await this.apiKeyRepository.save(keyRecord);

    return this.decrypt(keyRecord.encryptedKey, keyRecord.iv);
  }

  async deleteApiKey(userId: string, provider: ApiProvider): Promise<void> {
    await this.apiKeyRepository.delete({ userId, provider });
  }

  async listApiKeys(userId: string): Promise<{ provider: ApiProvider; hasKey: boolean; lastUsedAt?: Date }[]> {
    const keys = await this.apiKeyRepository.find({
      where: { userId, isActive: true },
      select: ['provider', 'lastUsedAt'],
    });

    const allProviders: ApiProvider[] = ['gemini', 'openai', 'anthropic', 'custom'];
    
    return allProviders.map(provider => {
      const key = keys.find(k => k.provider === provider);
      return {
        provider,
        hasKey: !!key,
        lastUsedAt: key?.lastUsedAt,
      };
    });
  }

  async validateApiKey(userId: string, provider: ApiProvider): Promise<boolean> {
    const key = await this.getApiKey(userId, provider);
    return !!key;
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