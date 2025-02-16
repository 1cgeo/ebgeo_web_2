// Path: mapSig\features\baseMapToggle\types.ts
import { z } from 'zod';

// Schema para um style individual do mapa
export const baseMapStyleSchema = z.object({
  version: z.number(),
  name: z.string(),
  sources: z.record(z.any()),
  layers: z.array(z.any()),
});

// Schema para conjunto de estilos
export const baseMapStylesSchema = z.record(baseMapStyleSchema);

// Enum de tipos de mapa base disponíveis
export const baseMapTypeSchema = z.enum(['orto', 'topo']);

// Types inferidos
export type BaseMapStyle = z.infer<typeof baseMapStyleSchema>;
export type BaseMapStyles = z.infer<typeof baseMapStylesSchema>;
export type BaseMapType = z.infer<typeof baseMapTypeSchema>;
