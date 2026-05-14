import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  Tool,
  ToolAnnotations,
  Resource,
  Prompt,
  User,
} from '../types/mcp.types';
import {
  createSuccessResponse,
  createMethodNotFoundError,
  createInternalError,
} from '../utils/rpc.helpers';
import { ObservabilityService } from '../../observability/observability.service';

/**
 * 扩展的 MCP Handler 接口
 * 支持工具定义、资源和提示
 */
export interface MCPHandler {
  getMethodName(): string;
  getToolDefinition(): Tool;
  execute(params: Record<string, unknown>, user?: User): Promise<unknown>;
}

/**
 * 资源 Handler 接口
 */
export interface MCPResourceHandler {
  getResourceDefinitions(): Resource[];
  canReadResource(uri: string): boolean;
  readResource(uri: string, user?: User): Promise<unknown>;
}

/**
 * 提示 Handler 接口
 */
export interface MCPPromptHandler {
  getPromptDefinitions(): Prompt[];
  canGetPrompt(name: string): boolean;
  getPrompt(name: string, arguments?: Record<string, string>, user?: User): Promise<unknown>;
}

@Injectable()
export class HandlerRegistry {
  private toolHandlers = new Map<string, MCPHandler>();
  private resourceHandlers: MCPResourceHandler[] = [];
  private promptHandlers: MCPPromptHandler[] = [];

  constructor(private readonly observabilityService: ObservabilityService) {}

  /**
   * 注册工具 Handler
   */
  registerToolHandler(handler: MCPHandler): void {
    this.toolHandlers.set(handler.getMethodName(), handler);
  }

  /**
   * 注册资源 Handler
   */
  registerResourceHandler(handler: MCPResourceHandler): void {
    this.resourceHandlers.push(handler);
  }

  /**
   * 注册提示 Handler
   */
  registerPromptHandler(handler: MCPPromptHandler): void {
    this.promptHandlers.push(handler);
  }

  /**
   * 获取所有工具定义
   */
  listTools(): Tool[] {
    return Array.from(this.toolHandlers.values()).map(handler => handler.getToolDefinition());
  }

  /**
   * 获取所有资源定义
   */
  listResources(): Resource[] {
    return this.resourceHandlers.flatMap(handler => handler.getResourceDefinitions());
  }

  /**
   * 获取所有提示定义
   */
  listPrompts(): Prompt[] {
    return this.promptHandlers.flatMap(handler => handler.getPromptDefinitions());
  }

  /**
   * 获取工具 Handler
   */
  getToolHandler(method: string): MCPHandler {
    const handler = this.toolHandlers.get(method);
    if (!handler) {
      throw new HttpException(`Method ${method} not found`, HttpStatus.NOT_FOUND);
    }
    return handler;
  }

  /**
   * 处理 MCP 请求
   */
  async handleRequest(request: JsonRpcRequest, user?: User): Promise<JsonRpcResponse> {
    const startTime = Date.now();
    const method = request.method;

    try {
      // 标准 MCP 初始化/发现方法
      if (method === 'initialize') {
        return this.handleInitialize(request, startTime);
      }

      if (method === 'tools/list') {
        return this.handleListTools(request, startTime);
      }

      if (method === 'tools/call') {
        return this.handleCallTool(request, user, startTime);
      }

      if (method === 'resources/list') {
        return this.handleListResources(request, startTime);
      }

      if (method === 'resources/read') {
        return this.handleReadResource(request, user, startTime);
      }

      if (method === 'prompts/list') {
        return this.handleListPrompts(request, startTime);
      }

      if (method === 'prompts/get') {
        return this.handleGetPrompt(request, user, startTime);
      }

      // 向后兼容：直接调用工具方法
      if (this.toolHandlers.has(method)) {
        return this.handleCallLegacyTool(request, user, method, startTime);
      }

      this.observabilityService.recordMcpRequest(method, 'error', Date.now() - startTime);
      return createMethodNotFoundError(request.id);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.observabilityService.recordMcpRequest(method, 'error', duration);

      if (error instanceof HttpException) {
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

      this.observabilityService.recordMcpError(method, 'internal_error');
      return createInternalError(request.id, error as Error);
    }
  }

  /**
   * 处理 initialize 请求
   */
  private handleInitialize(request: JsonRpcRequest, startTime: number): JsonRpcResponse {
    const result = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      serverInfo: {
        name: 'MuseRock MCP Server',
        version: '1.0.0',
      },
    };

    this.observabilityService.recordMcpRequest('initialize', 'success', Date.now() - startTime);
    return createSuccessResponse(request.id, result);
  }

