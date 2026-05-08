import { Controller, Post, Body, HttpCode, HttpStatus, Ip, Req } from '@nestjs/common';
import { Request } from 'express';
import { HandlerRegistry } from './handlers/handler.registry';
import { AuditService } from './services/audit.service';
import { JsonRpcRequest, JsonRpcResponse } from './types/mcp.types';
import { validateJsonRpcRequest, createParseError } from './utils/rpc.helpers';

@Controller('mcp')
export class McpController {
  constructor(
    private readonly handlerRegistry: HandlerRegistry,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleJsonRpc(
    @Body() body: unknown,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<JsonRpcResponse> {
    const startTime = Date.now();
    
    if (!validateJsonRpcRequest(body)) {
      await this.auditService.log({
        userId: 'unknown',
        method: 'invalid',
        params: {},
        responseCode: 400,
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || '',
        latency: Date.now() - startTime,
      });
      return createParseError();
    }

    const request = body as JsonRpcRequest;
    const user = req.user;

    try {
      const response = await this.handlerRegistry.handleRequest(request, user);
      
      await this.auditService.log({
        userId: user?.id || 'unknown',
        method: request.method,
        params: request.params || {},
        responseCode: 200,
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || '',
        latency: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      await this.auditService.log({
        userId: user?.id || 'unknown',
        method: request.method,
        params: request.params || {},
        responseCode: error instanceof Error ? 500 : 500,
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || '',
        latency: Date.now() - startTime,
      });

      throw error;
    }
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async handleBatchJsonRpc(
    @Body() bodies: unknown[],
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<JsonRpcResponse[]> {
    const user = req.user;
    
    return Promise.all(
      bodies.map(async (body) => {
        if (!validateJsonRpcRequest(body)) {
          return createParseError();
        }
        
        const request = body as JsonRpcRequest;
        return this.handlerRegistry.handleRequest(request, user);
      }),
    );
  }

  @Post('list_methods')
  @HttpCode(HttpStatus.OK)
  listMethods(): { methods: string[] } {
    return { methods: this.handlerRegistry.listMethods() };
  }
}