/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OASIS_CLIENT_ID: string;
  readonly VITE_OASIS_AUTH_URL: string;
  readonly VITE_OASIS_TOKEN_URL: string;
  readonly VITE_OASIS_USERINFO_URL: string;
  readonly VITE_OASIS_REDIRECT_URI: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_DATABASE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}