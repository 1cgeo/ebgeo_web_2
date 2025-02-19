// Path: map3d\store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  type Model3D,
  type Modelos3D,
  type NuvemPontos,
  type Tiles3D,
  isModelos3D,
  isNuvemPontos,
  isTiles3D,
} from './features/catalog/types';
import { type FeatureId } from './features/registry';
import { type Camera3D, type Map3DOptions, map3DOptionsSchema } from './types';

interface Map3DState {
  // Configurações do mapa
  options: Map3DOptions;
  cameraPosition: Camera3D | null;

  // Estado da ferramenta ativa
  activeTool: FeatureId | null;

  // Models loaded in the scene
  models: Model3D[];

  // Handlers Cesium
  cesiumMeasure: any | null;
  cesiumViewshed: any | null;
  cesiumLabel: any | null;

  // Ações
  setOptions: (options: Partial<Map3DOptions>) => void;
  setActiveTool: (toolId: FeatureId | null) => void;
  clearActiveTool: () => void;
  setCameraPosition: (position: Camera3D) => void;

  // Model management
  addModel: (model: Model3D) => void;
  removeModel: (modelId: string) => void;
  updateModel: (modelId: string, updates: Partial<Model3D>) => void;

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
      models: [],
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

      // Model management - Fixed implementation with type guards
      addModel: model => {
        // Handle each model type separately to maintain type discrimination
        let modelWithVisibility: Model3D;

        if (isTiles3D(model)) {
          // Handle Tiles3D type
          modelWithVisibility = {
            ...model,
            visivel: true,
          };
        } else if (isModelos3D(model)) {
          // Handle Modelos3D type
          modelWithVisibility = {
            ...model,
            visivel: true,
          };
        } else if (isNuvemPontos(model)) {
          // Handle NuvemPontos type
          modelWithVisibility = {
            ...model,
            visivel: true,
          };
        } else {
          // Fallback - should never happen with proper type guards
          modelWithVisibility = model;
        }

        set(state => ({
          models: [...state.models, modelWithVisibility],
        }));
      },

      removeModel: modelId =>
        set(state => ({
          models: state.models.filter(m => m.id !== modelId),
        })),

      updateModel: (modelId, updates) =>
        set(state => {
          const updatedModels = state.models.map(model => {
            if (model.id === modelId) {
              // Apply updates based on model type to preserve the discriminated union
              if (isTiles3D(model)) {
                return {
                  ...model,
                  ...updates,
                  tipo: 'Tiles 3D', // Ensure discriminant is preserved
                } as Tiles3D;
              } else if (isModelos3D(model)) {
                return {
                  ...model,
                  ...updates,
                  tipo: 'Modelos 3D', // Ensure discriminant is preserved
                } as Modelos3D;
              } else if (isNuvemPontos(model)) {
                return {
                  ...model,
                  ...updates,
                  tipo: 'Nuvem de Pontos', // Ensure discriminant is preserved
                } as NuvemPontos;
              }
            }
            return model;
          });

          return { models: updatedModels };
        }),

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
