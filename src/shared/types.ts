// Path: shared\types.ts
import { z } from 'zod';

// Schema para fonte orto
const _ortoSourceSchema = z.object({
  type: z.literal('raster'),
  tiles: z.array(z.string()),
  tileSize: z.number(),
  attribution: z.string().optional(),
});

// Schema para estilo orto
const _ortoStyleSchema = z.object({
  version: z.literal(8),
  name: z.string(),
  sources: z.record(_ortoSourceSchema),
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

// Schema para fonte topo
const _topoSourceSchema = z.object({
  type: z.literal('vector'),
  tiles: z.array(z.string()),
  minzoom: z.number().optional(),
  maxzoom: z.number().optional(),
  attribution: z.string().optional(),
});

// Schema para estilo topo
const _topoStyleSchema = z.object({
  version: z.literal(8),
  name: z.string(),
  sources: z.record(_topoSourceSchema),
  layers: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['fill', 'line', 'symbol']),
      source: z.string(),
      'source-layer': z.string().optional(),
      minzoom: z.number().optional(),
      maxzoom: z.number().optional(),
      paint: z
        .object({
          'fill-color': z.string().optional(),
          'fill-opacity': z.number().optional(),
          'line-color': z.string().optional(),
          'line-width': z.number().optional(),
          'line-opacity': z.number().optional(),
          'text-color': z.string().optional(),
          'text-halo-color': z.string().optional(),
          'text-halo-width': z.number().optional(),
        })
        .optional(),
      layout: z
        .object({
          visibility: z.enum(['visible', 'none']).optional(),
          'text-field': z.string().optional(),
          'text-font': z.array(z.string()).optional(),
          'text-size': z.number().optional(),
          'text-anchor': z
            .enum(['center', 'left', 'right', 'top', 'bottom'])
            .optional(),
        })
        .optional(),
    }),
  ),
});

// Types inferidos
export type OrtoStyle = z.infer<typeof _ortoStyleSchema>;
export type TopoStyle = z.infer<typeof _topoStyleSchema>;

// Tipos de mapa base
const _baseMapTypeSchema = z.enum(['orto', 'topo']);
export type BaseMapType = z.infer<typeof _baseMapTypeSchema>;

// Interface completa de estilos
export interface BaseMapStyles {
  orto: OrtoStyle;
  topo: TopoStyle;
}
