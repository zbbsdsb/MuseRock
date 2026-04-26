export interface OasisUser {
  sub: string;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  email?: string;
}

export interface OasisTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface OasisAuthState {
  isAuthenticated: boolean;
  user: OasisUser | null;
  loading: boolean;
  error: string | null;
}

export interface OasisCharacter {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  coverImageUrl: string;
  visibility: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OasisCharacterDetail extends OasisCharacter {
  abilities: any[];
  eras: any[];
  worlds: any[];
  references: any[];
  models: any[];
}

export interface OasisDcosDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  folderPath: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface OasisError {
  error: string;
  error_description: string;
}