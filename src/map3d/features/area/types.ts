// Path: map3d\features\area\types.ts
import { z } from 'zod';

// Schema para ponto no espaço 3D
export const cartesianSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .strict();

// Schema para área
export const areaSchema = z
  .object({
    id: z.string(),
    points: z.array(cartesianSchema),
    area: z.number().optional(),
    isComplete: z.boolean(),
  })
  .strict();

// Schema para configurações de estilo
export const areaStyleSchema = z
  .object({
    color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
    opacity: z.number().min(0).max(1),
    fillColor: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
    fillOpacity: z.number().min(0).max(1),
    width: z.number().min(1),
  })
  .strict();

// Types inferidos
export type Cartesian = z.infer<typeof cartesianSchema>;
export type Area = z.infer<typeof areaSchema>;
export type AreaStyle = z.infer<typeof areaStyleSchema>;

// Configurações padrão
export const defaultAreaStyle: AreaStyle = {
  color: '#0000FF',
  opacity: 0.8,
  fillColor: '#4444FF',
  fillOpacity: 0.3,
  width: 2,
};
