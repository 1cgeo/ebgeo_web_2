// Path: map3d\types.tsx
import { z } from 'zod';

export const handlers3DSchema = z.object({
  cesiumMeasure: z.any(),
  cesiumViewshed: z.any(),
  cesiumLabel: z.any(),
});

export const camera3DSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  height: z.number(),
  heading: z.number(),
  pitch: z.number(),
  roll: z.number(),
});

export const map3DOptionsSchema = z.object({
  baseMap: z.boolean().default(true),
  terrain: z.boolean().default(true),
  lighting: z.boolean().default(true),
  atmosphere: z.boolean().default(true),
});

// Types inferidos
export type Handlers3D = z.infer<typeof handlers3DSchema>;
export type Camera3D = z.infer<typeof camera3DSchema>;
export type Map3DOptions = z.infer<typeof map3DOptionsSchema>;
