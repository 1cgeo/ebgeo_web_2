import { z } from 'zod';

export const cameraOptionsSchema = z.object({
  duration: z.number(),
  easing: z.function().optional(),
  offset: z.array(z.number()).length(2).optional(),
});

export const resetOptionsSchema = z.object({
  bearing: z.number(),
  pitch: z.number(),
  camera: cameraOptionsSchema,
});

export const defaultResetOptions = {
  bearing: 0,
  pitch: 0,
  camera: {
    duration: 1000,
  },
} as const;

// Validação em runtime
export const validatedResetOptions = resetOptionsSchema.parse(defaultResetOptions);

// Types inferidos
export type CameraOptions = z.infer<typeof cameraOptionsSchema>;
export type ResetOptions = z.infer<typeof resetOptionsSchema>;