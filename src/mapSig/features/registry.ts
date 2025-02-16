import { z } from 'zod';
import { BaseMapToggleControl } from './baseMapToggle/components/BaseMapToggleControl';
import { FeatureSearchControl } from './featureSearch/components/FeatureSearchControl';
import { ResetNorthControl } from './resetNorth/components/ResetNorthControl';
import { TextControl } from './textTool/components/TextControl';
import { VectorInfoControl } from './vectorInfo/components/VectorInfoControl';

export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  component: z.any(),
  order: z.number(),
  showInDrawer: z.boolean().default(true),
  showInToolbar: z.boolean().default(true),
});

export type MapSigFeature = z.infer<typeof featureSchema>;

// Registro de features
export const features: MapSigFeature[] = [
  {
    id: 'baseMap',
    name: 'Mapa Base',
    component: BaseMapToggleControl,
    order: 1,
  },
  {
    id: 'featureSearch',
    name: 'Buscar',
    component: FeatureSearchControl,
    order: 2,
  },
  {
    id: 'resetNorth',
    name: 'Resetar Norte',
    component: ResetNorthControl,
    order: 3,
  },
  {
    id: 'text',
    name: 'Texto',
    component: TextControl,
    order: 4,
  },
  {
    id: 'vectorInfo',
    name: 'Informações',
    component: VectorInfoControl,
    order: 5,
  },
];

// Hook para obter features filtradas
export function useMapSigFeatures(options?: { 
  showInDrawer?: boolean;
  showInToolbar?: boolean;
}) {
  return features
    .filter(feature => {
      if (options?.showInDrawer !== undefined && !feature.showInDrawer) return false;
      if (options?.showInToolbar !== undefined && !feature.showInToolbar) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}