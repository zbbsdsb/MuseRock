import { JsonRpcRequest, JsonRpcResponse, JsonRpcError, JsonRpcErrorCode } from '../types/mcp.types';

export function createSuccessResponse<T>(id: string | number, result: T): JsonRpcResponse<T> {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

export function createErrorResponse(
  id: string | number | null,
  code: JsonRpcErrorCode,
  message: string,
  data?: unknown,
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      data,
    },
  };
}

export function createParseError(): JsonRpcResponse {
  return createErrorResponse(
    null,
    JsonRpcErrorCode.PARSE_ERROR,
    'Invalid JSON was received by the server.',
  );
}

export function createInvalidRequestError(id: string | number): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.INVALID_REQUEST,
    'The JSON sent is not a valid Request object.',
  );
}

export function createMethodNotFoundError(id: string | number, method: string): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.METHOD_NOT_FOUND,
    `The method "${method}" does not exist / is not available.`,
  );
}

export function createInvalidParamsError(id: string | number, message?: string): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.INVALID_PARAMS,
    message || 'Invalid method parameter(s).',
  );
}

export function createInternalError(id: string | number, error?: Error): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.INTERNAL_ERROR,
    error?.message || 'Internal error.',
    error?.stack,
  );
}

export function createAuthenticationError(id: string | number): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.AUTHENTICATION_FAILED,
    'Authentication failed. Invalid or missing token.',
  );
}

export function createPermissionDeniedError(id: string | number): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.PERMISSION_DENIED,
    'Permission denied. Insufficient permissions.',
  );
}

export function createRateLimitError(id: string | number): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded. Please try again later.',
  );
}

export function createResourceNotFoundError(id: string | number, resource?: string): JsonRpcResponse {
  return createErrorResponse(
    id,
    JsonRpcErrorCode.RESOURCE_NOT_FOUND,
    resource ? `Resource "${resource}" not found.` : 'Resource not found.',
  );
}

export function validateJsonRpcRequest(request: unknown): request is JsonRpcRequest {
  if (typeof request !== 'object' || request === null) {
    return false;
  }

  const req = request as JsonRpcRequest;

  if (req.jsonrpc !== '2.0') {
    return false;
  }

  if (typeof req.id !== 'string' && typeof req.id !== 'number') {
    return false;
  }

  if (typeof req.method !== 'string' || req.method.length === 0) {
    return false;
  }

  if (req.params !== undefined && (typeof req.params !== 'object' || req.params === null)) {
    return false;
  }

  return true;
}

export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}