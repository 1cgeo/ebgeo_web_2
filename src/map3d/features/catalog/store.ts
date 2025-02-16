// Path: map3d\features\catalog\store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type Model3D } from '@/map3d/schemas';
import { useMap3DStore } from '@/map3d/store';

interface CatalogState {
  isPanelOpen: boolean;
  searchTerm: string;
  page: number;
  pageSize: number;
  totalResults: number;

  // Panel controls
  openPanel: () => void;
  closePanel: () => void;

  // Search controls
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  setTotalResults: (total: number) => void;
  resetSearch: () => void;

  // Model management
  onModelSelect: (model: Model3D) => void;
}

export const useCatalogStore = create<CatalogState>()(
  devtools(
    (set, get) => ({
      isPanelOpen: false,
      searchTerm: '',
      page: 1,
      pageSize: 10,
      totalResults: 0,

      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => {
        set({
          isPanelOpen: false,
          searchTerm: '',
          page: 1,
        });
      },

      setSearchTerm: searchTerm =>
        set({
          searchTerm,
          page: 1, // Reset page when search changes
        }),

      setPage: page => set({ page }),

      setTotalResults: totalResults => set({ totalResults }),

      resetSearch: () =>
        set({
          searchTerm: '',
          page: 1,
          totalResults: 0,
        }),

      onModelSelect: model => {
        useMap3DStore.getState().addModel(model);
        get().closePanel();
      },
    }),
    {
      name: 'catalog-store',
    },
  ),
);
