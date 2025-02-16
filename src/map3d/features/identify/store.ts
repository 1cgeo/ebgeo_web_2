// Path: map3d\features\identify\store.ts
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import {
  type Coordinates,
  type FeatureInfo,
  coordinatesSchema,
  featureInfoSchema,
} from './types';

interface IdentifyState {
  selectedCoordinates: Coordinates | null;
  featureInfo: FeatureInfo | null;
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;

  // Actions
  setSelectedCoordinates: (coordinates: Coordinates | null) => void;
  setFeatureInfo: (info: FeatureInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  reset: () => void;
}

export const useIdentifyStore = create<IdentifyState>(set => ({
  selectedCoordinates: null,
  featureInfo: null,
  isLoading: false,
  error: null,
  isPanelOpen: false,

  setSelectedCoordinates: coordinates => {
    if (coordinates) {
      const validatedCoords = coordinatesSchema.parse(coordinates);
      set({ selectedCoordinates: validatedCoords });
    } else {
      set({ selectedCoordinates: null });
    }
  },

  setFeatureInfo: info => {
    if (info) {
      const validatedInfo = featureInfoSchema.parse(info);
      set({
        featureInfo: validatedInfo,
        isLoading: false,
        error: null,
      });
    } else {
      set({
        featureInfo: null,
        isLoading: false,
        error: null,
      });
    }
  },

  setLoading: loading =>
    set({
      isLoading: loading,
      error: null,
    }),

  setError: error =>
    set({
      error,
      isLoading: false,
      featureInfo: null,
    }),

  openPanel: () =>
    set({
      isPanelOpen: true,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      selectedCoordinates: null,
      featureInfo: null,
      error: null,
    }),

  reset: () => {
    set({
      selectedCoordinates: null,
      featureInfo: null,
      isLoading: false,
      error: null,
      isPanelOpen: false,
    });
    useMap3DStore.getState().clearActiveTool();
  },
}));
