// Path: features\layers\store\layers.store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LayerConfig } from '../../data-access/schemas/layer.schema';

// Estado das camadas
interface LayersState {
  // Layer ativa para desenho
  activeLayerId: string | null;
  activeLayer: LayerConfig | null;

  // Layer selecionada para tabela de atributos
  selectedLayerId: string | null;

  // Visibilidade de layers (override local)
  layerVisibility: Map<string, boolean>;

  // Opacidade de layers (override local)
  layerOpacity: Map<string, number>;

  // Estados de UI
  showLayerManager: boolean;
  showAttributeTable: boolean;
  attributeTableLayerId: string | null;

  // Filtros da tabela de atributos
  attributeTableFilters: {
    search: string;
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc';
    showSelected: boolean;
  };

  // Estados de carregamento
  isLoadingLayers: boolean;
  isCreatingLayer: boolean;

  // Erros
  error: string | null;
}

// Ações do store
interface LayersActions {
  // Gerenciamento da layer ativa
  setActiveLayer: (layerId: string | null) => void;
  setActiveLayerData: (layer: LayerConfig | null) => void;

  // Layer selecionada
  setSelectedLayer: (layerId: string | null) => void;

  // Visibilidade
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setAllLayersVisibility: (visible: boolean, layerIds: string[]) => void;
  getLayerVisibility: (layerId: string, defaultVisible?: boolean) => boolean;

  // Opacidade
  setLayerOpacity: (layerId: string, opacity: number) => void;
  getLayerOpacity: (layerId: string, defaultOpacity?: number) => number;

  // UI States
  setShowLayerManager: (show: boolean) => void;
  toggleLayerManager: () => void;
  setShowAttributeTable: (show: boolean, layerId?: string) => void;
  toggleAttributeTable: (layerId?: string) => void;

  // Filtros da tabela de atributos
  setAttributeTableSearch: (search: string) => void;
  setAttributeTableSort: (column: string | null, direction: 'asc' | 'desc') => void;
  toggleAttributeTableSort: (column: string) => void;
  setShowSelectedInTable: (showSelected: boolean) => void;
  clearAttributeTableFilters: () => void;

  // Estados de carregamento
  setLoadingLayers: (loading: boolean) => void;
  setCreatingLayer: (creating: boolean) => void;

  // Gerenciamento de erros
  setError: (error: string | null) => void;
  clearError: () => void;

  // Utilitários
  getVisibleLayerIds: (allLayers: LayerConfig[]) => string[];
  getActiveLayerForDrawing: () => LayerConfig | null;

  // Reset
  reset: () => void;
  clearForMap: () => void; // Limpar estado ao trocar de mapa
}

// Estado inicial
const initialState: LayersState = {
  activeLayerId: null,
  activeLayer: null,
  selectedLayerId: null,
  layerVisibility: new Map(),
  layerOpacity: new Map(),
  showLayerManager: false,
  showAttributeTable: false,
  attributeTableLayerId: null,
  attributeTableFilters: {
    search: '',
    sortColumn: null,
    sortDirection: 'asc',
    showSelected: false,
  },
  isLoadingLayers: false,
  isCreatingLayer: false,
  error: null,
};

