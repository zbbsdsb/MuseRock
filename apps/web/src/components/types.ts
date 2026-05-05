export type {
  Project,
  ProjectMetadata,
  ProjectSettings,
  ProjectTemplate,
  ProjectElement,
  Note,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFilters,
  ListOptions,
  ProjectList,
} from '../types/project';

export {
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_PROJECT_METADATA,
  PROJECT_TEMPLATES,
  createProject,
} from '../types/project';

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
