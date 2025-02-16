// Path: mapSig\features\resetNorth\types.ts
import { z } from 'zod';

export const resetOptionsSchema = z.object({
  bearing: z.number(),
  pitch: z.number(),
});

export type ResetOptions = z.infer<typeof resetOptionsSchema>;

export const defaultResetOptions: ResetOptions = {
  bearing: 0,
  pitch: 0,
};
