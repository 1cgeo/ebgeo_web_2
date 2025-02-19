// Path: map3d\types.ts
import { z } from 'zod';

// Schema para coordenadas 3D
export const coordinates3DSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  height: z.number().optional(),
});

// Schema para bounds do mapa 3D
export const bounds3DSchema = z
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

// Schema para orientação (heading, pitch, roll)
export const orientationSchema = z.object({
  heading: z.number(),
  pitch: z.number(),
  roll: z.number().default(0),
});

// Schema para estado básico do mapa 3D
export const map3DStateSchema = z.object({
  center: coordinates3DSchema,
  orientation: orientationSchema,
  bounds: bounds3DSchema.optional(),
});

// Schema para estilos de modelo 3D
export const modelStyleSchema = z.object({
  maximumScreenSpaceError: z.number().min(1).default(16),
  dynamicScreenSpaceError: z.boolean().default(true),
  dynamicScreenSpaceErrorDensity: z.number().default(0.00278),
  dynamicScreenSpaceErrorFactor: z.number().default(4.0),
  dynamicScreenSpaceErrorHeightFalloff: z.number().default(0.25),
  maximumMemoryUsage: z.number().default(512),
  preferLeaves: z.boolean().default(true),
});

// Types inferidos
export type Coordinates3D = z.infer<typeof coordinates3DSchema>;
export type Bounds3D = z.infer<typeof bounds3DSchema>;
export type Orientation = z.infer<typeof orientationSchema>;
export type Map3DState = z.infer<typeof map3DStateSchema>;
export type ModelStyle = z.infer<typeof modelStyleSchema>;

// Types para callbacks comuns
export type CoordinatesChangeHandler = (coords: Coordinates3D) => void;
export type OrientationChangeHandler = (orientation: Orientation) => void;

// Helpers de validação
export function validateCoordinates3D(coords: unknown): Coordinates3D {
  return coordinates3DSchema.parse(coords);
}

export function validateBounds3D(bounds: unknown): Bounds3D {
  return bounds3DSchema.parse(bounds);
}

export function validateMap3DState(state: unknown): Map3DState {
  return map3DStateSchema.parse(state);
}

// Types para Cesium
export interface CesiumInstance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cesium: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewer: any;
}
