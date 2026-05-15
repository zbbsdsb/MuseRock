export type ApiProvider = 'gemini' | 'openai' | 'anthropic' | 'custom' | 'deo' | 'dia';

export interface ModelParameters {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface ApiKey {
  id: string;
  userId: string;
  provider: ApiProvider;
  endpoint?: string;
  modelParameters?: ModelParameters;
  isActive: boolean;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  lastTestedAt?: string;
  isTested: boolean;
  testSuccess: boolean;
}
