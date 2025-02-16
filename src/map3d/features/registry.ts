import { z } from 'zod';

// Componentes serão importados de cada feature
import { Model3DCatalogButton } from './catalog/components/CatalogButton';
import { CleanControl } from './clean/components/CleanControl';
import { AreaControl } from './measure/components/AreaControl';
import { DistanceControl } from './measure/components/DistanceControl';
import { ViewshedControl } from './viewshed/components/ViewshedControl';
import { IdentifyControl } from './identify/components/IdentifyControl';
import { LabelControl } from './label/components/LabelControl';

export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  component: z.any(),
  order: z.number(),
  showInDrawer: z.boolean().default(true),
  showInToolbar: z.boolean().default(true),
  requiresModel: z.boolean().default(false), // Específico para Map3D
});

export type Map3DFeature = z.infer<typeof featureSchema>;

export const features: Map3DFeature[] = [
  {
    id: 'catalog',
    name: 'Catálogo 3D',
    component: Model3DCatalogButton,
    order: 1,
    requiresModel: false,
  },
  {
    id: 'clean',
    name: 'Limpar',
    component: CleanControl,
    order: 2,
    requiresModel: true,
  },
  {
    id: 'area',
    name: 'Área',
    component: AreaControl,
    order: 3,
    requiresModel: true,
  },
  {
    id: 'distance',
    name: 'Distância',
    component: DistanceControl,
    order: 4,
    requiresModel: true,
  },
  {
    id: 'viewshed',
    name: 'Visibilidade',
    component: ViewshedControl,
    order: 5,
    requiresModel: true,
  },
  {
    id: 'identify',
    name: 'Identificar',
    component: IdentifyControl,
    order: 6,
    requiresModel: true,
  },
  {
    id: 'label',
    name: 'Texto',
    component: LabelControl,
    order: 7,
    requiresModel: true,
  },
];

export function useMap3DFeatures(options?: { 
  showInDrawer?: boolean;
  showInToolbar?: boolean;
  requiresModel?: boolean;
}) {
  return features
    .filter(feature => {
      if (options?.showInDrawer !== undefined && !feature.showInDrawer) return false;
      if (options?.showInToolbar !== undefined && !feature.showInToolbar) return false;
      if (options?.requiresModel !== undefined && feature.requiresModel !== options.requiresModel) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}