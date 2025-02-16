import { type StateCreator } from 'zustand';
import { type CatalogItem } from '../../features/catalog/types';

export interface ModelsSlice {
  models: CatalogItem[];
  selectedModel: CatalogItem | null;
  
  // Actions
  addModel: (model: CatalogItem) => void;
  removeModel: (modelId: string) => void;
  setModelVisibility: (modelId: string, visible: boolean) => void;
  selectModel: (model: CatalogItem | null) => void;
  flyToModel: (modelId: string) => void;
}

export const createModelsSlice: StateCreator<ModelsSlice> = (set, get) => ({
  models: [],
  selectedModel: null,

  addModel: (model) => set((state) => ({
    models: [...state.models, { ...model, visible: true }]
  })),

  removeModel: (modelId) => set((state) => ({
    models: state.models.filter((m) => m.id !== modelId),
    selectedModel: state.selectedModel?.id === modelId 
      ? null 
      : state.selectedModel
  })),

  setModelVisibility: (modelId, visible) => set((state) => ({
    models: state.models.map((m) =>
      m.id === modelId ? { ...m, visible } : m
    )
  })),

  selectModel: (model) => set({ 
    selectedModel: model 
  }),

  flyToModel: (modelId) => {
    const model = get().models.find(m => m.id === modelId);
    if (model) {
      set({ selectedModel: model });
    }
  }
});