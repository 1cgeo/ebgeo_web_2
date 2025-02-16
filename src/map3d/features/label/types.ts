// Path: map3d\features\label\types.ts
import { z } from 'zod';

// Schema para posição do rótulo
export const labelPositionSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .strict();

// Schema para propriedades do rótulo
export const labelPropertiesSchema = z
  .object({
    text: z.string().min(1),
    size: z.number().min(8).max(72),
    fillColor: z.string().regex(/^#([0-9A-F]{6})$/i),
    backgroundColor: z.string().regex(/^#([0-9A-F]{8})$/i),
    align: z.enum(['left', 'center', 'right']),
  })
  .strict();

// Schema para o rótulo completo
export const labelSchema = z
  .object({
    id: z.string(),
    position: labelPositionSchema,
    properties: labelPropertiesSchema,
  })
  .strict();

// Types inferidos
export type LabelPosition = z.infer<typeof labelPositionSchema>;
export type LabelProperties = z.infer<typeof labelPropertiesSchema>;
export type Label = z.infer<typeof labelSchema>;

// Valores padrão
export const defaultLabelProperties: LabelProperties = {
  text: 'Novo texto',
  size: 38,
  fillColor: '#FFFFFF',
  backgroundColor: '#000000A3',
  align: 'center',
};
