// Path: map3d\features\catalog\types.ts
import { z } from 'zod';

export const modelTypeSchema = z.enum([
  'Tiles 3D',
  'Modelos 3D',
  'Nuvem de Pontos',
]);

export const catalogItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: modelTypeSchema,
  thumbnail: z.string(),
  url: z.string(),
  data_criacao: z.string(),
  municipio: z.string(),
  estado: z.string(),
  palavras_chave: z.array(z.string()),
  lon: z.number(),
  lat: z.number(),
  height: z.number(),
  heightoffset: z.number().optional(),
  heading: z.number().optional(),
  pitch: z.number().optional(),
  roll: z.number().optional(),
  maximumscreenspaceerror: z.number().optional(),
  style: z.record(z.any()).optional(),
});

export const catalogResponseSchema = z.object({
  data: z.array(catalogItemSchema),
  total: z.number(),
});

// Types inferidos
export type ModelType = z.infer<typeof modelTypeSchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type CatalogResponse = z.infer<typeof catalogResponseSchema>;
