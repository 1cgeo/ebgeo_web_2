import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_IMAGERY_PROVIDER_URL: z.string().url(),
  VITE_TERRAIN_PROVIDER_URL: z.string(),
  VITE_SOURCE_MODELS_URL: z.string().optional(),
});

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_IMAGERY_PROVIDER_URL: import.meta.env.VITE_IMAGERY_PROVIDER_URL,
  VITE_TERRAIN_PROVIDER_URL: import.meta.env.VITE_TERRAIN_PROVIDER_URL,
  VITE_SOURCE_MODELS_URL: import.meta.env.VITE_SOURCE_MODELS_URL,
});

export const apiEndpoints = {
  featureSearch: `${env.VITE_API_URL}/busca`,
  featureInfo: `${env.VITE_API_URL}/feicoes`,
  modelCatalog: `${env.VITE_API_URL}/catalogo3d`,
} as const;