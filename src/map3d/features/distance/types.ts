// Path: map3d\features\distance\types.ts
import { z } from 'zod';

// Schema para ponto no espaço
export const cartesianSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// Schema para linha de medição
export const distanceLineSchema = z.object({
  id: z.string(),
  points: z.array(cartesianSchema),
  distance: z.number().optional(),
  isComplete: z.boolean(),
});

// Schema para configurações de estilo
export const distanceStyleSchema = z.object({
  color: z.string().default('#0000FF'),
  opacity: z.number().min(0).max(1).default(0.8),
  width: z.number().min(1).default(2),
  pointSize: z.number().min(1).default(8),
  pointColor: z.string().default('#FFFFFF'),
  pointBorderColor: z.string().default('#0000FF'),
});

// Types inferidos
export type Cartesian = z.infer<typeof cartesianSchema>;
export type DistanceLine = z.infer<typeof distanceLineSchema>;
export type DistanceStyle = z.infer<typeof distanceStyleSchema>;

// Configurações padrão
export const defaultDistanceStyle: DistanceStyle = {
  color: '#0000FF',
  opacity: 0.8,
  width: 2,
  pointSize: 8,
  pointColor: '#FFFFFF',
  pointBorderColor: '#0000FF',
};
