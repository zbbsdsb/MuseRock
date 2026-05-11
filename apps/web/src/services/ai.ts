import { ApiProvider } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class AIService {
  private provider: ApiProvider;

  constructor(provider: ApiProvider, _apiKey: string) {
    this.provider = provider;
    // API Key is now stored server-side, not used client-side
  }

  async getInspiration(context: string, type: string): Promise<string> {
    const response = await fetch(`${API_URL}/ai/inspiration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        provider: this.provider,
        context,
        type,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get inspiration');
    }

    const data = await response.json();
    return data.content;
  }

  async sourceAssets(query: string): Promise<string> {
    const response = await fetch(`${API_URL}/ai/source-assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        provider: this.provider,
        query,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to source assets');
    }

    const data = await response.json();
    return data.content;
  }

  async generateContent(
    prompt: string,
    systemPrompt?: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        provider: this.provider,
        prompt,
        systemPrompt,
        options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate content');
    }

    return response.json();
  }
}

// API Key Management Service
export class ApiKeyService {
  async saveApiKey(provider: ApiProvider, apiKey: string): Promise<void> {
    const response = await fetch(`${API_URL}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        provider,
        apiKey,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to save API key');
    }
  }

  async listApiKeys(): Promise<{ provider: ApiProvider; hasKey: boolean; lastUsedAt?: Date }[]> {
    const response = await fetch(`${API_URL}/api-keys`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to list API keys');
    }

    const data = await response.json();
    return data.keys;
  }

  async deleteApiKey(provider: ApiProvider): Promise<void> {
    const response = await fetch(`${API_URL}/api-keys/${provider}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete API key');
    }
  }
}