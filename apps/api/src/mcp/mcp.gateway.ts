import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HandlerRegistry } from './handlers/handler.registry';
import { JsonRpcRequest, JsonRpcResponse } from './types/mcp.types';
import { validateJsonRpcRequest, createParseError } from './utils/rpc.helpers';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MCPGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeConnections = new Set<string>();

  constructor(private readonly handlerRegistry: HandlerRegistry) {}

  handleConnection(client: Socket) {
    this.activeConnections.add(client.id);
  }

  handleDisconnect(client: Socket) {
    this.activeConnections.delete(client.id);
  }

  @SubscribeMessage('rpc')
  async handleRpc(client: Socket, payload: unknown): Promise<JsonRpcResponse> {
    if (!validateJsonRpcRequest(payload)) {
      return createParseError();
    }

    const request = payload as JsonRpcRequest;
    
    return this.handlerRegistry.handleRequest(request);
  }

  @SubscribeMessage('batch')
  async handleBatch(client: Socket, payload: unknown[]): Promise<JsonRpcResponse[]> {
    const responses: JsonRpcResponse[] = [];

    for (const item of payload) {
      if (!validateJsonRpcRequest(item)) {
        responses.push(createParseError());
        continue;
      }

      const request = item as JsonRpcRequest;
      const response = await this.handlerRegistry.handleRequest(request);
      responses.push(response);
    }

    return responses;
  }

  @SubscribeMessage('list_methods')
  handleListMethods(): string[] {
    return this.handlerRegistry.listMethods();
  }
}