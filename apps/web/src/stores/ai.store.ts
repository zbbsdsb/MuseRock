import { create } from 'zustand';

interface AIInspiration {
  id: string;
  type: 'plot' | 'character' | 'world' | 'dialogue';
  content: string;
  timestamp: Date;
}

interface AIState {
  isGenerating: boolean;
  inspirations: AIInspiration[];
  currentInspiration: AIInspiration | null;
  error: string | null;
  
  setGenerating: (generating: boolean) => void;
  addInspiration: (inspiration: AIInspiration) => void;
  setCurrentInspiration: (inspiration: AIInspiration | null) => void;
  clearInspirations: () => void;
  setError: (error: string | null) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  inspirations: [],
  currentInspiration: null,
  error: null,

  setGenerating: (generating) => set({ isGenerating: generating }),

  addInspiration: (inspiration) => set((state) => ({
    inspirations: [inspiration, ...state.inspirations].slice(0, 50),
  })),

  setCurrentInspiration: (inspiration) => set({ currentInspiration: inspiration }),

  clearInspirations: () => set({ inspirations: [], currentInspiration: null }),

  setError: (error) => set({ error }),
}));
