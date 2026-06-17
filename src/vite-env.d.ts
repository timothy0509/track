interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CONVEX_SITE_URL: string;
}
