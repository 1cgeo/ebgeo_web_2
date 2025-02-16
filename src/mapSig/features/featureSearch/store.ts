// Path: mapSig\features\featureSearch\store.ts
import { create } from 'zustand';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type SearchFeature } from './types';

interface FeatureSearchState {
  isPanelOpen: boolean;
  selectedFeature: SearchFeature | null;
  openPanel: () => void;
  closePanel: () => void;
  selectFeature: (feature: SearchFeature | null) => void;
  flyToFeature: (feature: SearchFeature) => void;
}

export const useFeatureSearchStore = create<FeatureSearchState>((set, get) => ({
  isPanelOpen: false,
  selectedFeature: null,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  selectFeature: feature => {
    set({ selectedFeature: feature });
    if (feature) {
      get().flyToFeature(feature);
      get().openPanel();
    }
  },

  flyToFeature: feature => {
    const map = useMapsStore.getState().map;
    if (!map) return;

    map.flyTo({
      center: [feature.coordinates.lon, feature.coordinates.lat],
      zoom: 15,
      duration: 1500,
    });
  },
}));
