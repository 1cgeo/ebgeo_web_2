// Path: map3d\features\area\types.ts
import { z } from 'zod';

// Schema para ponto no espaço
export const cartesianSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// Schema para medição de área
export const areaSchema = z.object({
  id: z.string(),
  points: z.array(cartesianSchema),
  area: z.number().optional(),
  isComplete: z.boolean(),
});

// Schema para configurações de estilo
export const areaStyleSchema = z.object({
  color: z.string().default('#0000FF'),
  opacity: z.number().min(0).max(1).default(0.8),
  fillColor: z.string().default('#FFFFFF'),
  fillOpacity: z.number().min(0).max(1).default(0.3),
  width: z.number().min(1).default(2),
});

// Types inferidos
export type Cartesian = z.infer<typeof cartesianSchema>;
export type Area = z.infer<typeof areaSchema>;
export type AreaStyle = z.infer<typeof areaStyleSchema>;

// Configurações padrão
export const defaultAreaStyle: AreaStyle = {
  color: '#0000FF',
  opacity: 0.8,
  fillColor: '#FFFFFF',
  fillOpacity: 0.3,
  width: 2,
};
