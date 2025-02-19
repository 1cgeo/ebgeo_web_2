// Path: map3d\store.ts
import { create } from 'zustand';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type FeatureId } from './features/registry';

// Lista de ferramentas mutuamente exclusivas
const EXCLUSIVE_TOOLS = [
  'area',
  'distance',
  'viewshed',
  'label',
  'identify',
] as const;
type ExclusiveTool = (typeof EXCLUSIVE_TOOLS)[number];

interface Map3DState {
  // Estado da UI compartilhado
  activeTool: FeatureId | null;
  isDrawerOpen: boolean;

  // Estado de ferramentas
  areToolsEnabled: boolean;

  // Ações da UI
  setActiveTool: (toolId: FeatureId | null) => void;
  clearActiveTool: () => void;
  setDrawerOpen: (open: boolean) => void;
  setToolsEnabled: (enabled: boolean) => void;
}

export const useMap3DStore = create<Map3DState>((set, get) => ({
  // Estado inicial
  activeTool: null,
  isDrawerOpen: false,
  areToolsEnabled: false,

  // Ações da UI
  setActiveTool: toolId => {
    const currentTool = get().activeTool;
    const areToolsEnabled = get().areToolsEnabled;

    // Se as ferramentas estão desabilitadas, não permite ativar
    if (!areToolsEnabled && toolId !== 'catalog') {
      return;
    }

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
  },

  clearActiveTool: () => {
    set({ activeTool: null });
  },

  setDrawerOpen: open => set({ isDrawerOpen: open }),

  setToolsEnabled: enabled => set({ areToolsEnabled: enabled }),
}));

// Hooks de composição de store para features que precisam compartilhar estado
export function useMap3DToolState(toolId: FeatureId) {
  return useMap3DStore(state => ({
    isActive: state.activeTool === toolId,
    isEnabled:
      state.areToolsEnabled || toolId === 'catalog' || toolId === 'clean',
    setActive: () => state.setActiveTool(toolId),
    clearActive: () => state.clearActiveTool(),
  }));
}

// Helper para acesso ao mapa em funções síncronas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCesium(): { Cesium: any; viewer: any } | null {
  const cesium = useMapsStore.getState().cesium;
  const viewer = useMapsStore.getState().cesiumMap;

  if (!cesium || !viewer) {
    return null;
  }

  return { Cesium: cesium, viewer };
}