  /**
   * 处理 tools/list 请求
   */
  private handleListTools(request: JsonRpcRequest, startTime: number): JsonRpcResponse {
    const tools = this.listTools();

    this.observabilityService.recordMcpRequest('tools/list', 'success', Date.now() - startTime);
    return createSuccessResponse(request.id, { tools });
  }

  /**
   * 处理 tools/call 请求
   */
  private async handleCallTool(
    request: JsonRpcRequest,
    user: User | undefined,
    startTime: number,
  ): Promise<JsonRpcResponse> {
    const params = request.params as { name: string; arguments?: Record<string, unknown> };
    const toolName = params?.name;

    if (!toolName) {
      throw new HttpException('Tool name is required', HttpStatus.BAD_REQUEST);
    }

    const handler = this.getToolHandler(toolName);
    const result = await handler.execute(params?.arguments || {}, user);

    this.observabilityService.recordMcpRequest(`tools/call/${toolName}`, 'success', Date.now() - startTime);
    return createSuccessResponse(request.id, result);
  }

  /**
   * 处理 resources/list 请求
   */
  private handleListResources(request: JsonRpcRequest, startTime: number): JsonRpcResponse {
    const resources = this.listResources();

    this.observabilityService.recordMcpRequest('resources/list', 'success', Date.now() - startTime);
    return createSuccessResponse(request.id, { resources });
  }

  /**
   * 处理 resources/read 请求
   */
  private async handleReadResource(
    request: JsonRpcRequest,
    user: User | undefined,
    startTime: number,
  ): Promise<JsonRpcResponse> {
    const params = request.params as { uri: string };
    const uri = params?.uri;

    if (!uri) {
      throw new HttpException('Resource URI is required', HttpStatus.BAD_REQUEST);
    }

    for (const handler of this.resourceHandlers) {
      if (handler.canReadResource(uri)) {
        const content = await handler.readResource(uri, user);
        this.observabilityService.recordMcpRequest('resources/read', 'success', Date.now() - startTime);
        return createSuccessResponse(request.id, content);
      }
    }

    throw new HttpException(`Resource not found: ${uri}`, HttpStatus.NOT_FOUND);
  }

  /**
   * 处理 prompts/list 请求
   */
  private handleListPrompts(request: JsonRpcRequest, startTime: number): JsonRpcResponse {
    const prompts = this.listPrompts();

    this.observabilityService.recordMcpRequest('prompts/list', 'success', Date.now() - startTime);
    return createSuccessResponse(request.id, { prompts });
  }

  /**
   * 处理 prompts/get 请求
   */
  private async handleGetPrompt(
    request: JsonRpcRequest,
    user: User | undefined,
    startTime: number,
  ): Promise<JsonRpcResponse> {
    const params = request.params as { name: string; arguments?: Record<string, string> };
    const promptName = params?.name;

    if (!promptName) {
      throw new HttpException('Prompt name is required', HttpStatus.BAD_REQUEST);
    }

    for (const handler of this.promptHandlers) {
      if (handler.canGetPrompt(promptName)) {
        const result = await handler.getPrompt(promptName, params?.arguments, user);
        this.observabilityService.recordMcpRequest('prompts/get', 'success', Date.now() - startTime);
        return createSuccessResponse(request.id, result);
      }
    }

    throw new HttpException(`Prompt not found: ${promptName}`, HttpStatus.NOT_FOUND);
  }

  /**
   * 处理传统工具调用（向后兼容）
   */
  private async handleCallLegacyTool(
    request: JsonRpcRequest,
    user: User | undefined,
    method: string,
    startTime: number,
  ): Promise<JsonRpcResponse> {
    const handler = this.getToolHandler(method);
    const result = await handler.execute(request.params || {}, user);

    this.observabilityService.recordMcpRequest(method, 'success', Date.now() - startTime);
    return createSuccessResponse(request.id, result);
  }

  /**
   * 向后兼容：旧的方法列表
   */
  listMethods(): string[] {
    return Array.from(this.toolHandlers.keys());
  }
}
