// Path: map3d\store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type FeatureId } from './features/registry';
import { type Camera3D, type Map3DOptions, map3DOptionsSchema } from './types';

interface Map3DState {
  // Configurações do mapa
  options: Map3DOptions;
  cameraPosition: Camera3D | null;

  // Estado da ferramenta ativa
  activeTool: FeatureId | null;

  // Handlers Cesium
  cesiumMeasure: any | null;
  cesiumViewshed: any | null;
  cesiumLabel: any | null;

  // Ações
  setOptions: (options: Partial<Map3DOptions>) => void;
  setActiveTool: (toolId: FeatureId | null) => void;
  clearActiveTool: () => void;
  setCameraPosition: (position: Camera3D) => void;

  // Setters para handlers
  setCesiumMeasure: (handler: any) => void;
  setCesiumViewshed: (handler: any) => void;
  setCesiumLabel: (handler: any) => void;
}

export const useMap3DStore = create<Map3DState>()(
  devtools(
    set => ({
      // Estado inicial
      options: map3DOptionsSchema.parse({
        baseMap: true,
        terrain: true,
        lighting: true,
        atmosphere: true,
      }),
      cameraPosition: null,
      activeTool: null,
      cesiumMeasure: null,
      cesiumViewshed: null,
      cesiumLabel: null,

      // Ações
      setOptions: newOptions =>
        set(state => ({
          options: map3DOptionsSchema.parse({
            ...state.options,
            ...newOptions,
          }),
        })),

      setActiveTool: toolId => {
        const { cesiumMeasure, cesiumViewshed, cesiumLabel } =
          useMap3DStore.getState();

        // Limpa ferramentas ativas
        if (cesiumMeasure) cesiumMeasure.clean();
        if (cesiumViewshed) cesiumViewshed.clean();
        if (cesiumLabel) cesiumLabel.clean();

        set({ activeTool: toolId });
      },

      clearActiveTool: () => {
        const { cesiumMeasure, cesiumViewshed, cesiumLabel } =
          useMap3DStore.getState();

        if (cesiumMeasure) cesiumMeasure.clean();
        if (cesiumViewshed) cesiumViewshed.clean();
        if (cesiumLabel) cesiumLabel.clean();

        set({ activeTool: null });
      },

      setCameraPosition: position => set({ cameraPosition: position }),

      // Setters para handlers
      setCesiumMeasure: handler => set({ cesiumMeasure: handler }),
      setCesiumViewshed: handler => set({ cesiumViewshed: handler }),
      setCesiumLabel: handler => set({ cesiumLabel: handler }),
    }),
    {
      name: 'map3d-store',
    },
  ),
);

// Hooks compostos para melhor reutilização
export function useToolState(toolId: FeatureId) {
  return useMap3DStore(state => ({
    isActive: state.activeTool === toolId,
    setActive: () => state.setActiveTool(toolId),
    clearActive: () => state.clearActiveTool(),
  }));
}

export function useMapOptions() {
  return useMap3DStore(state => ({
    options: state.options,
    setOptions: state.setOptions,
  }));
}
