// Path: map3d\schemas.ts
import { z } from 'zod';

// Schemas básicos reutilizáveis
export const cartesianSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const coordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  height: z.number().optional(),
});

export const styleSchema = z.object({
  color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
  opacity: z.number().min(0).max(1),
  width: z.number().min(1),
});

// Schemas para modelos 3D
export const model3DBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['Tiles 3D', 'Modelos 3D', 'Nuvem de Pontos']),
  url: z.string(),
  thumbnail: z.string(),
  data_criacao: z.string(),
  municipio: z.string(),
  estado: z.string(),
  palavras_chave: z.array(z.string()),
  coordinates: coordinatesSchema,
  visible: z.boolean().default(true),
});

export const tiles3DSchema = model3DBaseSchema.extend({
  type: z.literal('Tiles 3D'),
  heightoffset: z.number(),
  maximumscreenspaceerror: z.number(),
});

export const modelos3DSchema = model3DBaseSchema.extend({
  type: z.literal('Modelos 3D'),
  heading: z.number(),
  pitch: z.number(),
  roll: z.number(),
});

export const nuvemPontosSchema = model3DBaseSchema.extend({
  type: z.literal('Nuvem de Pontos'),
  style: z.record(z.any()),
});

export const model3DSchema = z.discriminatedUnion('type', [
  tiles3DSchema,
  modelos3DSchema,
  nuvemPontosSchema,
]);

// Schemas para ferramentas
export const toolSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  options: z.record(z.any()).optional(),
});

// Schemas para estado
export const stateSchema = z.object({
  activeTool: z.string().nullable(),
  models: z.array(model3DSchema),
  tools: z.record(toolSchema),
});

// Types inferidos
export type Cartesian = z.infer<typeof cartesianSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Style = z.infer<typeof styleSchema>;
export type Model3D = z.infer<typeof model3DSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type State = z.infer<typeof stateSchema>;
