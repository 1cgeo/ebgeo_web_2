// Path: mapSig\features\baseMapToggle\store.ts
import { create } from 'zustand';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type BaseMapStyleType, baseMapStyles } from './baseMapStyles';

interface BaseMapState {
  currentStyle: BaseMapStyleType;
  setBaseMap: (style: BaseMapStyleType) => void;
  toggleBaseMap: () => void;
}

export const useBaseMapStore = create<BaseMapState>(set => ({
  currentStyle: 'orto',

  setBaseMap: style => {
    const map = useMapsStore.getState().map;
    if (map) {
      map.setStyle(baseMapStyles[style]);
      set({ currentStyle: style });
    }
  },

  toggleBaseMap: () => {
    set(state => {
      const nextStyle = state.currentStyle === 'orto' ? 'topo' : 'orto';
      const map = useMapsStore.getState().map;

      if (map) {
        map.setStyle(baseMapStyles[nextStyle]);
      }

      return { currentStyle: nextStyle };
    });
  },
}));
