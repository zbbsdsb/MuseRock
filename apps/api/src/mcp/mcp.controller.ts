import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { McpService } from './mcp.service';
import { JsonRpcRequest, JsonRpcResponse } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleJsonRpc(@Body() request: JsonRpcRequest): Promise<JsonRpcResponse> {
    return this.mcpService.handleRequest(request);
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async handleBatchJsonRpc(@Body() requests: JsonRpcRequest[]): Promise<JsonRpcResponse[]> {
    const responses = await Promise.all(
      requests.map(request => this.mcpService.handleRequest(request)),
    );
    return responses;
  }
}