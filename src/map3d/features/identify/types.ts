// Path: map3d\features\identify\types.ts
import { z } from 'zod';

// Schema para feature info
export const featureInfoSchema = z
  .object({
    nome: z.string().optional(),
    municipio: z.string().optional(),
    estado: z.string().optional(),
    tipo: z.string().optional(),
    altitude_base: z.number().optional(),
    altitude_topo: z.number().optional(),
    message: z.string().optional(),
  })
  .strict();

// Schema para coordenadas
export const coordinatesSchema = z
  .object({
    lat: z.number(),
    lon: z.number(),
    height: z.number(),
  })
  .strict();

// Schema para resposta da API
export const apiResponseSchema = z
  .object({
    success: z.boolean(),
    data: featureInfoSchema,
  })
  .strict();

// Types inferidos
export type FeatureInfo = z.infer<typeof featureInfoSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
