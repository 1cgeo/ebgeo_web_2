// Path: features\layers\store\layers.store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface LayersState {
  activeLayerId: string | null;
  selectedLayerId: string | null;
  layerVisibility: Record<string, boolean>;
  layerOpacity: Record<string, number>;
  showLayerManager: boolean;
  showAttributeTable: boolean;
  attributeTableLayerId: string | null;
}

interface LayersActions {
  setActiveLayer: (layerId: string | null) => void;
  setSelectedLayer: (layerId: string | null) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  getLayerVisibility: (layerId: string) => boolean;
  getLayerOpacity: (layerId: string) => number;
  setShowLayerManager: (show: boolean) => void;
  toggleLayerManager: () => void;
  setShowAttributeTable: (show: boolean, layerId?: string) => void;
  reset: () => void;
}

const initialState: LayersState = {
  activeLayerId: null,
  selectedLayerId: null,
  layerVisibility: {},
  layerOpacity: {},
  showLayerManager: false,
  showAttributeTable: false,
  attributeTableLayerId: null,
};

export const useLayersStore = create<LayersState & LayersActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setActiveLayer: layerId => {
          set({ activeLayerId: layerId }, false, 'setActiveLayer');
        },

        setSelectedLayer: layerId => {
          set({ selectedLayerId: layerId }, false, 'setSelectedLayer');
        },

        setLayerVisibility: (layerId, visible) => {
          set(
            state => ({
              layerVisibility: { ...state.layerVisibility, [layerId]: visible },
            }),
            false,
            'setLayerVisibility'
          );
        },

        toggleLayerVisibility: layerId => {
          const state = get();
          const currentVisibility = state.layerVisibility[layerId] ?? true;
          get().setLayerVisibility(layerId, !currentVisibility);
        },

        setLayerOpacity: (layerId, opacity) => {
          set(
            state => ({
              layerOpacity: { ...state.layerOpacity, [layerId]: opacity },
            }),
            false,
            'setLayerOpacity'
          );
        },

        getLayerVisibility: layerId => {
          return get().layerVisibility[layerId] ?? true;
        },

        getLayerOpacity: layerId => {
          return get().layerOpacity[layerId] ?? 1;
        },

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

        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'layers-store',
        partialize: state => ({
          layerVisibility: state.layerVisibility,
          layerOpacity: state.layerOpacity,
        }),
      }
    ),
    { name: 'layers-store' }
  )
);

export const useLayersActions = () => {
  return useLayersStore(state => ({
    setActiveLayer: state.setActiveLayer,
    setSelectedLayer: state.setSelectedLayer,
    setLayerVisibility: state.setLayerVisibility,
    toggleLayerVisibility: state.toggleLayerVisibility,
    setLayerOpacity: state.setLayerOpacity,
    setShowLayerManager: state.setShowLayerManager,
    toggleLayerManager: state.toggleLayerManager,
    setShowAttributeTable: state.setShowAttributeTable,
    reset: state.reset,
  }));
};
