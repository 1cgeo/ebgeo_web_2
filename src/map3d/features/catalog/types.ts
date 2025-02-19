// Path: map3d\features\catalog\types.ts
import { z } from 'zod';

// Base schema for all 3D model types
const baseModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  url: z.string(),
  lon: z.number(),
  lat: z.number(),
  height: z.number(),
  data_criacao: z.string(),
  municipio: z.string(),
  estado: z.string(),
  palavras_chave: z.array(z.string()),
});

// Schema for 3D Tiles
export const tiles3DSchema = baseModelSchema.extend({
  type: z.literal('Tiles 3D'),
  heightoffset: z.number(),
  maximumscreenspaceerror: z.number(),
});

// Schema for 3D Models
export const modelos3DSchema = baseModelSchema.extend({
  type: z.literal('Modelos 3D'),
  heading: z.number(),
  pitch: z.number(),
  roll: z.number(),
});

// Schema for Point Clouds
export const pointCloudSchema = baseModelSchema.extend({
  type: z.literal('Nuvem de Pontos'),
  heightoffset: z.number(),
  maximumscreenspaceerror: z.number(),
  style: z.record(z.unknown()),
});

// Unified schema for all model types
export const catalogItemSchema = z.discriminatedUnion('type', [
  tiles3DSchema,
  modelos3DSchema,
  pointCloudSchema,
]);

// Schema for API response
export const catalogResponseSchema = z.object({
  data: z.array(catalogItemSchema),
  total: z.number(),
  page: z.number(),
});

// Schema for search parameters
export const catalogSearchParamsSchema = z.object({
  q: z.string().optional(),
  page: z.number().min(1).default(1),
  nr_records: z.number().min(1).default(12),
});

// Types derived from schemas
export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type Tiles3D = z.infer<typeof tiles3DSchema>;
export type Modelos3D = z.infer<typeof modelos3DSchema>;
export type PointCloud = z.infer<typeof pointCloudSchema>;
export type CatalogResponse = z.infer<typeof catalogResponseSchema>;
export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>;

// Tool state enum
export enum CatalogToolState {
  CLOSED = 'closed',
  OPEN = 'open',
  LOADING = 'loading',
  ERROR = 'error',
}

// Model loading state enum
export enum ModelLoadingState {
  NOTLOADED = 'not_loaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}
