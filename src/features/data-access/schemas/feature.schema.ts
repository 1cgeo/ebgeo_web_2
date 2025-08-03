// Path: features\data-access\schemas\feature.schema.ts

import { z } from 'zod';

// Schema para estilo de feature
export const FeatureStyleSchema = z.object({
  fillColor: z.string().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
  strokeColor: z.string().optional(),
  strokeOpacity: z.number().min(0).max(1).optional(),
  strokeWidth: z.number().min(0).optional(),
  markerColor: z.string().optional(),
  markerSize: z.number().min(0).optional(),
  textColor: z.string().optional(),
  textSize: z.number().min(0).optional(),
  textFont: z.string().optional(),
  textOffset: z.tuple([z.number(), z.number()]).optional(),
  sidc: z.string().optional(),
});

// Schema para propriedades da feature
export const ExtendedFeaturePropertiesSchema = z.object({
  id: z.string().uuid(),
  layerId: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  style: FeatureStyleSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  ownerId: z.string().optional(),
}).catchall(z.any()); // Permite propriedades customizadas

// Schema para coordenadas (posição)
export const PositionSchema = z.tuple([z.number(), z.number()]).or(
  z.tuple([z.number(), z.number(), z.number()])
);

// Schema para geometrias
export const PointGeometrySchema = z.object({
  type: z.literal('Point'),
  coordinates: PositionSchema,
});

export const LineStringGeometrySchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(PositionSchema).min(2),
});

export const PolygonGeometrySchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(PositionSchema).min(4)),
});

export const GeometrySchema = z.union([
  PointGeometrySchema,
  LineStringGeometrySchema,
  PolygonGeometrySchema,
]);

// Schema para feature estendida
export const ExtendedFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string().uuid(),
  geometry: GeometrySchema,
  properties: ExtendedFeaturePropertiesSchema,
});

// Schema para coleção de features
export const FeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(ExtendedFeatureSchema),
});

// Tipos inferidos dos schemas
export type FeatureStyle = z.infer<typeof FeatureStyleSchema>;
export type ExtendedFeatureProperties = z.infer<typeof ExtendedFeaturePropertiesSchema>;
export type ExtendedFeature = z.infer<typeof ExtendedFeatureSchema>;
export type FeatureCollection = z.infer<typeof FeatureCollectionSchema>;

// Funções de validação
export const validateFeature = (feature: unknown): ExtendedFeature => {
  return ExtendedFeatureSchema.parse(feature);
};

export const validateFeatureCollection = (collection: unknown): FeatureCollection => {
  return FeatureCollectionSchema.parse(collection);
};

// Função para criar feature padrão
export const createDefaultFeature = (
  geometry: z.infer<typeof GeometrySchema>,
  layerId: string,
  properties: Partial<ExtendedFeatureProperties> = {}
): ExtendedFeature => {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  return {
    type: 'Feature',
    id,
    geometry,
    properties: {
      id,
      layerId,
      createdAt: now,
      updatedAt: now,
      ...properties,
    },
  };
};