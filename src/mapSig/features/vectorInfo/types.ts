// Path: mapSig\features\vectorInfo\types.ts
import { z } from 'zod';

// Schema para camada vetorial
export const vectorLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceLayer: z.string(),
  type: z.enum(['fill', 'line', 'symbol', 'circle']),
  minzoom: z.number().optional(),
  maxzoom: z.number().optional(),
  visible: z.boolean(),
});

// Schema para feature vetorial
export const vectorFeatureSchema = z.object({
  id: z.string(),
  layerId: z.string(),
  properties: z.record(z.unknown()),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.number()).or(z.array(z.array(z.number()))),
  }),
});

// Types inferidos
export type VectorLayer = z.infer<typeof vectorLayerSchema>;
export type VectorFeature = z.infer<typeof vectorFeatureSchema>;

// Labels para tipos de camadas
export const layerTypeLabels: Record<VectorLayer['type'], string> = {
  fill: 'Polígono',
  line: 'Linha',
  symbol: 'Símbolo',
  circle: 'Ponto',
};
