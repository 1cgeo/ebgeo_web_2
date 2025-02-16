// Path: mapSig\features\vectorInfo\types.ts
import { z } from 'zod';

// Schema para geometria
export const geometryTypeSchema = z.enum([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
]);

// Schema para feature vetorial
export const vectorFeatureSchema = z.object({
  id: z.string(),
  source: z.string().optional(),
  geometry: z.object({
    type: geometryTypeSchema,
    coordinates: z.array(z.number()).or(z.array(z.array(z.number()))),
  }),
  properties: z.record(z.unknown()),
});

// Types inferidos
export type GeometryType = z.infer<typeof geometryTypeSchema>;
export type VectorFeature = z.infer<typeof vectorFeatureSchema>;

// Constantes
export const GEOMETRY_PREFERENCE_ORDER: GeometryType[] = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
];

export const PROPERTY_BLACKLIST = [
  'id',
  'vector_type',
  'tilequery',
  'mapbox_clip_start',
  'mapbox_clip_end',
  'justificativa_txt_value',
  'visivel_value',
  'exibir_linha_rotulo_value',
  'suprimir_bandeira_value',
  'posicao_rotulo_value',
  'direcao_fixada_value',
  'exibir_ponta_simbologia_value',
  'exibir_lado_simbologia_value',
];

export const BLACKLIST_SUFFIXES = ['_code'];
