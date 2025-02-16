// Path: mapSig\features\featureSearch\types.ts
import { z } from 'zod';

// Schema para coordenadas
const coordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Schema para feature individual
const searchFeatureSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.string(),
  municipio: z.string(),
  estado: z.string(),
  coordinates: coordinateSchema,
});

// Schema para resultado da busca
export const searchResultSchema = z.object({
  total: z.number(),
  page: z.number(),
  features: z.array(searchFeatureSchema),
});

// Schema para parâmetros de busca
export const searchParamsSchema = z.object({
  query: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(10),
});

// Types inferidos
export type Coordinate = z.infer<typeof coordinateSchema>;
export type SearchFeature = z.infer<typeof searchFeatureSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;

// Type para o marcador do mapa
export type MapMarker = any; // tipo específico do maplibre
