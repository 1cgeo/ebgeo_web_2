// Path: mapSig\features\textTool\types.ts
import { z } from 'zod';

export const textAttributesSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  size: z.number().min(1).max(100),
  color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
  backgroundColor: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
  justify: z.enum(['left', 'center', 'right']),
  rotation: z.number().min(-180).max(180),
  coordinates: z.object({
    lng: z.number(),
    lat: z.number(),
  }),
});

export type TextAttributes = z.infer<typeof textAttributesSchema>;

export const defaultTextAttributes: Omit<TextAttributes, 'id' | 'coordinates'> =
  {
    text: 'Novo texto',
    size: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    justify: 'center',
    rotation: 0,
  };

// Constantes para a camada do mapa
export const TEXT_SOURCE_ID = 'text-features-source';
export const TEXT_LAYER_ID = 'text-features-layer';
