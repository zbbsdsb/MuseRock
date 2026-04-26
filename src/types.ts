export interface MuseRockState {
  apiKey: string;
  isSettingsOpen: boolean;
  activeTab: 'write' | 'search' | 'inspiration';
  content: string;
  history: MuseRockMessage[];
}

export interface MuseRockMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}
