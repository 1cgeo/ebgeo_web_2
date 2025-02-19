// Path: map3d\features\viewshed\store.ts
import { create } from 'zustand';

import { getCesium } from '../../store';
import { ViewshedToolState } from './types';

interface ViewshedState {
  // Estado
  toolState: ViewshedToolState;
  viewshedInstance: any | null;

  // Ações
  startViewshedAnalysis: () => void;
  cancelViewshedAnalysis: () => void;
  setViewshedInstance: (instance: any) => void;
  clearViewshed: () => void;
}

export const useViewshedStore = create<ViewshedState>(set => ({
  // Estado inicial
  toolState: ViewshedToolState.INACTIVE,
  viewshedInstance: null,

  // Ações
  startViewshedAnalysis: () => {
    set({ toolState: ViewshedToolState.ACTIVE });
  },

  cancelViewshedAnalysis: () => {
    const cesium = getCesium();
    if (!cesium) return;

    const { viewshedInstance } = useViewshedStore.getState();
    if (viewshedInstance) {
      try {
        viewshedInstance.clear();
      } catch (error) {
        console.error('Erro ao cancelar análise de visibilidade:', error);
      }
    }

    set({
      toolState: ViewshedToolState.INACTIVE,
    });
  },

  setViewshedInstance: instance => {
    set({ viewshedInstance: instance });
  },

  clearViewshed: () => {
    const { viewshedInstance } = useViewshedStore.getState();
    if (viewshedInstance) {
      try {
        viewshedInstance.clear();
      } catch (error) {
        console.error('Erro ao limpar análise de visibilidade:', error);
      }
    }

    set({
      toolState: ViewshedToolState.INACTIVE,
    });
  },
}));

// Helper para limpar análises de visibilidade
export function cleanViewshedAnalyses() {
  const { viewshedInstance } = useViewshedStore.getState();
  if (viewshedInstance) {
    try {
      viewshedInstance.clear();
    } catch (error) {
      console.error('Erro ao limpar análises de visibilidade:', error);
    }
  }

  useViewshedStore.setState({
    toolState: ViewshedToolState.INACTIVE,
  });
}
