import { z } from 'zod';

export const coordinateSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export const searchFeatureSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.string(),
  municipio: z.string(),
  estado: z.string(),
  coordinates: coordinateSchema,
});

export const searchResultSchema = z.object({
  total: z.number(),
  page: z.number(),
  features: z.array(searchFeatureSchema),
});

// Types inferidos
export type SearchFeature = z.infer<typeof searchFeatureSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type Coordinate = z.infer<typeof coordinateSchema>;