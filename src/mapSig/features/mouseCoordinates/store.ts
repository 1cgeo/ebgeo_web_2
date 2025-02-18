// Path: mapSig\features\mouseCoordinates\store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type CoordinateConfig,
  type CoordinateFormat,
  type DecimalCoordinates,
} from './types';

const DEFAULT_COORDINATES: DecimalCoordinates = {
  lat: 0,
  lng: 0,
};

interface MouseCoordinatesState {
  // Estado
  coordinates: DecimalCoordinates;
  config: CoordinateConfig;
  isFormatSelectorOpen: boolean;

  // Ações
  updateCoordinates: (coords: DecimalCoordinates) => void;
  setFormat: (format: CoordinateFormat) => void;
  setPrecision: (precision: number) => void;
  toggleVisibility: () => void;
  openFormatSelector: () => void;
  closeFormatSelector: () => void;
  resetConfig: () => void;
}

export const useMouseCoordinatesStore = create<MouseCoordinatesState>()(
  persist(
    set => ({
      // Estado inicial
      coordinates: DEFAULT_COORDINATES,
      config: {
        format: 'decimal',
        precision: 5,
        visible: true,
      },
      isFormatSelectorOpen: false,

      // Ações para manipular o estado
      updateCoordinates: coords => set({ coordinates: coords }),

      setFormat: format =>
        set(state => ({
          config: { ...state.config, format },
        })),

      setPrecision: precision =>
        set(state => ({
          config: { ...state.config, precision },
        })),

      toggleVisibility: () =>
        set(state => ({
          config: { ...state.config, visible: !state.config.visible },
        })),

      openFormatSelector: () => set({ isFormatSelectorOpen: true }),
      closeFormatSelector: () => set({ isFormatSelectorOpen: false }),

      resetConfig: () =>
        set({
          config: {
            format: 'decimal',
            precision: 5,
            visible: true,
          },
        }),
    }),
    {
      name: 'mouse-coordinates-storage',
      partialize: state => ({ config: state.config }),
    },
  ),
);
