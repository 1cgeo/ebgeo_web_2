// Path: map3d\config.ts
import { z } from 'zod';

import { env } from '@/shared/config/env';

import { map3DOptionsSchema, viewRectangleSchema } from './types';

// Schema para opções do Cesium Viewer
export const cesiumViewerOptionsSchema = z
  .object({
    infoBox: z.boolean(),
    shouldAnimate: z.boolean(),
    vrButton: z.boolean(),
    geocoder: z.boolean(),
    homeButton: z.boolean(),
    sceneModePicker: z.boolean(),
    baseLayerPicker: z.boolean(),
    navigationHelpButton: z.boolean(),
    animation: z.boolean(),
    timeline: z.boolean(),
    fullscreenButton: z.boolean(),
    shadows: z.boolean().default(false),
    terrainShadows: z.number().default(0),
    contextOptions: z
      .object({
        webgl: z
          .object({
            alpha: z.boolean(),
            depth: z.boolean(),
            stencil: z.boolean(),
            antialias: z.boolean(),
            premultipliedAlpha: z.boolean(),
            preserveDrawingBuffer: z.boolean(),
          })
          .partial(),
      })
      .optional(),
  })
  .strict();

// Schema para configurações de imagem
export const imageryConfigSchema = z
  .object({
    url: z.string().url(),
    credit: z.string(),
    minimumLevel: z.number().min(0).optional(),
    maximumLevel: z.number().min(0).optional(),
    tileWidth: z.number().min(1).default(256),
    tileHeight: z.number().min(1).default(256),
    enableLighting: z.boolean().default(false),
  })
  .strict();

// Schema para configurações de terreno
export const terrainConfigSchema = z
  .object({
    url: z.string(),
    requestVertexNormals: z.boolean().default(true),
    requestWaterMask: z.boolean().default(false),
    requestMetadata: z.boolean().default(true),
  })
  .strict();

// Schema para configuração completa
export const configSchema = z
  .object({
    viewer: z.object({
      defaultView: viewRectangleSchema,
      defaultOptions: map3DOptionsSchema,
      cesiumOptions: cesiumViewerOptionsSchema,
    }),
    imagery: imageryConfigSchema,
    terrain: terrainConfigSchema,
    performance: z
      .object({
        maximumScreenSpaceError: z.number().min(1).max(128).default(4),
        maximumMemoryUsage: z.number().min(100).max(10000).default(512),
        loadingDescendantLimit: z.number().min(1).max(1000).default(20),
        preloadAncestors: z.boolean().default(true),
        preloadSiblings: z.boolean().default(true),
        dynamicScreenSpaceError: z.boolean().default(true),
        dynamicScreenSpaceErrorDensity: z.number().default(0.00278),
        dynamicScreenSpaceErrorFactor: z.number().default(4.0),
        dynamicScreenSpaceErrorHeightFalloff: z.number().default(0.25),
      })
      .strict(),
  })
  .strict();

// Configuração padrão
const defaultConfig = {
  viewer: {
    defaultView: {
      west: -44.449656,
      south: -22.455922,
      east: -44.449654,
      north: -22.45592,
    },
    defaultOptions: {
      baseMap: true,
      terrain: true,
      lighting: true,
      atmosphere: true,
    },
    cesiumOptions: {
      infoBox: false,
      shouldAnimate: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: true,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      shadows: false,
      terrainShadows: 0,
      contextOptions: {
        webgl: {
          alpha: true,
          antialias: true,
        },
      },
    },
  },
  imagery: {
    url: env.VITE_IMAGERY_PROVIDER_URL,
    credit: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
    minimumLevel: 0,
    maximumLevel: 20,
    enableLighting: true,
  },
  terrain: {
    url: env.VITE_TERRAIN_PROVIDER_URL,
    requestVertexNormals: true,
    requestWaterMask: false,
    requestMetadata: true,
  },
  performance: {
    maximumScreenSpaceError: 4,
    maximumMemoryUsage: 512,
    loadingDescendantLimit: 20,
    preloadAncestors: true,
    preloadSiblings: true,
    dynamicScreenSpaceError: true,
    dynamicScreenSpaceErrorDensity: 0.00278,
    dynamicScreenSpaceErrorFactor: 4.0,
    dynamicScreenSpaceErrorHeightFalloff: 0.25,
  },
} as const;

// Valida e exporta a configuração
export const config = configSchema.parse(defaultConfig);

// Types inferidos
export type CesiumViewerOptions = z.infer<typeof cesiumViewerOptionsSchema>;
export type ImageryConfig = z.infer<typeof imageryConfigSchema>;
export type TerrainConfig = z.infer<typeof terrainConfigSchema>;
export type Map3DConfig = z.infer<typeof configSchema>;

// Helper para mesclar configurações customizadas
export function mergeConfig(customConfig: Partial<Map3DConfig>): Map3DConfig {
  return configSchema.parse({
    ...defaultConfig,
    ...customConfig,
  });
}
