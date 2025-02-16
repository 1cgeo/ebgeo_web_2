// Path: mapSig\store.ts
import { type Map as MapLibreMap } from 'maplibre-gl';
import { create } from 'zustand';

import { type FeatureId } from './features/registry';

interface MapSigState {
  // Estado do mapa
  map: MapLibreMap | null;

  // Estado da UI compartilhado
  activeTool: FeatureId | null;
  isDrawerOpen: boolean;

  // Ações do mapa
  setMap: (map: MapLibreMap) => void;

  // Ações da UI
  setActiveTool: (toolId: FeatureId | null) => void;
  clearActiveTool: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useMapSigStore = create<MapSigState>((set, get) => ({
  // Estado inicial
  map: null,
  activeTool: null,
  isDrawerOpen: false,

  // Ações do mapa
  setMap: map => set({ map }),

  // Ações da UI
  setActiveTool: toolId => {
    if (get().activeTool === toolId) {
      set({ activeTool: null });
    } else {
      set({ activeTool: toolId });
    }

    // Atualiza cursor do mapa
    const map = get().map;
    if (map) {
      map.getCanvas().style.cursor = toolId ? 'crosshair' : '';
    }
  },

  clearActiveTool: () => {
    const map = get().map;
    if (map) {
      map.getCanvas().style.cursor = '';
    }
    set({ activeTool: null });
  },

  setDrawerOpen: open => set({ isDrawerOpen: open }),
}));

// Hooks de composição de store para features que precisam compartilhar estado
export function useMapSigToolState(toolId: FeatureId) {
  return useMapSigStore(state => ({
    isActive: state.activeTool === toolId,
    setActive: () => state.setActiveTool(toolId),
    clearActive: () => state.clearActiveTool(),
  }));
}

// Helper para acesso ao mapa em funções síncronas
export function getMap(): MapLibreMap | null {
  return useMapSigStore.getState().map;
}
