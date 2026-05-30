export type LoopStage = 'prime' | 'cloister' | 'divergence' | 'reflection';

export interface PrimeBrief {
  intent: string;
  constraints: string[];
  references: string[];
}

export interface IdeaCard {
  id: string;
  content: string;
  category: 'conflict' | 'symbolic' | 'structural' | 'character' | 'worldview';
  rationale: string;
  isKept: boolean | null;
  createdAt: string;
}

export interface ReflectionEntry {
  id: string;
  progressed: string;
  abandoned: string;
  nextEntry: string;
  createdAt: string;
}

export type ElementType = 'document' | 'section' | 'chapter' | 'scene' | 'paragraph' | 'list' | 'quote' | 'image' | 'video' | 'link' | 'code' | 'table' | 'divider' | 'canvas' | 'card' | 'audio';

export interface ProjectElement {
  id: string;
  type: ElementType;
  name: string;
  content: string;
  order: number;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  tags: string[];
  linkedElements: string[];
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  isPublic: boolean;
  allowComments: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
}

export interface ProjectMetadata {
  wordCount: number;
  characterCount: number;
  elementCount: number;
  lastEditSession: string;
  collaboratorCount: number;
  version: number;
  exportCount: number;
  lastEditAt: string;
  createdAt: string;
  createdWith?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  isFavorite: boolean;
  isArchived: boolean;
  elements: ProjectElement[];
  notes: Note[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  prime: PrimeBrief;
  cloister: {
    content: string;
    lastEditAt: string;
  };
  divergence: IdeaCard[];
  reflection: ReflectionEntry[];
  config: {
    currentStage: LoopStage;
    stageHistory: Array<{ stage: LoopStage; enteredAt: string; exitedAt: string | null }>;
    stageEnterCount: Record<LoopStage, number>;
  };
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  templateId?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
  prime?: Partial<PrimeBrief>;
  cloister?: Partial<Project['cloister']>;
  divergence?: Project['divergence'];
  reflection?: Project['reflection'];
  config?: Partial<Project['config']>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'novel' | 'script' | 'essay' | 'blank';
  elements: Partial<ProjectElement>[];
  notes: Partial<Note>[];
  settings: Partial<ProjectSettings>;
  prime?: Partial<PrimeBrief>;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  isPublic: false,
  allowComments: false,
  autoSave: true,
  autoSaveInterval: 30,
  theme: 'system',
  fontSize: 14,
  fontFamily: 'serif',
};

export const DEFAULT_PROJECT_METADATA: Omit<ProjectMetadata, 'createdAt' | 'lastEditAt'> = {
  wordCount: 0,
  characterCount: 0,
  elementCount: 0,
  lastEditSession: '',
  collaboratorCount: 0,
  version: 1,
  exportCount: 0,
};

export const DEFAULT_PRIME_BRIEF: PrimeBrief = {
  intent: '',
  constraints: [],
  references: [],
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty project',
    thumbnail: '',
    category: 'blank',
    elements: [],
    notes: [],
    settings: {},
  },
  {
    id: 'novel',
    name: 'Novel',
    description: 'Multi-chapter novel structure with character tracking',
    thumbnail: '',
    category: 'novel',
    elements: [
      { type: 'document', name: 'Chapter 1', order: 0 },
      { type: 'document', name: 'Characters', order: 1 },
      { type: 'document', name: 'World Notes', order: 2 },
    ],
    notes: [{ status: 'draft', tags: ['outline'] }],
    settings: {},
  },
  {
    id: 'script',
    name: 'Screenplay',
    description: 'Scene-based script with formatting',
    thumbnail: '',
    category: 'script',
    elements: [
      { type: 'document', name: 'Title Page', order: 0 },
      { type: 'document', name: 'Act 1', order: 1 },
      { type: 'document', name: 'Act 2', order: 2 },
    ],
    notes: [],
    settings: {},
  },
  {
    id: 'essay',
    name: 'Essay',
    description: 'Academic essay with outline and citations',
    thumbnail: '',
    category: 'essay',
    elements: [
      { type: 'document', name: 'Introduction', order: 0 },
      { type: 'document', name: 'Body', order: 1 },
      { type: 'document', name: 'Conclusion', order: 2 },
    ],
    notes: [],
    settings: {},
  },
];
