// Path: map3d\features\catalog\store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { useMap3DStore } from '@/map3d/store';

import {
  type Model3D,
  type SearchParams,
  defaultSearchParams,
  searchParamsSchema,
} from './types';

interface CatalogState {
  // Estado do painel
  isPanelOpen: boolean;

  // Estado da busca
  searchParams: SearchParams;
  selectedModel: Model3D | null;

  // Ações do painel
  openPanel: () => void;
  closePanel: () => void;

  // Ações de busca
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  resetSearch: () => void;

  // Ações de modelo
  selectModel: (model: Model3D | null) => void;
  addModelToScene: (model: Model3D) => void;
}

export const useCatalogStore = create<CatalogState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      isPanelOpen: false,
      searchParams: defaultSearchParams,
      selectedModel: null,

      // Ações do painel
      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => {
        set({
          isPanelOpen: false,
          searchParams: defaultSearchParams,
          selectedModel: null,
        });
      },

      // Ações de busca
      setSearchTerm: query => {
        const params = searchParamsSchema.parse({
          ...get().searchParams,
          query,
          pagina: 1, // Reset página quando busca muda
        });
        set({ searchParams: params });
      },

      setPage: pagina => {
        const params = searchParamsSchema.parse({
          ...get().searchParams,
          pagina,
        });
        set({ searchParams: params });
      },

      resetSearch: () =>
        set({
          searchParams: defaultSearchParams,
          selectedModel: null,
        }),

      // Ações de modelo
      selectModel: model =>
        set({
          selectedModel: model,
        }),

      addModelToScene: model => {
        // Adiciona o modelo à cena através do store global
        useMap3DStore.getState().addModel(model);
        // Fecha o painel
        get().closePanel();
      },
    }),
    {
      name: 'catalog-store',
    },
  ),
);

// Hook para seleção de modelo
export function useSelectedModel() {
  return useCatalogStore(state => ({
    selectedModel: state.selectedModel,
    selectModel: state.selectModel,
  }));
}

// Hook para parâmetros de busca
export function useSearchParams() {
  return useCatalogStore(state => ({
    params: state.searchParams,
    setSearchTerm: state.setSearchTerm,
    setPage: state.setPage,
    resetSearch: state.resetSearch,
  }));
}
