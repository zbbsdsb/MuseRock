import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

@Injectable()
export class McpService {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly apprenticeService: ApprenticeService,
    private readonly oasisService: OasisService,
  ) {}

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
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