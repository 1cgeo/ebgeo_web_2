import { create } from 'zustand';
import { useMapsStore } from '@/shared/store/mapsStore';
import { type ResetOptions, defaultResetOptions } from '../constants';

interface ResetNorthState {
  options: ResetOptions;
  setOptions: (options: Partial<ResetOptions>) => void;
  resetBearing: () => void;
  isResetting: boolean;
}

export const useResetNorthStore = create<ResetNorthState>((set) => ({
  options: defaultResetOptions,
  isResetting: false,

  setOptions: (newOptions) => 
    set((state) => ({
      options: { ...state.options, ...newOptions }
    })),

  resetBearing: () => {
    const map = useMapsStore.getState().map;
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