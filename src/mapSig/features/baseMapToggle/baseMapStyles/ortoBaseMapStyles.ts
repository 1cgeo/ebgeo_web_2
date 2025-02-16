// Path: mapSig\features\baseMapToggle\baseMapStyles\ortoBaseMapStyles.ts
import { z } from 'zod';

const ortoSourceSchema = z.object({
  type: z.literal('raster'),
  tiles: z.array(z.string()),
  tileSize: z.number(),
  attribution: z.string().optional(),
});

export const ortoStyleSchema = z.object({
  version: z.literal(8),
  name: z.string(),
  sources: z.record(ortoSourceSchema),
  layers: z.array(
    z.object({
      id: z.string(),
      type: z.literal('raster'),
      source: z.string(),
      minzoom: z.number().optional(),
      maxzoom: z.number().optional(),
      paint: z
        .object({
          'raster-opacity': z.number().optional(),
          'raster-brightness-min': z.number().optional(),
          'raster-brightness-max': z.number().optional(),
          'raster-contrast': z.number().optional(),
          'raster-saturation': z.number().optional(),
        })
        .optional(),
    }),
  ),
});

export const ortoBaseMapStyle = {
  version: 8,
  name: 'EBGEO - Ortoimagem',
  sources: {
    orto: {
      type: 'raster',
      tiles: ['https://example.com/orto/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
    },
  },
  layers: [
    {
      id: 'orto-layer',
      type: 'raster',
      source: 'orto',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-contrast': 0,
        'raster-saturation': 0,
      },
    },
  ],
} as const;

// Valida o estilo em tempo de execução
export const validatedOrtoStyle = ortoStyleSchema.parse(ortoBaseMapStyle);

// Type inferido do schema
export type OrtoMapStyle = z.infer<typeof ortoStyleSchema>;
