import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LoopStage = 'prime' | 'cloister' | 'divergence' | 'reflection';

interface StageConfig {
  id: LoopStage;
  label: string;
  description: string;
  icon: string;
  aiMode: 'silent' | 'suggest' | 'evaluate' | 'reflect';
}

export const STAGE_CONFIG: Record<LoopStage, StageConfig> = {
  prime: {
    id: 'prime',
    label: 'Prime',
    description: 'Define your intent, constraints, and creative direction.',
    icon: 'Compass',
    aiMode: 'suggest',
  },
  cloister: {
    id: 'cloister',
    label: 'The Cloister',
    description: 'Deep writing with minimal distraction. AI stays silent.',
    icon: 'PenTool',
    aiMode: 'silent',
  },
  divergence: {
    id: 'divergence',
    label: 'Divergence',
    description: 'Explore contrasting ideas. AI generates divergent directions.',
    icon: 'Sparkles',
    aiMode: 'suggest',
  },
  reflection: {
    id: 'reflection',
    label: 'Reflection',
    description: 'Review what you created, abandoned, and where to go next.',
    icon: 'BookOpen',
    aiMode: 'reflect',
  },
};

export const STAGE_ORDER: LoopStage[] = ['prime', 'cloister', 'divergence', 'reflection'];

export interface IdeaCard {
  id: string;
  content: string;
  category: 'conflict' | 'symbolic' | 'structural' | 'character' | 'worldview';
  rationale: string;
  isKept: boolean | null;
  createdAt: Date;
}

export interface ReflectionEntry {
  id: string;
  progressed: string;
  abandoned: string;
  nextEntry: string;
  createdAt: Date;
}

interface CreativeLoopState {
  currentStage: LoopStage;
  stageHistory: { stage: LoopStage; enteredAt: Date; exitedAt: Date | null }[];

  primeBrief: {
    intent: string;
    constraints: string[];
    references: string[];
  };

  ideaCards: IdeaCard[];

  reflections: ReflectionEntry[];

  sessionStartTime: Date | null;
  stageEnterCount: Record<LoopStage, number>;

  setStage: (stage: LoopStage) => void;
  nextStage: () => void;
  previousStage: () => void;

  updatePrimeBrief: (brief: Partial<CreativeLoopState['primeBrief']>) => void;

  addIdeaCard: (card: Omit<IdeaCard, 'id' | 'createdAt' | 'isKept'>) => void;
  updateIdeaCard: (id: string, updates: Partial<IdeaCard>) => void;
  removeIdeaCard: (id: string) => void;
  clearIdeaCards: () => void;

  addReflection: (entry: Omit<ReflectionEntry, 'id' | 'createdAt'>) => void;

  startSession: () => void;
}

export const useCreativeLoopStore = create<CreativeLoopState>()(
  persist(
    (set, get) => ({
      currentStage: 'cloister',
      stageHistory: [],

      primeBrief: {
        intent: '',
        constraints: [],
        references: [],
      },

      ideaCards: [],

      reflections: [],

      sessionStartTime: null,
      stageEnterCount: {
        prime: 0,
        cloister: 0,
        divergence: 0,
        reflection: 0,
      },

      setStage: (stage) => set((state) => {
        const updatedHistory = state.stageHistory.map((h, i) =>
          i === state.stageHistory.length - 1 && !h.exitedAt
            ? { ...h, exitedAt: new Date() }
            : h
        );
        return {
          currentStage: stage,
          stageHistory: [
            ...updatedHistory,
            { stage, enteredAt: new Date(), exitedAt: null },
          ],
          stageEnterCount: {
            ...state.stageEnterCount,
            [stage]: state.stageEnterCount[stage] + 1,
          },
        };
      }),

      nextStage: () => set((state) => {
        const currentIndex = STAGE_ORDER.indexOf(state.currentStage);
        const nextIndex = (currentIndex + 1) % STAGE_ORDER.length;
        return {
          currentStage: STAGE_ORDER[nextIndex],
          stageHistory: [
            ...state.stageHistory.map((h, i) =>
              i === state.stageHistory.length - 1 && !h.exitedAt
                ? { ...h, exitedAt: new Date() }
                : h
            ),
            { stage: STAGE_ORDER[nextIndex], enteredAt: new Date(), exitedAt: null },
          ],
          stageEnterCount: {
            ...state.stageEnterCount,
            [STAGE_ORDER[nextIndex]]: state.stageEnterCount[STAGE_ORDER[nextIndex]] + 1,
          },
        };
      }),

      previousStage: () => set((state) => {
        const currentIndex = STAGE_ORDER.indexOf(state.currentStage);
        const prevIndex = currentIndex <= 0 ? STAGE_ORDER.length - 1 : currentIndex - 1;
        return {
          currentStage: STAGE_ORDER[prevIndex],
          stageHistory: [
            ...state.stageHistory.map((h, i) =>
              i === state.stageHistory.length - 1 && !h.exitedAt
                ? { ...h, exitedAt: new Date() }
                : h
            ),
            { stage: STAGE_ORDER[prevIndex], enteredAt: new Date(), exitedAt: null },
          ],
        };
      }),

      updatePrimeBrief: (brief) => set((state) => ({
        primeBrief: { ...state.primeBrief, ...brief },
      })),

      addIdeaCard: (card) => set((state) => ({
        ideaCards: [
          ...state.ideaCards,
          {
            ...card,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            isKept: null,
          },
        ],
      })),

      updateIdeaCard: (id, updates) => set((state) => ({
        ideaCards: state.ideaCards.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),

      removeIdeaCard: (id) => set((state) => ({
        ideaCards: state.ideaCards.filter((c) => c.id !== id),
      })),

      clearIdeaCards: () => set({ ideaCards: [] }),

      addReflection: (entry) => set((state) => ({
        reflections: [
          ...state.reflections,
          {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          },
        ],
      })),

      startSession: () => set({
        sessionStartTime: new Date(),
        currentStage: 'cloister',
        stageHistory: [{ stage: 'cloister', enteredAt: new Date(), exitedAt: null }],
        stageEnterCount: { prime: 0, cloister: 1, divergence: 0, reflection: 0 },
      }),
    }),
    {
      name: 'muserock-creative-loop',
      partialize: (state) => ({
        currentStage: state.currentStage,
        primeBrief: state.primeBrief,
        ideaCards: state.ideaCards,
        reflections: state.reflections,
      }),
    }
  )
);