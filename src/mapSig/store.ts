// Path: mapSig\store.ts
import { create } from 'zustand';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type FeatureId } from './features/registry';

// Lista de ferramentas mutuamente exclusivas
const EXCLUSIVE_TOOLS = ['vectorInfo', 'textTool'] as const;
type ExclusiveTool = (typeof EXCLUSIVE_TOOLS)[number];

interface MapSigState {
  // Estado da UI compartilhado
  activeTool: FeatureId | null;
  isDrawerOpen: boolean;

  // Ações da UI
  setActiveTool: (toolId: FeatureId | null) => void;
  clearActiveTool: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useMapSigStore = create<MapSigState>((set, get) => ({
  // Estado inicial
  activeTool: null,
  isDrawerOpen: false,

  // Ações da UI
  setActiveTool: toolId => {
    const currentTool = get().activeTool;

    // Se está tentando ativar a mesma ferramenta, desativa
    if (currentTool === toolId) {
      set({ activeTool: null });
      return;
    }

    // Se está tentando ativar uma ferramenta exclusiva
    if (toolId && EXCLUSIVE_TOOLS.includes(toolId as ExclusiveTool)) {
      set({ activeTool: toolId });
    } else if (!EXCLUSIVE_TOOLS.includes(toolId as ExclusiveTool)) {
      // Se não é uma ferramenta exclusiva, permite ativar normalmente
      set({ activeTool: toolId });
    }

    // Atualiza cursor do mapa
    const map = getMap();
    if (map) {
      map.getCanvas().style.cursor = toolId ? 'crosshair' : '';
    }
  },

  clearActiveTool: () => {
    const map = getMap();
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMap(): any | null {
  return useMapsStore.getState().map;
}
