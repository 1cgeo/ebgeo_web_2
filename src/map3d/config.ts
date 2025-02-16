// Path: map3d\config.ts
import { z } from 'zod';

import { env } from '@/shared/config/env';

import { type Map3DOptions, map3DOptionsSchema } from './types';

const configSchema = z.object({
  viewer: z.object({
    defaultView: z.object({
      west: z.number(),
      south: z.number(),
      east: z.number(),
      north: z.number(),
    }),
    defaultOptions: map3DOptionsSchema,
    cesiumOptions: z.object({
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
    }),
  }),
  imagery: z.object({
    url: z.string().url(),
    credit: z.string(),
  }),
  terrain: z.object({
    url: z.string(),
  }),
});

export const defaultOptions: Map3DOptions = {
  baseMap: true,
  terrain: true,
  lighting: true,
  atmosphere: true,
};

export const config = configSchema.parse({
  viewer: {
    defaultView: {
      west: -44.449656,
      south: -22.455922,
      east: -44.449654,
      north: -22.45592,
    },
    defaultOptions,
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
    },
  },
  imagery: {
    url: env.VITE_IMAGERY_PROVIDER_URL,
    credit: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
  },
  terrain: {
    url: env.VITE_TERRAIN_PROVIDER_URL,
  },
});
