// Path: map3d\features\label\types.ts
import { z } from 'zod';

// Schema para posição da etiqueta
export const labelPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  height: z.number(),
});

// Schema para propriedades da etiqueta
export const labelPropertiesSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  size: z.number().min(1).max(100).default(38),
  fillColor: z
    .string()
    .regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i)
    .default('#FFFFFF'),
  backgroundColor: z
    .string()
    .regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i)
    .default('#000000A3'),
  align: z.enum(['left', 'center', 'right']).default('center'),
  rotation: z.number().min(-180).max(180).default(0),
});

// Schema para etiqueta completa
export const labelSchema = z.object({
  properties: labelPropertiesSchema,
  position: labelPositionSchema,
  entityId: z.string(),
  createdAt: z.number(),
});

// Type inferidos
export type LabelPosition = z.infer<typeof labelPositionSchema>;
export type LabelProperties = z.infer<typeof labelPropertiesSchema>;
export type Label = z.infer<typeof labelSchema>;

// Estado da ferramenta
export enum LabelToolState {
  INACTIVE = 'inactive',
  ADDING = 'adding',
  EDITING = 'editing',
}

// Tipos de eventos
export type LabelCreatedHandler = (label: Label) => void;
export type LabelSelectedHandler = (label: Label) => void;
export type LabelUpdatedHandler = (label: Label) => void;
export type LabelRemovedHandler = (labelId: string) => void;
