// Path: map3d\features\clean\store.ts
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import { useAreaStore } from '../area/store';
import { useDistanceStore } from '../distance/store';
import { useViewshedStore } from '../viewshed/store';

interface CleanState {
  clearAll: () => void;
}

export const useCleanStore = create<CleanState>(() => ({
  clearAll: () => {
    // Limpa todas as features
    useAreaStore.getState().reset();
    useDistanceStore.getState().reset();
    useViewshedStore.getState().reset();

    // Limpa a ferramenta ativa
    useMap3DStore.getState().clearActiveTool();
  },
}));
