// Path: map3d\features\distance\types.ts
import { z } from 'zod';

// Schema para um ponto da medição de distância
export const distancePointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  distance: z.number().nonnegative(), // Distância acumulada até este ponto
});

// Schema para uma medição de distância
export const distanceMeasurementSchema = z.object({
  id: z.string(),
  points: z.array(distancePointSchema),
  totalDistance: z.number().nonnegative(),
  timestamp: z.number(),
});

// Schema para as configurações de estilo da medição
export const distanceStyleSchema = z.object({
  lineColor: z.string().default('rgba(0, 70, 255, 0.8)'),
  lineWidth: z.number().min(1).max(10).default(3),
  pointSize: z.number().min(1).max(20).default(10),
  pointColor: z.string().default('rgba(0, 70, 255, 1.0)'),
  labelBackgroundColor: z.string().default('rgba(255, 255, 255, 0.8)'),
  labelTextColor: z.string().default('#000000'),
  labelFont: z.string().default('14px monospace'),
});

// Type inferidos
export type DistancePoint = z.infer<typeof distancePointSchema>;
export type DistanceMeasurement = z.infer<typeof distanceMeasurementSchema>;
export type DistanceStyle = z.infer<typeof distanceStyleSchema>;

// Estado da ferramenta
export enum DistanceToolState {
  INACTIVE = 'inactive',
  MEASURING = 'measuring',
  COMPLETED = 'completed',
}
