# MuseRock API Documentation

## Overview

This document provides detailed information about the MuseRock API, including endpoints, request/response formats, and usage examples. The API is built using NestJS and follows RESTful principles for HTTP endpoints, while the MCP (Model Context Protocol) uses JSON-RPC for communication.

## Authentication

### OAuth 2.0 + PKCE Flow

1. **Authorization Request**:
   - Endpoint: `GET /auth/oasis`
   - Description: Initiates the OAuth flow with OasisBio
   - Redirects to OasisBio authorization page

2. **Callback**:
   - Endpoint: `GET /auth/callback`
   - Description: Handles the OAuth callback from OasisBio
   - Parameters: `code`, `state`
   - Stores tokens in httpOnly cookies

3. **User Info**:
   - Endpoint: `GET /auth/userinfo`
   - Description: Returns the current user's information
   - Headers: Requires authentication cookies

4. **Refresh Token**:
   - Endpoint: `POST /auth/refresh`
   - Description: Refreshes the access token
   - Headers: Requires authentication cookies

5. **Logout**:
   - Endpoint: `POST /auth/logout`
   - Description: Logs out the current user
   - Headers: Requires authentication cookies

## AI Service API

### Get Available Providers
- **Endpoint**: `GET /ai/providers`
- **Description**: Returns the list of available AI providers
- **Response**:
  ```json
  ["openai", "gemini"]
  ```

### Get Prompt Templates
- **Endpoint**: `GET /ai/prompts`
- **Description**: Returns all available prompt templates
- **Response**:
  ```json
  [
    {
      "id": "researcher-v1",
      "name": "Researcher",
      "role": "researcher",
      "version": "1.0.0",
      "variables": ["topic", "depth"],
      "description": "Expert research assistant for exploring topics"
    }
  ]
  ```

### Get Prompt Template by ID
- **Endpoint**: `GET /ai/prompts/{id}`
- **Description**: Returns a specific prompt template
- **Response**:
  ```json
  {
    "id": "researcher-v1",
    "name": "Researcher",
    "role": "researcher",
    "version": "1.0.0",
    "variables": ["topic", "depth"],
    "template": "You are MuseRock's Researcher...",
    "schema": { "type": "object", ... },
    "description": "Expert research assistant for exploring topics"
  }
  ```

### Create Prompt Template
- **Endpoint**: `POST /ai/prompts`
- **Description**: Creates a new prompt template
- **Request Body**:
  ```json
  {
    "name": "Custom Researcher",
    "role": "researcher",
    "template": "You are a custom researcher...",
    "variables": ["topic"],
    "description": "Custom research assistant",
    "schema": { "type": "object", ... }
  }
  ```
- **Response**: Created prompt template object

### Generate Content
- **Endpoint**: `POST /ai/generate`
- **Description**: Generates AI content
- **Request Body**:
  ```json
  {
    "prompt": "Tell me about renewable energy",
    "role": "researcher",
    "provider": "openai",
    "parameters": {
      "model": "gpt-4o-mini",
      "temperature": 0.7,
      "maxTokens": 1000
    }
  }
  ```
- **Response**:
  ```json
  {
    "content": "Renewable energy is...",
    "tokensUsed": {
      "prompt": 50,
      "completion": 200,
      "total": 250
    },
    "model": "gpt-4o-mini"
  }
  ```

### Generate Structured Content
- **Endpoint**: `POST /ai/generate-structured`
- **Description**: Generates structured JSON content
- **Request Body**: Same as generate content
- **Response**: JSON object with structured content

### Generate From Template
- **Endpoint**: `POST /ai/generate-from-template`
- **Description**: Generates content using a prompt template
- **Request Body**:
  ```json
  {
    "templateId": "researcher-v1",
    "variables": { "topic": "renewable energy", "depth": "detailed" },
    "userInput": "Research renewable energy sources",
    "provider": "openai",
    "parameters": { "temperature": 0.7 }
  }
  ```
- **Response**: Generated content based on template

## Memory Service API

### Store Memory
- **Endpoint**: `POST /memory`
- **Description**: Stores a memory item in the appropriate memory layer
- **Request Body**:
  ```json
  {
    "content": "Memory content",
    "metadata": { "type": "episodic" },
    "sensitivity": "public"
  }
  ```
- **Response**:
  ```json
  {
    "id": "memory-id",
    "content": "Memory content",
    "metadata": { "type": "episodic" },
    "timestamp": 1620000000000,
    "sensitivity": "public"
  }
  ```

### Search Memory
- **Endpoint**: `GET /memory/search`
- **Description**: Searches across memory layers
- **Query Parameters**:
  - `query`: Search query string
  - `sensitivity`: Comma-separated list of sensitivity levels (optional)
  - `layers`: Comma-separated list of memory layers (optional)
  - `limit`: Maximum number of results (optional, default: 10)
- **Response**:
  ```json
  [
    {
      "item": {
        "id": "memory-id",
        "content": "Memory content",
        "metadata": { "type": "episodic" },
        "timestamp": 1620000000000,
        "sensitivity": "public"
      },
      "score": 0.9,
      "layer": "episodic"
    }
  ]
  ```

