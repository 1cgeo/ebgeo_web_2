// Path: mapSig\features\registry.ts
import { z } from 'zod';

import { type ComponentType } from 'react';

// Imports de features
import { BaseMapToggleControl } from './baseMapToggle/BaseMapToggleControl';
import { FeatureSearchControl } from './featureSearch/FeatureSearchControl';
import { ResetNorthControl } from './resetNorth/ResetNorthControl';
import { TextControl } from './textTool/TextControl';
import { VectorInfoControl } from './vectorInfo/VectorInfoControl';

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
});

// Type inferido
export type MapSigFeature = z.infer<typeof featureSchema>;

// Registro de features
const featuresConfig = [
  {
    id: 'baseMap',
    name: 'Mapa Base',
    component: BaseMapToggleControl,
    order: 1,
    showInToolbar: false,
    description: 'Alterna entre diferentes estilos de mapa base',
  },
  {
    id: 'featureSearch',
    name: 'Buscar',
    component: FeatureSearchControl,
    order: 2,
    description: 'Busca por feições no mapa',
  },
  {
    id: 'resetNorth',
    name: 'Resetar Norte',
    component: ResetNorthControl,
    order: 3,
    description: 'Reorienta o mapa para o norte',
  },
  {
    id: 'text',
    name: 'Texto',
    component: TextControl,
    order: 4,
    description: 'Adiciona textos ao mapa',
  },
  {
    id: 'vectorInfo',
    name: 'Informações',
    component: VectorInfoControl,
    order: 5,
    description: 'Exibe informações sobre camadas vetoriais',
  },
] as const;

// Valida features na inicialização
export const features = featuresConfig.map(feature =>
  featureSchema.parse(feature),
);

// Hook para obter features filtradas
export function useMapSigFeatures(options?: {
  showInDrawer?: boolean;
  showInToolbar?: boolean;
}) {
  return features
    .filter(feature => {
      if (options?.showInDrawer !== undefined && !feature.showInDrawer)
        return false;
      if (options?.showInToolbar !== undefined && !feature.showInToolbar)
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
