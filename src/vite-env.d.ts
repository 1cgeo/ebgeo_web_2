// vite-env.d.ts
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_IMAGERY_PROVIDER_URL: string;
    readonly VITE_TERRAIN_PROVIDER_URL: string;
    readonly VITE_SOURCE_MODELS_URL?: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }