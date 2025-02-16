import { create } from 'zustand';

interface CatalogState {
  isPanelOpen: boolean;
  searchTerm: string;
  page: number;
  pageSize: number;
  
  // Panel controls
  openPanel: () => void;
  closePanel: () => void;
  
  // Search controls
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  resetSearch: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  isPanelOpen: false,
  searchTerm: '',
  page: 1,
  pageSize: 10,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  setSearchTerm: (searchTerm) => set({ 
    searchTerm,
    page: 1 // Reset page when search changes
  }),

  setPage: (page) => set({ page }),

  resetSearch: () => set({
    searchTerm: '',
    page: 1
  })
}));