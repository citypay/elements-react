/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EX_CP_PUBLIC_KEY?: string;
  readonly VITE_EX_CP_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
