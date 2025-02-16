// Path: map3d\store\index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type FeatureId } from '../features/registry';
import {
  type Camera3D,
  type Handlers3D,
  type Map3DOptions,
  map3DOptionsSchema,
} from '../types';

interface Map3DStore extends Handlers3D {
  // Configurações
  options: Map3DOptions;

  // Estado da ferramenta ativa
  activeTool: FeatureId | null;

  // Estado da câmera
  cameraPosition: Camera3D | null;

  // Ações
  setOptions: (options: Partial<Map3DOptions>) => void;
  setActiveTool: (toolId: FeatureId | null) => void;
  clearActiveTool: () => void;
  setCameraPosition: (position: Camera3D) => void;

  // Handlers
  setCesiumMeasure: (handler: any) => void;
  setCesiumViewshed: (handler: any) => void;
  setCesiumLabel: (handler: any) => void;
}

export const useMap3DStore = create<Map3DStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        options: map3DOptionsSchema.parse({
          baseMap: true,
          terrain: true,
          lighting: true,
          atmosphere: true,
        }),
        activeTool: null,
        cameraPosition: null,
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
          const { cesiumMeasure, cesiumViewshed, cesiumLabel } = get();

          // Limpa ferramenta atual
          if (cesiumMeasure) cesiumMeasure.clean();
          if (cesiumViewshed) cesiumViewshed.clean();
          if (cesiumLabel) cesiumLabel.clean();

          set({ activeTool: toolId });

          // Configura nova ferramenta
          if (toolId) {
            switch (toolId) {
              case 'area':
              case 'distance':
                if (cesiumMeasure) cesiumMeasure.setActiveMeasure(toolId);
                break;
              case 'viewshed':
                if (cesiumViewshed) cesiumViewshed.addViewshed();
                break;
              case 'label':
                if (cesiumLabel) cesiumLabel.setActive(true);
                break;
            }
          }
        },

        clearActiveTool: () => {
          const { cesiumMeasure, cesiumViewshed, cesiumLabel } = get();

          if (cesiumMeasure) cesiumMeasure.clean();
          if (cesiumViewshed) cesiumViewshed.clean();
          if (cesiumLabel) cesiumLabel.clean();

          set({ activeTool: null });
        },

        setCameraPosition: position => set({ cameraPosition: position }),

        setCesiumMeasure: handler => set({ cesiumMeasure: handler }),
        setCesiumViewshed: handler => set({ cesiumViewshed: handler }),
        setCesiumLabel: handler => set({ cesiumLabel: handler }),
      }),
      {
        name: 'map3d-store',
        partialize: state => ({
          options: state.options,
          cameraPosition: state.cameraPosition,
        }),
        version: 1,
      },
    ),
  ),
);
