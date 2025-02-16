import { create } from 'zustand';
import { baseMapStyles } from '../../baseMapStyles';
import { useMapsStore } from '@/shared/store/mapsStore';

type BaseMapStyle = keyof typeof baseMapStyles;

interface BaseMapState {
  currentStyle: BaseMapStyle;
  setBaseMap: (style: BaseMapStyle) => void;
  toggleBaseMap: () => void;
}

export const BaseMapToggleControl = create<BaseMapState>((set) => ({
  currentStyle: 'orto',

  setBaseMap: (style) => {
    const map = useMapsStore.getState().map;
    if (map) {
      map.setStyle(baseMapStyles[style]);
      set({ currentStyle: style });
    }
  },

  toggleBaseMap: () => {
    set((state) => {
      const nextStyle = state.currentStyle === 'orto' ? 'topo' : 'orto';
      const map = useMapsStore.getState().map;
      
      if (map) {
        map.setStyle(baseMapStyles[nextStyle]);
      }
      
      return { currentStyle: nextStyle };
    });
  },
}));