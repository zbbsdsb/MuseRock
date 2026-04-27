import { Injectable, HttpException, HttpStatus, Ip } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';
import { ApprenticeService } from '../apprentice/apprentice.service';
import { OasisService } from '../oasis/oasis.service';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: any;
  id: string | number;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

interface RateLimitEntry {
  count: number;
  lastReset: number;
}

@Injectable()
export class McpService {
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 50;

  constructor(
    private readonly memoryService: MemoryService,
    private readonly apprenticeService: ApprenticeService,
    private readonly oasisService: OasisService,
  ) {}

  async handleRequest(request: JsonRpcRequest, @Ip() ip: string): Promise<JsonRpcResponse> {
    try {
      // Check rate limit
      if (!this.checkRateLimit(ip)) {
        throw new HttpException(
          'Rate limit exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Validate request
      this.validateRequest(request);

      const result = await this.executeMethod(request.method, request.params);
      return {
        jsonrpc: '2.0',
        result,
        id: request.id,
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: {
          code: error instanceof HttpException ? error.getStatus() : 500,
          message: error instanceof Error ? error.message : 'Internal server error',
          data: error instanceof HttpException ? error.getResponse() : undefined,
        },
        id: request.id,
      };
    }
  }

  private validateRequest(request: JsonRpcRequest): void {
    // Validate JSON-RPC version
    if (request.jsonrpc !== '2.0') {
      throw new HttpException(
        'Invalid JSON-RPC version. Only version 2.0 is supported.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate method
    if (!request.method || typeof request.method !== 'string') {
      throw new HttpException(
        'Invalid method. Method must be a non-empty string.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate id
    if (request.id === undefined || request.id === null) {
      throw new HttpException(
        'Invalid id. Id must be provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate params for specific methods
    this.validateParams(request.method, request.params);
  }

  private validateParams(method: string, params: any): void {
    switch (method) {
      case 'search_memory':
        if (!params || typeof params.query !== 'string') {
          throw new HttpException(
            'Invalid params for search_memory. Query must be a string.',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'create_apprentice_job':
        if (!params || typeof params.apprenticeId !== 'string' || typeof params.task !== 'string') {
          throw new HttpException(
            'Invalid params for create_apprentice_job. apprenticeId and task must be strings.',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'fetch_bio_asset':
      case 'get_user_profile':
        if (!params || typeof params.accessToken !== 'string') {
          throw new HttpException(
            `Invalid params for ${method}. accessToken must be a string.`,
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'create_apprentice':
        if (!params || typeof params.name !== 'string' || typeof params.role !== 'string' || !Array.isArray(params.skills)) {
          throw new HttpException(
            'Invalid params for create_apprentice. name and role must be strings, and skills must be an array.',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
    }
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const minuteInMs = 60 * 1000;

    let entry = this.rateLimits.get(ip);
    if (!entry) {
      entry = { count: 1, lastReset: now };
      this.rateLimits.set(ip, entry);
      return true;
    }

    // Reset counter if a minute has passed
    if (now - entry.lastReset > minuteInMs) {
      entry.count = 1;
      entry.lastReset = now;
      this.rateLimits.set(ip, entry);
      return true;
    }

    // Check if rate limit exceeded
    if (entry.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    // Increment counter
    entry.count++;
    this.rateLimits.set(ip, entry);
    return true;
  }

  private async executeMethod(method: string, params: any): Promise<any> {
    switch (method) {
      case 'search_memory':
        return this.searchMemory(params);
      case 'create_apprentice_job':
        return this.createApprenticeJob(params);
      case 'fetch_bio_asset':
        return this.fetchBioAsset(params);
      case 'get_user_profile':
        return this.getUserProfile(params);
      case 'list_apprentices':
        return this.listApprentices();
      case 'create_apprentice':
        return this.createApprentice(params);
      default:
        throw new HttpException(
          `Method ${method} not found`,
          HttpStatus.NOT_FOUND,
        );
    }
  }

  private async searchMemory(params: {
    query: string;
    options?: {
      sensitivity?: ('public' | 'restricted' | 'private')[];
      layers?: string[];
      limit?: number;
    };
  }): Promise<any> {
    return this.memoryService.searchMemory(params.query, params.options);
  }

  private async createApprenticeJob(params: {
    apprenticeId: string;
    task: string;
    parameters: Record<string, any>;
  }): Promise<any> {
    return this.apprenticeService.createJob(params);
  }

  private async fetchBioAsset(params: {
    assetId: string;
    accessToken: string;
  }): Promise<any> {
    return this.oasisService.fetchBioAsset(params.assetId, params.accessToken);
  }

  private async getUserProfile(params: {
    userId: string;
    accessToken: string;
  }): Promise<any> {
    return this.oasisService.getUserProfile(params.userId, params.accessToken);
  }

  private async listApprentices(): Promise<any> {
    return this.apprenticeService.listApprentices();
  }

  private async createApprentice(params: {
    name: string;
    role: string;
    skills: string[];
    budget?: number;
    timeout?: number;
    reviewMode?: 'auto' | 'manual';
  }): Promise<any> {
    return this.apprenticeService.createApprentice(params);
  }
}