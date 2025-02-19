// Path: map3d\features\registry.ts
import { z } from 'zod';

import { type ComponentType } from 'react';

// Imports de features
import { AreaControl } from './area/AreaControl';
import { CatalogControl } from './catalog/CatalogControl';
import { CleanControl } from './clean/CleanControl';
import { DistanceControl } from './distance/DistanceControl';
import { IdentifyControl } from './identify/IdentifyControl';
import { LabelControl } from './label/LabelControl';
import { ViewshedControl } from './viewshed/ViewshedControl';

interface FeatureProps {
  drawerMode?: boolean;
  disabled?: boolean;
}

// Schema para feature
export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  component: z.custom<ComponentType<FeatureProps>>(
    data => {
      return typeof data === 'function';
    },
    {
      message: 'Deve ser um componente React válido',
    },
  ),
  order: z.number(),
  showInDrawer: z.boolean().default(true),
  showInToolbar: z.boolean().default(true),
  requiresModel: z.boolean().default(false),
  description: z.string().optional(),
  image: z.string().optional(),
});

// Type inferido
export type Map3DFeature = z.infer<typeof featureSchema>;

// Registro de features
const featuresConfig = [
  {
    id: 'catalog',
    name: 'Catálogo 3D',
    component: CatalogControl,
    order: 1,
    requiresModel: false,
    description: 'Adiciona modelos 3D do catálogo',
    image: '/images/catalog.svg',
  },
  {
    id: 'clean',
    name: 'Limpar',
    component: CleanControl,
    order: 2,
    requiresModel: false,
    description: 'Limpa as medições e análises do mapa',
    image: '/images/icon-clear.svg',
  },
  {
    id: 'area',
    name: 'Área',
    component: AreaControl,
    order: 3,
    requiresModel: true,
    description: 'Mede a área de uma região',
    image: '/images/icon-area.svg',
  },
  {
    id: 'distance',
    name: 'Distância',
    component: DistanceControl,
    order: 4,
    requiresModel: true,
    description: 'Mede a distância entre pontos',
    image: '/images/icon-distance.svg',
  },
  {
    id: 'viewshed',
    name: 'Visada',
    component: ViewshedControl,
    order: 5,
    requiresModel: true,
    description: 'Análise de visibilidade a partir de um ponto',
    image: '/images/icon-viewshed.svg',
  },
  {
    id: 'identify',
    name: 'Identificar',
    component: IdentifyControl,
    order: 6,
    requiresModel: true,
    description: 'Identifica elementos no mapa',
    image: '/images/information_circle.svg',
  },
  {
    id: 'label',
    name: 'Etiqueta',
    component: LabelControl,
    order: 7,
    requiresModel: true,
    description: 'Adiciona etiquetas ao mapa',
    image: '/images/icon_text_black.svg',
  },
] as const;

// Exportamos sem validação completa até implementar todos os componentes
export const features = featuresConfig;

// Hook para obter features filtradas
export function useMap3DFeatures(options?: {
  showInDrawer?: boolean;
  showInToolbar?: boolean;
  requiresModel?: boolean;
}) {
  return features
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
export function getFeature(id: (typeof featuresConfig)[number]['id']) {
  return features.find(f => f.id === id);
}

// Type helper para IDs de features
export type FeatureId = (typeof featuresConfig)[number]['id'];
