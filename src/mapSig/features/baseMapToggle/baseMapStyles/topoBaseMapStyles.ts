import { z } from 'zod';

const topoSourceSchema = z.object({
  type: z.literal('vector'),
  tiles: z.array(z.string()),
  minzoom: z.number().optional(),
  maxzoom: z.number().optional(),
  attribution: z.string().optional(),
});

const layerPaintSchema = z.object({
  'fill-color': z.string().optional(),
  'fill-opacity': z.number().optional(),
  'line-color': z.string().optional(),
  'line-width': z.number().optional(),
  'line-opacity': z.number().optional(),
  'text-color': z.string().optional(),
  'text-halo-color': z.string().optional(),
  'text-halo-width': z.number().optional(),
}).optional();

const layerLayoutSchema = z.object({
  visibility: z.enum(['visible', 'none']).optional(),
  'text-field': z.string().optional(),
  'text-font': z.array(z.string()).optional(),
  'text-size': z.number().optional(),
  'text-anchor': z.enum(['center', 'left', 'right', 'top', 'bottom']).optional(),
}).optional();

export const topoStyleSchema = z.object({
  version: z.literal(8),
  name: z.string(),
  sources: z.record(topoSourceSchema),
  layers: z.array(z.object({
    id: z.string(),
    type: z.enum(['fill', 'line', 'symbol']),
    source: z.string(),
    'source-layer': z.string().optional(),
    minzoom: z.number().optional(),
    maxzoom: z.number().optional(),
    paint: layerPaintSchema,
    layout: layerLayoutSchema,
  })),
});

export const topoBaseMapStyle = {
  version: 8,
  name: 'EBGEO - Topográfico',
  sources: {
    topo: {
      type: 'vector',
      tiles: ['https://example.com/topo/{z}/{x}/{y}.pbf'],
      minzoom: 0,
      maxzoom: 22,
      attribution: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'fill',
      source: 'topo',
      'source-layer': 'background',
      paint: {
        'fill-color': '#f8f8f8',
        'fill-opacity': 1,
      },
    },
    {
      id: 'roads',
      type: 'line',
      source: 'topo',
      'source-layer': 'transportation',
      paint: {
        'line-color': '#888888',
        'line-width': 1,
      },
    },
    {
      id: 'places',
      type: 'symbol',
      source: 'topo',
      'source-layer': 'places',
      layout: {
        'text-field': '{name}',
        'text-font': ['Roboto Regular'],
        'text-size': 12,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#666666',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
      },
    },
  ],
} as const;

// Valida o estilo em tempo de execução
export const validatedTopoStyle = topoStyleSchema.parse(topoBaseMapStyle);

// Type inferido do schema
export type TopoMapStyle = z.infer<typeof topoStyleSchema>;