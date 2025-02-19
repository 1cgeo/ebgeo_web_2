// Path: map3d\features\clean\useClean.ts
import { useCallback } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { cleanAreaMeasurements } from '../area/store';
import { cleanDistanceMeasurements } from '../distance/store';
import { cleanLabels } from '../label/store';
import { cleanViewshedAnalyses } from '../viewshed/store';
import { useCleanStore } from './store';

export function useClean() {
  const { config } = useCleanStore();
  const cesiumMap = useMapsStore(state => state.cesiumMap);

  const cleanAll = useCallback(() => {
    if (!cesiumMap) return;

    if (config.clearMeasurements) {
      // Limpa medições de área
      cleanAreaMeasurements();

      // Limpa medições de distância
      cleanDistanceMeasurements();
    }

    if (config.clearLabels) {
      // Limpa etiquetas
      cleanLabels();
    }

    if (config.clearViewshed) {
      // Limpa análises de visibilidade
      cleanViewshedAnalyses();
    }
  }, [config, cesiumMap]);

  return {
    cleanAll,
    config,
  };
}
