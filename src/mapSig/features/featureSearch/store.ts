// Path: mapSig\features\featureSearch\store.ts
import { create } from 'zustand';

import { type SearchFeature } from './types';

interface FeatureSearchState {
  isInputVisible: boolean;
  isPanelOpen: boolean;
  selectedFeature: SearchFeature | null;

  // UI Actions
  toggleInput: () => void;
  openPanel: () => void;
  closePanel: () => void;

  // Feature Actions
  selectFeature: (feature: SearchFeature | null) => void;
}

export const useFeatureSearchStore = create<FeatureSearchState>(set => ({
  isInputVisible: false,
  isPanelOpen: false,
  selectedFeature: null,

  toggleInput: () =>
    set(state => ({
      isInputVisible: !state.isInputVisible,
      isPanelOpen: false,
      selectedFeature: null,
    })),

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () =>
    set({
      isPanelOpen: false,
      selectedFeature: null,
    }),

  selectFeature: feature => {
    set({
      selectedFeature: feature,
      isPanelOpen: !!feature,
      isInputVisible: false,
    });
  },
}));
