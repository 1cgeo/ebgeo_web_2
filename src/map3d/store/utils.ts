// Path: map3d\store\utils.ts
import { type Model3D } from '../schemas';
import { useMap3DStore } from './index';

// Selectors tipados
export const selectActiveTool = (
  state: ReturnType<typeof useMap3DStore.getState>,
) => state.activeTool;

export const selectModels = (
  state: ReturnType<typeof useMap3DStore.getState>,
) => state.models;

export const selectModelById =
  (id: string) => (state: ReturnType<typeof useMap3DStore.getState>) =>
    state.models.find(model => model.id === id);

// Hook para seleção de modelos com filtros
export const useModelsSelector = (filter?: (model: Model3D) => boolean) => {
  return useMap3DStore(state =>
    filter ? state.models.filter(filter) : state.models,
  );
};

// Hook para seleção de modelo específico
export const useModelSelector = (modelId: string) => {
  return useMap3DStore(state =>
    state.models.find(model => model.id === modelId),
  );
};

// Hook para estado de tool
export const useToolState = (toolId: string) => {
  return useMap3DStore(state => ({
    isActive: state.activeTool === toolId,
    isEnabled: state.models.length > 0,
  }));
};
