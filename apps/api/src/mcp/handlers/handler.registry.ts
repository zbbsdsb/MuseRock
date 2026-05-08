import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JsonRpcRequest, JsonRpcResponse } from '../types/mcp.types';
import {
  createSuccessResponse,
  createMethodNotFoundError,
  createInternalError,
} from '../utils/rpc.helpers';
import { ObservabilityService } from '../../observability/observability.service';

export interface MCPHandler {
  getMethodName(): string;
  execute(params: Record<string, unknown>, user?: { id: string; permissions: string[] }): Promise<unknown>;
}

@Injectable()
export class HandlerRegistry {
  private handlers = new Map<string, MCPHandler>();

  constructor(private readonly observabilityService: ObservabilityService) {}

  register(handler: MCPHandler): void {
    this.handlers.set(handler.getMethodName(), handler);
  }

  getHandler(method: string): MCPHandler {
    const handler = this.handlers.get(method);
    if (!handler) {
      throw new HttpException(`Method ${method} not found`, HttpStatus.NOT_FOUND);
    }
    return handler;
  }

  listMethods(): string[] {
    return Array.from(this.handlers.keys());
  }

  async handleRequest(request: JsonRpcRequest, user?: { id: string; permissions: string[] }): Promise<JsonRpcResponse> {
    const startTime = Date.now();
    const method = request.method;

    try {
      const handler = this.getHandler(method);
      const result = await handler.execute(request.params || {}, user);
      const duration = Date.now() - startTime;
      this.observabilityService.recordMcpRequest(method, 'success', duration);
      return createSuccessResponse(request.id, result);
    } catch (error) {
      const duration = Date.now() - startTime;
      if (error instanceof HttpException) {
        this.observabilityService.recordMcpRequest(method, 'error', duration);
        this.observabilityService.recordMcpError(method, error.message);
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: error.getStatus(),
            message: error.message,
            data: error.getResponse(),
          },
        };
      }
      this.observabilityService.recordMcpRequest(method, 'error', duration);
      this.observabilityService.recordMcpError(method, 'internal_error');
      return createInternalError(request.id, error as Error);
    }
  }
}