export const JSON_RPC_SCHEMA = {
  type: 'object',
  properties: {
    jsonrpc: { type: 'string', enum: ['2.0'] },
    id: { oneOf: [{ type: 'string' }, { type: 'number' }] },
    method: { type: 'string' },
    params: { type: 'object', additionalProperties: true },
  },
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
};

export const SEARCH_MEMORY_SCHEMA = {
  type: 'object',
  properties: {
    query: { type: 'string', minLength: 1 },
    layers: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['working', 'episodic', 'knowledge', 'contextual', 'compliance'],
      },
      uniqueItems: true,
    },
    projectId: { type: 'string', format: 'uuid' },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    offset: { type: 'integer', minimum: 0 },
    sensitivity: {
      type: 'array',
      items: { type: 'string', enum: ['public', 'restricted', 'private'] },
      uniqueItems: true,
    },
  },
  required: ['query'],
  additionalProperties: false,
};

export const CREATE_APPRENTICE_JOB_SCHEMA = {
  type: 'object',
  properties: {
    agentType: { type: 'string', enum: ['researcher', 'writer', 'analyst', 'reviewer'] },
    task: { type: 'string', minLength: 1 },
    context: {
      type: 'object',
      properties: {
        projectId: { type: 'string', format: 'uuid' },
        memoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
      },
      additionalProperties: false,
    },
    budget: { type: 'integer', minimum: 1 },
    timeout: { type: 'integer', minimum: 1 },
    reviewMode: { type: 'boolean' },
  },
  required: ['agentType', 'task'],
  additionalProperties: false,
};

export const FETCH_BIO_ASSET_SCHEMA = {
  type: 'object',
  properties: {
    assetId: { type: 'string', format: 'uuid' },
    format: { type: 'string', enum: ['raw', 'processed', 'visualization'] },
    transformations: {
      type: 'object',
      properties: {
        resize: {
          type: 'object',
          properties: {
            width: { type: 'integer', minimum: 1 },
            height: { type: 'integer', minimum: 1 },
          },
          required: ['width', 'height'],
          additionalProperties: false,
        },
        format: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  required: ['assetId'],
  additionalProperties: false,
};

export const GENERATE_CONTENT_SCHEMA = {
  type: 'object',
  properties: {
    prompt: { type: 'string', minLength: 1 },
    model: { type: 'string', enum: ['gemini-1.5-pro', 'claude-3-opus', 'gpt-4'] },
    parameters: {
      type: 'object',
      properties: {
        temperature: { type: 'number', minimum: 0, maximum: 2 },
        maxTokens: { type: 'integer', minimum: 1, maximum: 32768 },
        topP: { type: 'number', minimum: 0, maximum: 1 },
        frequencyPenalty: { type: 'number', minimum: 0, maximum: 2 },
      },
      additionalProperties: false,
    },
    stream: { type: 'boolean' },
    memoryContext: {
      type: 'object',
      properties: {
        projectId: { type: 'string', format: 'uuid' },
        includeMemory: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  required: ['prompt'],
  additionalProperties: false,
};

export const MANAGE_PROMPTS_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'list'] },
    promptId: { type: 'string', format: 'uuid' },
    prompt: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        template: { type: 'string', minLength: 1 },
        category: { type: 'string', enum: ['writing', 'research', 'analysis', 'creative'] },
        variables: { type: 'array', items: { type: 'string' }, uniqueItems: true },
        description: { type: 'string' },
      },
      required: ['name', 'template', 'category', 'variables'],
      additionalProperties: false,
    },
    filters: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        search: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  required: ['action'],
  additionalProperties: false,
};

export const SCHEMAS: Record<string, object> = {
  search_memory: SEARCH_MEMORY_SCHEMA,
  create_apprentice_job: CREATE_APPRENTICE_JOB_SCHEMA,
  fetch_bio_asset: FETCH_BIO_ASSET_SCHEMA,
  generate_content: GENERATE_CONTENT_SCHEMA,
  manage_prompts: MANAGE_PROMPTS_SCHEMA,
};