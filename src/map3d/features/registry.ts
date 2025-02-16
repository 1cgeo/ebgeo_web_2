// Path: map3d\features\registry.ts
import { z } from 'zod';

import { AreaControl } from './area/AreaControl';
import { Model3DCatalogButton } from './catalog/CatalogButton';
// Import de todos os controles
import { CleanControl } from './clean/CleanControl';
import { DistanceControl } from './distance/DistanceControl';
import { IdentifyControl } from './identify/IdentifyControl';
import { LabelControl } from './label/LabelControl';
import { ViewshedControl } from './viewshed/ViewshedControl';

// Schema para feature
export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  component: z.any(), // Componente React
  order: z.number(),
  showInDrawer: z.boolean().default(true),
  showInToolbar: z.boolean().default(true),
  requiresModel: z.boolean().default(false),
  description: z.string().optional(),
});

export type Map3DFeature = z.infer<typeof featureSchema>;

// Registro de features
export const features = {
  catalog: {
    id: 'catalog',
    name: 'Catálogo 3D',
    component: Model3DCatalogButton,
    order: 1,
    requiresModel: false,
    description: 'Catálogo de modelos 3D',
  },
  clean: {
    id: 'clean',
    name: 'Limpar',
    component: CleanControl,
    order: 2,
    requiresModel: true,
    description: 'Limpar medições e análises',
  },
  area: {
    id: 'area',
    name: 'Área',
    component: AreaControl,
    order: 3,
    requiresModel: true,
    description: 'Medir área',
  },
  distance: {
    id: 'distance',
    name: 'Distância',
    component: DistanceControl,
    order: 4,
    requiresModel: true,
    description: 'Medir distância',
  },
  viewshed: {
    id: 'viewshed',
    name: 'Visibilidade',
    component: ViewshedControl,
    order: 5,
    requiresModel: true,
    description: 'Análise de visibilidade',
  },
  identify: {
    id: 'identify',
    name: 'Identificar',
    component: IdentifyControl,
    order: 6,
    requiresModel: true,
    description: 'Identificar elementos',
  },
  label: {
    id: 'label',
    name: 'Texto',
    component: LabelControl,
    order: 7,
    requiresModel: true,
    description: 'Adicionar texto',
  },
} as const;

// Helper para obter features
export function getFeatures(options?: {
  showInDrawer?: boolean;
  showInToolbar?: boolean;
  requiresModel?: boolean;
}) {
  return Object.values(features)
    .filter(feature => {
      if (options?.showInDrawer !== undefined && !feature.showInDrawer)
        return false;
      if (options?.showInToolbar !== undefined && !feature.showInToolbar)
        return false;
      if (
        options?.requiresModel !== undefined &&
        feature.requiresModel !== options.requiresModel
      )
        return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

// Helper para obter uma feature específica
export function getFeature(id: keyof typeof features) {
  return features[id];
}

// Type helper para IDs de features
export type FeatureId = keyof typeof features;
