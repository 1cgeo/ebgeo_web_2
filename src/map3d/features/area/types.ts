// Path: map3d\features\area\types.ts
import { z } from 'zod';

// Schema para uma medição de área
export const areaMeasurementSchema = z.object({
  id: z.string(),
  positions: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }),
  ),
  area: z.number().nonnegative(),
  timestamp: z.number(),
});

// Schema para as configurações de estilo da medição
export const areaStyleSchema = z.object({
  fillColor: z.string().default('rgba(0, 70, 255, 0.2)'),
  outlineColor: z.string().default('rgba(0, 70, 255, 0.8)'),
  outlineWidth: z.number().min(1).max(10).default(3),
  labelBackgroundColor: z.string().default('rgba(255, 255, 255, 0.8)'),
  labelTextColor: z.string().default('#000000'),
  labelFont: z.string().default('14px monospace'),
});

// Type inferidos
export type AreaMeasurement = z.infer<typeof areaMeasurementSchema>;
export type AreaStyle = z.infer<typeof areaStyleSchema>;

// Estado da ferramenta
export enum AreaToolState {
  INACTIVE = 'inactive',
  MEASURING = 'measuring',
  COMPLETED = 'completed',
}
