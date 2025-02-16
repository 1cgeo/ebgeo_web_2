// Path: map3d\types.tsx
import { z } from 'zod';

// Schema para handlers do Cesium
export const handlers3DSchema = z
  .object({
    cesiumMeasure: z.any(),
    cesiumViewshed: z.any(),
    cesiumLabel: z.any(),
  })
  .strict();

// Schema para posição da câmera
export const camera3DSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    height: z.number().min(0),
    heading: z.number().min(-180).max(180),
    pitch: z.number().min(-90).max(90),
    roll: z.number().min(-180).max(180),
  })
  .strict();

// Schema para configurações do mapa
export const map3DOptionsSchema = z
  .object({
    baseMap: z.boolean().default(true),
    terrain: z.boolean().default(true),
    lighting: z.boolean().default(true),
    atmosphere: z.boolean().default(true),
  })
  .strict();

// Schema para coordenadas cartesianas (usado por múltiplas features)
export const cartesian3Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .strict();

// Schema para retângulo de visualização
export const viewRectangleSchema = z
  .object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90),
  })
  .refine(rect => rect.west < rect.east && rect.south < rect.north, {
    message:
      'Coordenadas inválidas: west deve ser menor que east e south deve ser menor que north',
  })
  .strict();

// Types inferidos
export type Handlers3D = z.infer<typeof handlers3DSchema>;
export type Camera3D = z.infer<typeof camera3DSchema>;
export type Map3DOptions = z.infer<typeof map3DOptionsSchema>;
export type Cartesian3 = z.infer<typeof cartesian3Schema>;
export type ViewRectangle = z.infer<typeof viewRectangleSchema>;

// Funções de validação
export function validateCamera(camera: unknown): Camera3D {
  return camera3DSchema.parse(camera);
}

export function validateOptions(options: unknown): Map3DOptions {
  return map3DOptionsSchema.parse(options);
}

export function validateCartesian(point: unknown): Cartesian3 {
  return cartesian3Schema.parse(point);
}

export function validateViewRectangle(rect: unknown): ViewRectangle {
  return viewRectangleSchema.parse(rect);
}

// Constantes
export const DEFAULT_VIEW_RECTANGLE: ViewRectangle = {
  west: -44.449656,
  south: -22.455922,
  east: -44.449654,
  north: -22.45592,
};

export const DEFAULT_CAMERA: Camera3D = {
  latitude: -22.4546061,
  longitude: -44.4481491,
  height: 424.7,
  heading: 164,
  pitch: -2,
  roll: -1,
};

export const DEFAULT_OPTIONS: Map3DOptions = {
  baseMap: true,
  terrain: true,
  lighting: true,
  atmosphere: true,
};
