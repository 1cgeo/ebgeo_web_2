// Path: map3d\features\viewshed\types.ts
import { z } from 'zod';

// Schema para ponto no espaço
export const cartesianSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .strict();

// Schema para configurações do viewshed
export const viewshedOptionsSchema = z
  .object({
    id: z.string(),
    point: cartesianSchema.optional(),
    horizontalAngle: z.number().min(0).max(360).default(150),
    verticalAngle: z.number().min(0).max(180).default(120),
    distance: z.number().min(0).default(10), // em metros
    isComplete: z.boolean().default(false),
  })
  .strict();

// Schema para configurações de estilo
export const viewshedStyleSchema = z
  .object({
    color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
    opacity: z.number().min(0).max(1),
    outlineColor: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
    outlineOpacity: z.number().min(0).max(1),
    outlineWidth: z.number().min(1),
  })
  .strict();

// Types inferidos
export type Cartesian = z.infer<typeof cartesianSchema>;
export type ViewshedOptions = z.infer<typeof viewshedOptionsSchema>;
export type ViewshedStyle = z.infer<typeof viewshedStyleSchema>;

// Configurações padrão
export const defaultViewshedStyle: ViewshedStyle = {
  color: '#FF0000',
  opacity: 0.3,
  outlineColor: '#FF0000',
  outlineOpacity: 0.8,
  outlineWidth: 2,
};

export const defaultViewshedOptions: Omit<ViewshedOptions, 'id' | 'point'> = {
  horizontalAngle: 150,
  verticalAngle: 120,
  distance: 10,
  isComplete: false,
};
