export type ApiProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface MuseRockState {
  apiProvider: ApiProvider;
  apiKeys: Record<ApiProvider, string>;
  isSettingsOpen: boolean;
  activeTab: 'write' | 'search' | 'inspiration';
  content: string;
  history: MuseRockMessage[];
  title: string;
}

export interface MuseRockMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

