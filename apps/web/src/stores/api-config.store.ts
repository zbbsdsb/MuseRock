import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiProvider, ApiKey, ModelParameters } from '../types/api-config';

interface ApiConfigState {
  apiKeys: Record<string, ApiKey[]>;
  activeProvider: ApiProvider;
  
  setActiveProvider: (provider: ApiProvider) => void;
  addApiKey: (provider: ApiProvider, key: ApiKey) => void;
  updateApiKey: (provider: ApiProvider, keyId: string, updates: Partial<ApiKey>) => void;
  removeApiKey: (provider: ApiProvider, keyId: string) => void;
  setActiveKey: (provider: ApiProvider, keyId: string) => void;
  setApiKeysForProvider: (provider: ApiProvider, keys: ApiKey[]) => void;
}

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      apiKeys: {},
      activeProvider: 'openai',
      
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      
      addApiKey: (provider, key) => set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [provider]: [...(state.apiKeys[provider] || []), key],
        },
      })),
      
      updateApiKey: (provider, keyId, updates) => set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [provider]: (state.apiKeys[provider] || []).map(key => 
            key.id === keyId ? { ...key, ...updates } : key
          ),
        },
      })),
      
      removeApiKey: (provider, keyId) => set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [provider]: (state.apiKeys[provider] || []).filter(key => key.id !== keyId),
        },
      })),
      
      setActiveKey: (provider, keyId) => set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [provider]: (state.apiKeys[provider] || []).map(key => ({
            ...key,
            isActive: key.id === keyId,
          })),
        },
      })),
      
      setApiKeysForProvider: (provider, keys) => set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [provider]: keys,
        },
      })),
    }),
    {
      name: 'api-config-storage',
    }
  )
);
