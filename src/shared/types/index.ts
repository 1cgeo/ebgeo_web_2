import { z } from 'zod';

// Schemas compartilhados
export const coordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  height: z.number().optional()
});

export const featurePanelSchema = z.object({
  title: z.string(),
  onUpdate: z.function(),
  onDelete: z.function(),
  onClose: z.function(),
  children: z.any(),
  sx: z.record(z.any()).optional()
});

// Types inferidos
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type FeaturePanelProps = z.infer<typeof featurePanelSchema>;