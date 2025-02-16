// Path: mapSig\features\textTool\types.ts
import { z } from 'zod';

export const textAttributesSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  size: z.number().min(8).max(72),
  color: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
  backgroundColor: z.string().regex(/^#([0-9A-F]{6}|[0-9A-F]{8})$/i),
  align: z.enum(['left', 'center', 'right']),
  coordinates: z.object({
    lng: z.number(),
    lat: z.number(),
  }),
});

// Types inferidos
export type TextAttributes = z.infer<typeof textAttributesSchema>;

// Configurações padrão
export const defaultTextAttributes: Omit<TextAttributes, 'id' | 'coordinates'> =
  {
    text: 'Novo texto',
    size: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    align: 'center',
  };
