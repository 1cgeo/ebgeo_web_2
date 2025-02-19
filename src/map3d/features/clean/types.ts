// Path: map3d\features\clean\types.ts
import { z } from 'zod';

// Schema para configurações de limpeza
export const cleanConfigSchema = z.object({
  clearMeasurements: z.boolean().default(true),
  clearLabels: z.boolean().default(true),
  clearViewshed: z.boolean().default(true),
  showConfirmation: z.boolean().default(false),
});

// Types inferidos
export type CleanConfig = z.infer<typeof cleanConfigSchema>;
