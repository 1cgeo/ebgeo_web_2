// Path: mapSig\features\vectorInfo\store.ts
import { create } from 'zustand';

import { getMap } from '../../store';
import { sortFeatures } from './featureUtils';
import { type VectorFeature } from './types';

interface VectorInfoState {
  isPanelOpen: boolean;
  isActive: boolean;
  selectedFeature: VectorFeature | null;

  // Panel controls
  openPanel: () => void;
  closePanel: () => void;

  // Feature selection
  selectFeature: (features: VectorFeature[]) => void;
  clearSelection: () => void;

  // Tool state
  setActive: (active: boolean) => void;
}

export const useVectorInfoStore = create<VectorInfoState>((set) => ({
  isPanelOpen: false,
  isActive: false,
  selectedFeature: null,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => {
    set({
      isPanelOpen: false,
      selectedFeature: null,
      isActive: false,
    });

    const map = getMap();
    if (map) {
      map.getCanvas().style.cursor = '';
    }
  },

  selectFeature: features => {
    if (features.length > 0) {
      const sortedFeatures = sortFeatures(features);
      set({
        selectedFeature: sortedFeatures[0],
        isPanelOpen: true,
      });
    }
  },

  clearSelection: () => {
    set({
      selectedFeature: null,
      isPanelOpen: false,
    });
  },

  setActive: active => {
    const map = getMap();
    if (map) {
      map.getCanvas().style.cursor = active ? 'help' : '';
    }

    if (!active) {
      set({
        selectedFeature: null,
        isPanelOpen: false,
      });
    }

    set({ isActive: active });
  },
}));
