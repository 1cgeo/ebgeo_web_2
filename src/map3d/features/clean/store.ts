// Path: map3d\features\clean\store.ts
import { create } from 'zustand';

import { type CleanConfig } from './types';

interface CleanState {
  // Estado
  config: CleanConfig;
  isConfirmationOpen: boolean;

  // Ações
  updateConfig: (config: Partial<CleanConfig>) => void;
  openConfirmation: () => void;
  closeConfirmation: () => void;
  resetConfig: () => void;
}

const defaultConfig: CleanConfig = {
  clearMeasurements: true,
  clearLabels: true,
  clearViewshed: true,
  showConfirmation: false,
};

export const useCleanStore = create<CleanState>(set => ({
  // Estado inicial
  config: defaultConfig,
  isConfirmationOpen: false,

  // Ações
  updateConfig: config =>
    set(state => ({
      config: {
        ...state.config,
        ...config,
      },
    })),

  openConfirmation: () => set({ isConfirmationOpen: true }),

  closeConfirmation: () => set({ isConfirmationOpen: false }),

  resetConfig: () => set({ config: defaultConfig }),
}));
