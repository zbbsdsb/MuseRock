/**
 * MCP (Model Context Protocol) 完整类型定义
 * 基于官方协议规范，支持工具、资源和提示
 */

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export enum JsonRpcErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  AUTHENTICATION_FAILED = -32000,
  PERMISSION_DENIED = -32001,
  RATE_LIMIT_EXCEEDED = -32002,
  RESOURCE_NOT_FOUND = -32003,
}

export interface User {
  id: string;
  permissions: string[];
  email?: string;
}

// ============ 工具相关类型 ============

export interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  annotations?: ToolAnnotations;
}

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolResult {
  content: ToolContent[];
  isError?: boolean;
}

export interface ToolContent {
  type: 'text' | 'image' | 'audio' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
  resource?: ResourceReference;
}

export interface ResourceReference {
  uri: string;
  name?: string;
  description?: string;
}

// ============ 资源相关类型 ============

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  size?: number;
  annotations?: ResourceAnnotations;
}

export interface ResourceAnnotations {
  readOnlyHint?: boolean;
}

export interface ResourceContents {
  contents: ResourceContent[];
}

export interface ResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// ============ 提示相关类型 ============

export interface Prompt {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: PromptContent;
}

export interface PromptContent {
  type: 'text' | 'image' | 'audio' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
}

export interface PromptResult {
  messages: PromptMessage[];
}

// ============ 项目特定工具参数类型 ============

export interface SearchMemoryParams {
  query: string;
  layers?: ('working' | 'episodic' | 'knowledge' | 'contextual' | 'compliance')[];
  projectId?: string;
  limit?: number;
  offset?: number;
  sensitivity?: ('public' | 'restricted' | 'private')[];
}

export interface SearchMemoryResult {
  results: MemorySearchItem[];
  total: number;
  took: number;
}

export interface MemorySearchItem {
  id: string;
  content: string;
  layer: string;
  projectId?: string;
  metadata: Record<string, unknown>;
  score: number;
  createdAt: string;
}

export interface CreateApprenticeJobParams {
  agentType: 'researcher' | 'writer' | 'analyst' | 'reviewer';
  task: string;
  context?: {
    projectId?: string;
    memoryIds?: string[];
  };
  budget?: number;
  timeout?: number;
  reviewMode?: boolean;
}

export interface CreateApprenticeJobResult {
  jobId: string;
  status: string;
  queueName: string;
  estimatedCompletion: string;
  budgetRemaining: number;
}

export interface GetApprenticeJobParams {
  jobId: string;
}

export interface GetApprenticeJobResult {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: string;
  progress?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface FetchBioAssetParams {
  assetId: string;
  accessToken?: string;
  format?: 'raw' | 'processed' | 'visualization';
  transformations?: {
    resize?: { width: number; height: number };
    format?: string;
  };
}

export interface FetchBioAssetResult {
  assetId: string;
  name: string;
  type: 'image' | 'video' | 'text' | '3d' | 'audio' | 'document';
  content: string;
  metadata: Record<string, unknown>;
  downloadUrl: string;
}

export interface SearchBioAssetsParams {
  query: string;
  accessToken?: string;
  type?: 'image' | 'audio' | 'video' | 'document';
  limit?: number;
  sensitivity?: ('public' | 'restricted' | 'private')[];
}

export interface SearchBioAssetsResult {
  results: {
    assetId: string;
    name: string;
    type: 'image' | 'audio' | 'video' | 'document';
    description: string;
    url: string;
    sensitivity: 'public' | 'restricted' | 'private';
    tags: string[];
  }[];
  total: number;
}

export interface GetCharactersParams {
  accessToken?: string;
}

export interface GetCharactersResult {
  characters: {
    id: string;
    name: string;
    slug: string;
    coverImage?: string;
    identityMode?: string;
  }[];
  total: number;
}

export interface GetCharacterDetailParams {
  characterId: string;
  accessToken?: string;
}

export interface GetCharacterDetailResult {
  id?: string;
  name?: string;
  slug?: string;
  coverImage?: string;
  identityMode?: string;
  abilities?: any[];
  worlds?: any[];
  eras?: any[];
  references?: any[];
  error?: string;
}

export interface GenerateContentParams {
  prompt: string;
  model?: 'gemini-1.5-pro' | 'gemini-2.0-flash' | 'claude-3-opus' | 'claude-3-5-sonnet' | 'gpt-4o' | 'gpt-4-turbo';
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
  };
  stream?: boolean;
  memoryContext?: {
    projectId?: string;
    includeMemory?: boolean;
  };
}

export interface GenerateContentResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
  citations: unknown[];
}

export interface ManagePromptsParams {
  action: 'create' | 'read' | 'update' | 'delete' | 'list';
  promptId?: string;
  prompt?: {
    name: string;
    template: string;
    category: 'writing' | 'research' | 'analysis' | 'creative';
    variables: string[];
    description?: string;
  };
  filters?: {
    category?: string;
    search?: string;
  };
}

export interface ManagePromptsResult {
  prompts?: PromptTemplate[];
  total?: number;
  prompt?: PromptTemplate;
  success?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  category: string;
  variables: string[];
  description?: string;
  createdAt: string;
  usageCount: number;
}

// ============ 新增项目管理工具 ============

export interface CreateProjectParams {
  name: string;
  description?: string;
  projectType?: 'novel' | 'script' | 'game' | 'other';
}

export interface CreateProjectResult {
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface GetProjectsParams {
  limit?: number;
  offset?: number;
}

export interface GetProjectsResult {
  projects: {
    id: string;
    name: string;
    description?: string;
    type?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
}

export interface GetProjectParams {
  projectId: string;
}

export interface GetProjectResult {
  id: string;
  name: string;
  description?: string;
  type?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProjectParams {
  projectId: string;
  name?: string;
  description?: string;
  content?: string;
}

export interface UpdateProjectResult {
  success: boolean;
  projectId: string;
}

// ============ 审计和限流类型 ============

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  method: string;
  params: Record<string, unknown>;
  responseCode: number;
  ipAddress: string;
  userAgent: string;
  latency: number;
  resourceId?: string;
}

export interface PluginManifest {
  name: string;
  version: string;
  author: string;
  description?: string;
  permissions: string[];
  icon?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: number;
}

export interface RateLimitEntry {
  userId: string;
  endpoint: string;
  count: number;
  windowStart: number;
}
