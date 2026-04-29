export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;
  isFavorite: boolean;
  elements: ProjectElement[];
  notes: Note[];
  settings: ProjectSettings;
}

export interface Note {
  id: string;
  content: string;
  tags: string[];
  linkedElements: string[];
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface InspirationCard {
  id: string;
  title: string;
  content: string;
  category: 'plot' | 'atmosphere' | 'character' | 'world' | 'dialogue' | 'theme';
  isFavorite: boolean;
  incubationStatus: 'new' | 'developing' | 'ready';
  linkedElements: string[];
  createdAt: Date;
}

export interface ProjectElement {
  id: string;
  type: 'document' | 'canvas' | 'card' | 'image';
  name: string;
  content: any;
  order: number;
}

export interface ProjectSettings {
  isPublic: boolean;
  allowComments: boolean;
}