// Store principal
export const useLayersStore = create<LayersState & LayersActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Gerenciamento da layer ativa
        setActiveLayer: layerId => {
          set(
            {
              activeLayerId: layerId,
              // activeLayer será definido externamente quando a layer for carregada
              error: null,
            },
            false,
            'setActiveLayer'
          );
        },

        setActiveLayerData: layer => {
          set(
            {
              activeLayer: layer,
              activeLayerId: layer?.id || null,
              error: null,
            },
            false,
            'setActiveLayerData'
          );
        },

        // Layer selecionada
        setSelectedLayer: layerId => {
          set({ selectedLayerId: layerId }, false, 'setSelectedLayer');
        },

        // Visibilidade
        setLayerVisibility: (layerId, visible) => {
          set(
            state => {
              const newLayerVisibility = new Map(state.layerVisibility);
              newLayerVisibility.set(layerId, visible);

              return {
                layerVisibility: newLayerVisibility,
              };
            },
            false,
            'setLayerVisibility'
          );
        },

        toggleLayerVisibility: layerId => {
          const state = get();
          const currentVisibility = state.getLayerVisibility(layerId, true);
          state.setLayerVisibility(layerId, !currentVisibility);
        },

        setAllLayersVisibility: (visible, layerIds) => {
          set(
            state => {
              const newLayerVisibility = new Map(state.layerVisibility);
              layerIds.forEach(layerId => {
                newLayerVisibility.set(layerId, visible);
              });

              return {
                layerVisibility: newLayerVisibility,
              };
            },
            false,
            'setAllLayersVisibility'
          );
        },

        getLayerVisibility: (layerId, defaultVisible = true) => {
          const state = get();
          return state.layerVisibility.get(layerId) ?? defaultVisible;
        },

        // Opacidade
        setLayerOpacity: (layerId, opacity) => {
          set(
            state => {
              const newLayerOpacity = new Map(state.layerOpacity);
              newLayerOpacity.set(layerId, Math.max(0, Math.min(1, opacity)));

              return {
                layerOpacity: newLayerOpacity,
              };
            },
            false,
            'setLayerOpacity'
          );
        },

        getLayerOpacity: (layerId, defaultOpacity = 1) => {
          const state = get();
          return state.layerOpacity.get(layerId) ?? defaultOpacity;
        },

        // UI States
        setShowLayerManager: show => {
          set({ showLayerManager: show }, false, 'setShowLayerManager');
        },

        toggleLayerManager: () => {
          set(
            state => ({ showLayerManager: !state.showLayerManager }),
            false,
            'toggleLayerManager'
          );
        },

        setShowAttributeTable: (show, layerId) => {
          set(
            {
              showAttributeTable: show,
              attributeTableLayerId: show ? layerId || null : null,
            },
            false,
            'setShowAttributeTable'
          );
        },

        toggleAttributeTable: layerId => {
          const state = get();
          const newShow = !state.showAttributeTable;
          state.setShowAttributeTable(newShow, layerId);
        },

        // Filtros da tabela de atributos
        setAttributeTableSearch: search => {
          set(
            state => ({
              attributeTableFilters: {
                ...state.attributeTableFilters,
                search,
              },
            }),
            false,
            'setAttributeTableSearch'
          );
        },

        setAttributeTableSort: (column, direction) => {
          set(
            state => ({
              attributeTableFilters: {
                ...state.attributeTableFilters,
                sortColumn: column,
                sortDirection: direction,
              },
            }),
            false,
            'setAttributeTableSort'
          );
        },

        toggleAttributeTableSort: column => {
          const state = get();
          const currentColumn = state.attributeTableFilters.sortColumn;
          const currentDirection = state.attributeTableFilters.sortDirection;

          let newColumn = column;
          let newDirection: 'asc' | 'desc' = 'asc';

          if (currentColumn === column) {
            if (currentDirection === 'asc') {
              newDirection = 'desc';
            } else {
              // Se já está desc, remove a ordenação
              newColumn = null;
              newDirection = 'asc';
            }
          }

          state.setAttributeTableSort(newColumn, newDirection);
        },

        setShowSelectedInTable: showSelected => {
          set(
            state => ({
              attributeTableFilters: {
                ...state.attributeTableFilters,
                showSelected,
              },
            }),
            false,
            'setShowSelectedInTable'
          );
        },

        clearAttributeTableFilters: () => {
          set(
            state => ({
              attributeTableFilters: {
                search: '',
                sortColumn: null,
                sortDirection: 'asc',
                showSelected: false,
              },
            }),
            false,
            'clearAttributeTableFilters'
          );
        },

        // Estados de carregamento
        setLoadingLayers: loading => {
          set({ isLoadingLayers: loading }, false, 'setLoadingLayers');
        },

        setCreatingLayer: creating => {
          set({ isCreatingLayer: creating }, false, 'setCreatingLayer');
        },

        // Gerenciamento de erros
        setError: error => {
          set({ error }, false, 'setError');
        },

        clearError: () => {
          set({ error: null }, false, 'clearError');
        },

        // Utilitários
        getVisibleLayerIds: allLayers => {
          const state = get();
          return allLayers
            .filter(layer => state.getLayerVisibility(layer.id, layer.visible))
            .map(layer => layer.id);
        },

        getActiveLayerForDrawing: () => {
          const state = get();
          return state.activeLayer;
        },

        // Reset
        reset: () => {
          set(initialState, false, 'reset');
        },

        clearForMap: () => {
          set(
            {
              activeLayerId: null,
              activeLayer: null,
              selectedLayerId: null,
              attributeTableLayerId: null,
              layerVisibility: new Map(),
              layerOpacity: new Map(),
              showAttributeTable: false,
              error: null,
            },
            false,
            'clearForMap'
          );
        },
      }),
      {
        name: 'layers-store',
        // Apenas persistir dados essenciais
        partialize: state => ({
          layerVisibility: state.layerVisibility,
          layerOpacity: state.layerOpacity,
          showLayerManager: state.showLayerManager,
          attributeTableFilters: state.attributeTableFilters,
        }),
        // Converter Map para object para serialização
        serialize: state => {
          return JSON.stringify({
            ...state.state,
            layerVisibility: Object.fromEntries(state.state.layerVisibility),
            layerOpacity: Object.fromEntries(state.state.layerOpacity),
          });
        },
        // Converter object de volta para Map na deserialização
        deserialize: str => {
          const data = JSON.parse(str);
          return {
            ...data,
            layerVisibility: new Map(Object.entries(data.layerVisibility || {})),
            layerOpacity: new Map(Object.entries(data.layerOpacity || {})),
          };
        },
      }
    ),
    {
      name: 'layers-store',
    }
  )
);

