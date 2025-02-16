// Path: mapSig\features\resetNorth\store.ts
import { create } from 'zustand';

import { getMap } from '../../store';
import { type ResetOptions, defaultResetOptions } from './types';

interface ResetNorthState {
  options: ResetOptions;
  isResetting: boolean;
  setOptions: (options: Partial<ResetOptions>) => void;
  resetBearing: () => void;
}

export const useResetNorthStore = create<ResetNorthState>(set => ({
  options: defaultResetOptions,
  isResetting: false,

  setOptions: newOptions =>
    set(state => ({
      options: { ...state.options, ...newOptions },
    })),

  resetBearing: () => {
    const map = getMap();
    if (!map) return;

    set({ isResetting: true });

    const { bearing, pitch, camera } = defaultResetOptions;

    map.easeTo({
      bearing,
      pitch,
      duration: camera.duration,
      easing: camera.easing,
      offset: camera.offset,
      complete: () => set({ isResetting: false }),
    });
  },
}));
