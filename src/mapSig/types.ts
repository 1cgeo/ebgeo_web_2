import { z } from 'zod';

// Base schemas
export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const boundingBoxSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

// Map schemas
export const mapStyleSchema = z.object({
  version: z.number(),
  name: z.string(),
  sources: z.record(z.any()),
  layers: z.array(z.any()),
});

export const mapStateSchema = z.object({
  zoom: z.number(),
  center: coordinatesSchema,
  bounds: boundingBoxSchema,
  style: mapStyleSchema,
});

// Feature schemas
export const featureStyleSchema = z.object({
  color: z.string(),
  weight: z.number(),
  opacity: z.number(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().optional(),
});

// Types inferidos
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type BoundingBox = z.infer<typeof boundingBoxSchema>;
export type MapStyle = z.infer<typeof mapStyleSchema>;
export type MapState = z.infer<typeof mapStateSchema>;
export type FeatureStyle = z.infer<typeof featureStyleSchema>;