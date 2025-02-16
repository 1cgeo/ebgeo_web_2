// Path: map3d\features\clean\store.ts
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import { useAreaStore } from '../area/store';
import { useDistanceStore } from '../distance/store';
import { useLabelStore } from '../label/store';
import { useViewshedStore } from '../viewshed/store';
import { type CleanConfig, defaultCleanConfig } from './types';

interface CleanState {
  config: CleanConfig;
  isEnabled: boolean;

  // Actions
  clearAll: () => void;
  setEnabled: (enabled: boolean) => void;
  updateConfig: (config: Partial<CleanConfig>) => void;
}

export const useCleanStore = create<CleanState>(set => ({
  config: defaultCleanConfig,
  isEnabled: true,

  clearAll: () => {
    // Limpa todas as features
    useAreaStore.getState().reset();
    useDistanceStore.getState().reset();
    useViewshedStore.getState().reset();
    useLabelStore.getState().reset();

    // Limpa a ferramenta ativa
    useMap3DStore.getState().clearActiveTool();
  },

  setEnabled: enabled => set({ isEnabled: enabled }),

  updateConfig: newConfig =>
    set(state => ({
      config: { ...state.config, ...newConfig },
    })),
}));
