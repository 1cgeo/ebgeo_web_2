// Path: mapSig\features\resetNorth\store.ts
import { create } from 'zustand';

import { getMap } from '../../store';
import { type ResetOptions, defaultResetOptions } from './types';

interface ResetNorthState {
  options: ResetOptions;
  setOptions: (options: Partial<ResetOptions>) => void;
  resetBearing: () => void;
}

export const useResetNorthStore = create<ResetNorthState>(set => ({
  options: defaultResetOptions,

  setOptions: newOptions =>
    set(state => ({
      options: { ...state.options, ...newOptions },
    })),

  resetBearing: () => {
    const map = getMap();
    if (!map) return;

    const { bearing, pitch } = defaultResetOptions;

    map.easeTo({
      bearing,
      pitch,
      duration: 1000,
    });
  },
}));