// Seletores úteis
export const useLayersSelectors = () => {
  const store = useLayersStore();

  return {
    // Estados derivados
    hasActiveLayer: store.activeLayer !== null,
    activeLayerName: store.activeLayer?.name || null,
    hasSelectedLayer: store.selectedLayerId !== null,
    isAttributeTableOpen: store.showAttributeTable,
    hasAttributeTableFilters: !!(
      store.attributeTableFilters.search ||
      store.attributeTableFilters.sortColumn ||
      store.attributeTableFilters.showSelected
    ),

    // Estados de loading
    isReady: !store.isLoadingLayers && !store.isCreatingLayer,
    hasError: store.error !== null,

    // UI
    canDraw: store.activeLayer !== null,
  };
};

// Hook para ações específicas de layers
export const useLayersActions = () => {
  const actions = useLayersStore(state => ({
    setActiveLayer: state.setActiveLayer,
    setActiveLayerData: state.setActiveLayerData,
    setSelectedLayer: state.setSelectedLayer,
    setLayerVisibility: state.setLayerVisibility,
    toggleLayerVisibility: state.toggleLayerVisibility,
    setLayerOpacity: state.setLayerOpacity,
    setShowLayerManager: state.setShowLayerManager,
    toggleLayerManager: state.toggleLayerManager,
    setShowAttributeTable: state.setShowAttributeTable,
    toggleAttributeTable: state.toggleAttributeTable,
    setError: state.setError,
    clearError: state.clearError,
    clearForMap: state.clearForMap,
    reset: state.reset,
  }));

  return actions;
};

// Hook para filtros da tabela de atributos
export const useAttributeTableFilters = () => {
  const store = useLayersStore();

  return {
    // Estado atual
    filters: store.attributeTableFilters,

    // Ações
    setSearch: store.setAttributeTableSearch,
    setSort: store.setAttributeTableSort,
    toggleSort: store.toggleAttributeTableSort,
    setShowSelected: store.setShowSelectedInTable,
    clearFilters: store.clearAttributeTableFilters,

    // Helpers
    isSearching: store.attributeTableFilters.search.length > 0,
    isSorted: store.attributeTableFilters.sortColumn !== null,
    showingSelected: store.attributeTableFilters.showSelected,
  };
};

// Hook para visibilidade de layers
export const useLayerVisibility = () => {
  const store = useLayersStore();

  return {
    // Getters
    getVisibility: store.getLayerVisibility,
    getOpacity: store.getLayerOpacity,
    getVisibleLayerIds: store.getVisibleLayerIds,

    // Setters
    setVisibility: store.setLayerVisibility,
    toggleVisibility: store.toggleLayerVisibility,
    setAllVisibility: store.setAllLayersVisibility,
    setOpacity: store.setLayerOpacity,

    // Estado atual
    layerVisibility: store.layerVisibility,
    layerOpacity: store.layerOpacity,
  };
};