### Retrieve Memory
- **Endpoint**: `GET /memory/{id}`
- **Description**: Retrieves a specific memory item
- **Response**:
  ```json
  {
    "id": "memory-id",
    "content": "Memory content",
    "metadata": { "type": "episodic" },
    "timestamp": 1620000000000,
    "sensitivity": "public"
  }
  ```

### Delete Memory
- **Endpoint**: `DELETE /memory/{id}`
- **Description**: Deletes a specific memory item
- **Response**:
  ```json
  {
    "success": true
  }
  ```

## Apprentice Service API

### Create Apprentice
- **Endpoint**: `POST /apprentice`
- **Description**: Creates a new apprentice (agent)
- **Request Body**:
  ```json
  {
    "name": "Research Assistant",
    "role": "researcher",
    "skills": ["research", "analysis", "summarization"],
    "budget": 1000,
    "timeout": 60000,
    "reviewMode": "auto"
  }
  ```
- **Response**:
  ```json
  {
    "id": "apprentice-id",
    "name": "Research Assistant",
    "role": "researcher",
    "skills": ["research", "analysis", "summarization"],
    "budget": 1000,
    "timeout": 60000,
    "reviewMode": "auto",
    "createdAt": 1620000000000,
    "lastUsed": 1620000000000
  }
  ```

### List Apprentices
- **Endpoint**: `GET /apprentice`
- **Description**: Lists all apprentices
- **Response**:
  ```json
  [
    {
      "id": "apprentice-id",
      "name": "Research Assistant",
      "role": "researcher",
      "skills": ["research", "analysis", "summarization"],
      "budget": 1000,
      "timeout": 60000,
      "reviewMode": "auto",
      "createdAt": 1620000000000,
      "lastUsed": 1620000000000
    }
  ]
  ```

### Create Job
- **Endpoint**: `POST /apprentice/job`
- **Description**: Creates a new job for an apprentice
- **Request Body**:
  ```json
  {
    "apprenticeId": "apprentice-id",
    "task": "Research renewable energy sources",
    "parameters": { "depth": "detailed", "sources": 5 }
  }
  ```
- **Response**:
  ```json
  {
    "id": "job-id",
    "apprenticeId": "apprentice-id",
    "task": "Research renewable energy sources",
    "parameters": { "depth": "detailed", "sources": 5 },
    "status": "pending",
    "tokensUsed": 0,
    "createdAt": 1620000000000
  }
  ```

### List Jobs
- **Endpoint**: `GET /apprentice/job`
- **Description**: Lists all jobs
- **Query Parameters**:
  - `apprenticeId`: Filter by apprentice ID (optional)
  - `status`: Filter by job status (optional)
- **Response**:
  ```json
  [
    {
      "id": "job-id",
      "apprenticeId": "apprentice-id",
      "task": "Research renewable energy sources",
      "parameters": { "depth": "detailed", "sources": 5 },
      "status": "completed",
      "result": { "research_results": [...], "sources": [...] },
      "tokensUsed": 150,
      "createdAt": 1620000000000,
      "startedAt": 1620000100000,
      "completedAt": 1620000200000
    }
  ]
  ```

## MCP Gateway

### JSON-RPC Format

```json
{
  "jsonrpc": "2.0",
  "method": "method_name",
  "params": {
    "param1": "value1",
    "param2": "value2"
  },
  "id": "request-id"
}
```

### Supported Methods

1. **search_memory**
   - **Parameters**:
     - `query`: Search query string
     - `options`: Optional search options
   - **Response**: Array of search results

2. **create_apprentice_job**
   - **Parameters**:
     - `apprenticeId`: Apprentice ID
     - `task`: Task description
     - `parameters`: Task parameters
   - **Response**: Job object

3. **fetch_bio_asset**
   - **Parameters**:
     - `assetId`: Asset ID
     - `accessToken`: OasisBio access token
   - **Response**: Asset data

4. **get_user_profile**
   - **Parameters**:
     - `userId`: User ID
     - `accessToken`: OasisBio access token
   - **Response**: User profile data

5. **list_apprentices**
   - **Parameters**: None
   - **Response**: Array of apprentices

6. **create_apprentice**
   - **Parameters**:
     - `name`: Apprentice name
     - `role`: Apprentice role
     - `skills`: Array of skills
     - `budget`: Optional token budget
     - `timeout`: Optional timeout in milliseconds
     - `reviewMode`: Optional review mode
   - **Response**: Apprentice object

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "details": "Parameter 'query' is required"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The following limits apply:

- **Auth endpoints**: 10 requests per minute per IP
- **Memory endpoints**: 30 requests per minute per user
- **Apprentice endpoints**: 20 requests per minute per user
- **MCP Gateway**: 50 requests per minute per user

## Examples

### Search Memory Example

```bash
curl "http://localhost:3001/memory/search?query=renewable%20energy&limit=5"
```

### Create Apprentice Example

```bash
curl -X POST http://localhost:3001/apprentice \
  -H "Content-Type: application/json" \
  -d '{"name": "Research Assistant", "role": "researcher", "skills": ["research", "analysis"]}'
```

### MCP Request Example

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "search_memory", "params": {"query": "renewable energy"}, "id": "1"}'
```

---

*Document updated on: 2026-05-08*
*Version: 1.1*
*Author: MuseRock Team*