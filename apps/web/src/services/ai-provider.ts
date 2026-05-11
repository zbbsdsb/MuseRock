import { ApiProvider } from "../types";

/**
 * AIProvider - Abstraction layer for local vs cloud mode
 *
 * Mode: 'local'  - API keys stored in localStorage, calls AI APIs directly
 * Mode: 'cloud' - API keys stored server-side (encrypted), calls backend proxy
 *
 * Switch via: setAiMode(mode) in settings
 */

const STORAGE_KEY = 'muserock_ai_mode';

export type AIMode = 'local' | 'cloud';

export function getAIMode(): AIMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'local' ? 'local' : 'cloud';
}

export function setAIMode(mode: AIMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
}

// -------- Local Mode: direct AI API calls --------

const LOCAL_KEYS_KEY = 'muserock_local_keys';

function getLocalKeys(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEYS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveLocalApiKey(provider: ApiProvider, key: string): void {
  const keys = getLocalKeys();
  keys[provider] = key;
  localStorage.setItem(LOCAL_KEYS_KEY, JSON.stringify(keys));
}

export function getLocalApiKey(provider: ApiProvider): string {
  return getLocalKeys()[provider] || '';
}

export function removeLocalApiKey(provider: ApiProvider): void {
  const keys = getLocalKeys();
  delete keys[provider];
  localStorage.setItem(LOCAL_KEYS_KEY, JSON.stringify(keys));
}

// -------- Cloud Mode: backend proxy --------

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class CloudAIService {
  private provider: ApiProvider;

  constructor(provider: ApiProvider) {
    this.provider = provider;
  }

  async generateContent(
    prompt: string,
    systemPrompt?: string,
    options?: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider: this.provider, prompt, systemPrompt, options }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async getInspiration(context: string, type: string): Promise<string> {
    const response = await fetch(`${API_URL}/ai/inspiration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider: this.provider, context, type }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.content;
  }

  async sourceAssets(query: string): Promise<string> {
    const response = await fetch(`${API_URL}/ai/source-assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider: this.provider, query }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.content;
  }
}

export class CloudApiKeyService {
  async saveApiKey(provider: ApiProvider, apiKey: string): Promise<void> {
    const response = await fetch(`${API_URL}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider, apiKey }),
    });
    if (!response.ok) throw new Error(await response.text());
  }

  async listApiKeys(): Promise<{ provider: ApiProvider; hasKey: boolean; lastUsedAt?: string }[]> {
    const response = await fetch(`${API_URL}/api-keys`, { credentials: 'include' });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.keys;
  }

  async deleteApiKey(provider: ApiProvider): Promise<void> {
    const response = await fetch(`${API_URL}/api-keys/${provider}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(await response.text());
  }
}

// -------- Local Mode: direct AI API calls --------

const AI_API_BASE: Record<ApiProvider, string> = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  custom: '',
};

export class LocalAIService {
  private provider: ApiProvider;

  constructor(provider: ApiProvider) {
    this.provider = provider;
  }

  async generateContent(
    prompt: string,
    systemPrompt?: string,
    options?: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<{ content: string; tokensUsed: { prompt: number; completion: number; total: number } }> {
    const apiKey = getLocalApiKey(this.provider);
    if (!apiKey) throw new Error(`No API key configured for ${this.provider}`);

    switch (this.provider) {
      case 'gemini':
        return this.callGemini(apiKey, prompt, systemPrompt, options);
      case 'openai':
        return this.callOpenAI(apiKey, prompt, systemPrompt, options);
      case 'anthropic':
        return this.callAnthropic(apiKey, prompt, systemPrompt, options);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  async getInspiration(context: string, type: string): Promise<string> {
    const prompt = `Context: ${context}\n\nTask: Provide creation assistance for a creator based on this context. Focus on ${type}. Keep it brief, evocative, and high-impact. Avoid clichés.`;
    const systemPrompt = 'You are MuseRock, an elite creation assistant.';
    const result = await this.generateContent(prompt, systemPrompt, { temperature: 0.8 });
    return result.content;
  }

  async sourceAssets(query: string): Promise<string> {
    const prompt = `Search Query: ${query}\n\nTask: Act as a creation assistant. Find 3-5 high-quality references, data points, or sources relevant to this query.`;
    const systemPrompt = 'You are MuseRock Creation Assistant.';
    const result = await this.generateContent(prompt, systemPrompt, { temperature: 0.3 });
    return result.content;
  }

  private async callGemini(apiKey: string, prompt: string, systemPrompt?: string, options?: any): Promise<any> {
    const model = options?.model || 'gemini-1.5-flash';
    const url = `${AI_API_BASE.gemini}/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { content: text, tokensUsed: { prompt: 0, completion: 0, total: 0 } };
  }

  private async callOpenAI(apiKey: string, prompt: string, systemPrompt?: string, options?: any): Promise<any> {
    const model = options?.model || 'gpt-4o-mini';
    const url = `${AI_API_BASE.openai}/chat/completions`;
    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      tokensUsed: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
    };
  }

  private async callAnthropic(apiKey: string, prompt: string, systemPrompt?: string, options?: any): Promise<any> {
    const model = options?.model || 'claude-3-5-sonnet-20241022';
    const url = `${AI_API_BASE.anthropic}/messages`;
    const body = {
      model,
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      system: systemPrompt || 'You are a helpful assistant.',
      messages: [{ role: 'user', content: prompt }],
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return {
      content: text,
      tokensUsed: {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }
}

// -------- Factory --------

export function createAIService(provider: ApiProvider): LocalAIService | CloudAIService {
  const mode = getAIMode();
  if (mode === 'local') {
    return new LocalAIService(provider);
  }
  return new CloudAIService(provider);
}

export function createApiKeyService(): { save: (p: ApiProvider, k: string) => Promise<void>; list: () => Promise<any>; delete: (p: ApiProvider) => Promise<void> } {
  const mode = getAIMode();
  if (mode === 'local') {
    return {
      save: async (provider: ApiProvider, apiKey: string) => { saveLocalApiKey(provider, apiKey); },
      list: async () => {
        const keys = getLocalKeys();
        return Object.entries(keys).map(([provider]) => ({ provider, hasKey: !!keys[provider] }));
      },
      delete: async (provider: ApiProvider) => { removeLocalApiKey(provider); },
    };
  }
  const svc = new CloudApiKeyService();
  return {
    save: (p, k) => svc.saveApiKey(p, k),
    list: () => svc.listApiKeys(),
    delete: (p) => svc.deleteApiKey(p),
  };
}
