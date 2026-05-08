import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JsonRpcRequest, JsonRpcResponse } from '../types/mcp.types';
import {
  createSuccessResponse,
  createMethodNotFoundError,
  createInternalError,
} from '../utils/rpc.helpers';

export interface MCPHandler {
  getMethodName(): string;
  execute(params: Record<string, unknown>, user?: { id: string; permissions: string[] }): Promise<unknown>;
}

@Injectable()
export class HandlerRegistry {
  private handlers = new Map<string, MCPHandler>();

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
    try {
      const handler = this.getHandler(request.method);
      const result = await handler.execute(request.params || {}, user);
      return createSuccessResponse(request.id, result);
    } catch (error) {
      if (error instanceof HttpException) {
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
      return createInternalError(request.id, error as Error);
    }
  }
}