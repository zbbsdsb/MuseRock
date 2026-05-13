# MuseRock API Documentation

## Overview

This document provides detailed information about the MuseRock API, including endpoints, request/response formats, and usage examples. The API is built using NestJS and follows RESTful principles.

## Base URL

- **Local Development**: `http://localhost:3001`
- **Production**: TBD

## Authentication

### API Keys & Cloud Mode

MuseRock supports two modes:

**Local Mode**:
- API keys stored in browser localStorage
- Direct API calls from frontend
- No backend required

**Cloud Mode**:
- API keys encrypted server-side (AES-256-GCM)
- API calls routed through backend
- Additional security features

### API Keys Endpoints

#### Save API Key
- **Endpoint**: `POST /api-keys`
- **Description**: Saves or updates an API key for a provider
- **Request Body**:
```json
{
  "provider": "gemini",
  "apiKey": "your-api-key-here"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "API key saved securely"
}
```

#### List API Keys
- **Endpoint**: `GET /api-keys`
- **Description**: Lists all configured API keys
- **Response**:
```json
{
  "keys": [
    {
      "provider": "gemini",
      "hasKey": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Delete API Key
- **Endpoint**: `DELETE /api-keys/:provider`
- **Description**: Deletes an API key
- **Response**: 204 No Content

## AI Service Endpoints

### Generate Content
- **Endpoint**: `POST /ai/generate`
- **Description**: Generates AI content
- **Request Body**:
```json
{
  "provider": "gemini",
  "prompt": "Tell me about renewable energy",
  "systemPrompt": "You are a helpful assistant.",
  "options": {
    "model": "gemini-1.5-pro",
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```
- **Response**:
```json
{
  "content": "Renewable energy is energy from renewable resources...",
  "tokensUsed": {
    "prompt": 50,
    "completion": 200,
    "total": 250
  },
  "model": "gemini-1.5-pro"
}
```

### Get Inspiration
- **Endpoint**: `POST /ai/inspiration`
- **Description**: Gets AI inspiration for writing
- **Request Body**:
```json
{
  "provider": "gemini",
  "context": "My protagonist just discovered...",
  "type": "divergence"
}
```
- **Response**:
```json
{
  "content": "What if the discovery was actually a trap..."
}
```

### Source Assets
- **Endpoint**: `POST /ai/source-assets`
- **Description**: Sources research assets
- **Request Body**:
```json
{
  "provider": "gemini",
  "query": "Historical deep cuts about ancient civilizations"
}
```
- **Response**:
```json
{
  "content": "Did you know that the ancient Egyptians..."
}
```

## Health Endpoints

### Health Check
- **Endpoint**: `GET /health`
- **Description**: Basic health check
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Readiness Check
- **Endpoint**: `GET /health/ready`
- **Description**: Readiness probe
- **Response**:
```json
{
  "status": "ready",
  "version": "1.0.0"
}
```

## AI Providers

### Supported Providers

| Provider | Models | Notes |
|----------|--------|-------|
| **Gemini** | gemini-1.5-pro, gemini-1.5-flash | Fast, good for creative writing |
| **OpenAI** | gpt-4o-mini, gpt-4o | Strong reasoning abilities |
| **Anthropic** | claude-3-haiku, claude-3-sonnet | Excellent at long-form text |

### Provider Configuration

#### Gemini
**Get API Key**: https://aistudio.google.com/app/apikey

**Models**:
- `gemini-1.5-pro`: Best quality
- `gemini-1.5-flash`: Fastest, good for quick ideas

#### OpenAI
**Get API Key**: https://platform.openai.com/api-keys

**Models**:
- `gpt-4o-mini`: Great value
- `gpt-4o`: Premium quality

#### Anthropic
**Get API Key**: https://console.anthropic.com/

**Models**:
- `claude-3-haiku`: Fastest
- `claude-3-sonnet`: Balanced
- `claude-3-opus`: Best quality (coming soon)

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 OK | Successful request |
| 204 No Content | Successful deletion |
| 400 Bad Request | Invalid request parameters |
| 401 Unauthorized | API key missing or invalid |
| 403 Forbidden | Access denied |
| 404 Not Found | Resource not found |
| 500 Internal Server Error | Server error |

### Error Response Format

```json
{
  "statusCode": 401,
  "message": "API key not configured for provider: gemini",
  "error": "Unauthorized"
}
```

## Rate Limiting

Currently, rate limiting is not enforced at the application level. Please respect the rate limits of the AI providers you're using.

## Examples

### cURL Example: Generate Content

```bash
curl -X POST http://localhost:3001/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "prompt": "Tell me a short story",
    "options": {
      "temperature": 0.7,
      "maxTokens": 500
    }
  }'
```

### cURL Example: Save API Key

```bash
curl -X POST http://localhost:3001/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "apiKey": "your-api-key"
  }'
```

## MCP Gateway (Coming Soon)

The Model Context Protocol gateway will provide JSON-RPC based methods for advanced features like memory search and apprentice job creation. Documentation will be added when this feature is available.

## Future Endpoints (Planned)

- `GET /auth/oasis` - OasisBio OAuth flow
- `GET /memory/search` - Memory search with embeddings
- `POST /apprentice` - Create AI apprentice
- `GET /metrics` - System metrics and observability

---

*Document updated on: 2026-05-13*
*Version: 2.0*
*Author: MuseRock Team*