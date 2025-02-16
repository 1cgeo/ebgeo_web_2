// Path: mapSig\types.ts
import { z } from 'zod';

// Schema para coordenadas
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Schema para bounds do mapa
export const boundsSchema = z
  .object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180),
  })
  .refine(data => data.north > data.south, {
    message: 'north deve ser maior que south',
  })
  .refine(data => data.east > data.west, {
    message: 'east deve ser maior que west',
  });

// Schema para estado básico do mapa
export const mapStateSchema = z.object({
  zoom: z.number().min(0).max(22),
  center: coordinatesSchema,
  bounds: boundsSchema,
});

// Types inferidos
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Bounds = z.infer<typeof boundsSchema>;
export type MapState = z.infer<typeof mapStateSchema>;

// Types para callbacks comuns
export type CoordinatesChangeHandler = (coords: Coordinates) => void;
export type BoundsChangeHandler = (bounds: Bounds) => void;
export type ZoomChangeHandler = (zoom: number) => void;

// Helpers de validação
export function validateCoordinates(coords: unknown): Coordinates {
  return coordinatesSchema.parse(coords);
}

export function validateBounds(bounds: unknown): Bounds {
  return boundsSchema.parse(bounds);
}

export function validateMapState(state: unknown): MapState {
  return mapStateSchema.parse(state);
}
