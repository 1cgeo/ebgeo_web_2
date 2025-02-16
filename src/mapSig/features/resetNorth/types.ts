// Path: mapSig\features\resetNorth\types.ts
import { z } from 'zod';

export const cameraOptionsSchema = z.object({
  duration: z.number().min(0),
  easing: z.function().optional(),
  offset: z.array(z.number()).length(2).optional(),
});

export const resetOptionsSchema = z.object({
  bearing: z.number(),
  pitch: z.number(),
  camera: cameraOptionsSchema,
});

// Types inferidos
export type CameraOptions = z.infer<typeof cameraOptionsSchema>;
export type ResetOptions = z.infer<typeof resetOptionsSchema>;

// Configurações padrão
export const defaultResetOptions: ResetOptions = {
  bearing: 0,
  pitch: 0,
  camera: {
    duration: 1000,
  },
};
