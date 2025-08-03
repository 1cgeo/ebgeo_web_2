// Path: features\maps-contexts\store\maps.store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { MapConfig } from '../../data-access/schemas/map.schema';
import { LayerConfig } from '../../data-access/schemas/layer.schema';

// Estado dos mapas
interface MapsState {
  // Mapa ativo
  activeMapId: string | null;
  activeMap: MapConfig | null;
  
  // Cache de mapas carregados
  loadedMaps: Map<string, MapConfig>;
  
  // Cache de layers por mapa
  mapLayers: Map<string, LayerConfig[]>;
  
  // Estados de carregamento
  isLoadingMap: boolean;
  isInitializing: boolean;
  
  // Erros
  error: string | null;
  
  // UI States
  showMapSwitcher: boolean;
  lastViewports: Map<string, { center: [number, number]; zoom: number }>;
}

// Ações do store
interface MapsActions {
  // Gerenciamento do mapa ativo
  setActiveMap: (mapId: string | null) => void;
  setActiveMapData: (map: MapConfig | null) => void;
  updateActiveMapData: (updates: Partial<MapConfig>) => void;
  
  // Cache de mapas
  addLoadedMap: (map: MapConfig) => void;
  removeLoadedMap: (mapId: string) => void;
  updateLoadedMap: (mapId: string, updates: Partial<MapConfig>) => void;
  clearLoadedMaps: () => void;
  
  // Cache de layers
  setMapLayers: (mapId: string, layers: LayerConfig[]) => void;
  updateMapLayer: (mapId: string, layerId: string, updates: Partial<LayerConfig>) => void;
  removeMapLayer: (mapId: string, layerId: string) => void;
  clearMapLayers: (mapId: string) => void;
  
  // Estados de carregamento
  setLoadingMap: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  
  // Gerenciamento de erros
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // UI
  toggleMapSwitcher: () => void;
  setShowMapSwitcher: (show: boolean) => void;
  
  // Viewport management
  saveViewport: (mapId: string, center: [number, number], zoom: number) => void;
  getLastViewport: (mapId: string) => { center: [number, number]; zoom: number } | null;
  
  // Utilitários
  getActiveMapLayers: () => LayerConfig[] | null;
  isMapLoaded: (mapId: string) => boolean;
  
  // Reset
  reset: () => void;
}

// Estado inicial
const initialState: MapsState = {
  activeMapId: null,
  activeMap: null,
  loadedMaps: new Map(),
  mapLayers: new Map(),
  isLoadingMap: false,
  isInitializing: true,
  error: null,
  showMapSwitcher: false,
  lastViewports: new Map(),
};

// Store principal
export const useMapsStore = create<MapsState & MapsActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Gerenciamento do mapa ativo
        setActiveMap: (mapId) => {
          set(
            (state) => ({
              activeMapId: mapId,
              activeMap: mapId ? state.loadedMaps.get(mapId) || null : null,
              error: null,
            }),
            false,
            'setActiveMap'
          );
        },

        setActiveMapData: (map) => {
          set(
            (state) => {
              const newLoadedMaps = new Map(state.loadedMaps);
              if (map) {
                newLoadedMaps.set(map.id, map);
              }
              
              return {
                activeMap: map,
                activeMapId: map?.id || null,
                loadedMaps: newLoadedMaps,
                error: null,
              };
            },
            false,
            'setActiveMapData'
          );
        },

        updateActiveMapData: (updates) => {
          set(
            (state) => {
              if (!state.activeMap) return state;

              const updatedMap = { ...state.activeMap, ...updates };
              const newLoadedMaps = new Map(state.loadedMaps);
              newLoadedMaps.set(updatedMap.id, updatedMap);

              return {
                activeMap: updatedMap,
                loadedMaps: newLoadedMaps,
              };
            },
            false,
            'updateActiveMapData'
          );
        },

        // Cache de mapas
        addLoadedMap: (map) => {
          set(
            (state) => {
              const newLoadedMaps = new Map(state.loadedMaps);
              newLoadedMaps.set(map.id, map);
              
              return {
                loadedMaps: newLoadedMaps,
              };
            },
            false,
            'addLoadedMap'
          );
        },

        removeLoadedMap: (mapId) => {
          set(
            (state) => {
              const newLoadedMaps = new Map(state.loadedMaps);
              newLoadedMaps.delete(mapId);
              
              // Se era o mapa ativo, limpar
              const newActiveMapId = state.activeMapId === mapId ? null : state.activeMapId;
              const newActiveMap = newActiveMapId ? newLoadedMaps.get(newActiveMapId) || null : null;

              return {
                loadedMaps: newLoadedMaps,
                activeMapId: newActiveMapId,
                activeMap: newActiveMap,
              };
            },
            false,
            'removeLoadedMap'
          );
        },

        updateLoadedMap: (mapId, updates) => {
          set(
            (state) => {
              const existingMap = state.loadedMaps.get(mapId);
              if (!existingMap) return state;

              const updatedMap = { ...existingMap, ...updates };
              const newLoadedMaps = new Map(state.loadedMaps);
              newLoadedMaps.set(mapId, updatedMap);

              // Atualizar mapa ativo se necessário
              const newActiveMap = state.activeMapId === mapId ? updatedMap : state.activeMap;

              return {
                loadedMaps: newLoadedMaps,
                activeMap: newActiveMap,
              };
            },
            false,
            'updateLoadedMap'
          );
        },

        clearLoadedMaps: () => {
          set(
            {
              loadedMaps: new Map(),
              activeMapId: null,
              activeMap: null,
            },
            false,
            'clearLoadedMaps'
          );
        },

        // Cache de layers
        setMapLayers: (mapId, layers) => {
          set(
            (state) => {
              const newMapLayers = new Map(state.mapLayers);
              newMapLayers.set(mapId, layers);
              
              return {
                mapLayers: newMapLayers,
              };
            },
            false,
            'setMapLayers'
          );
        },

        updateMapLayer: (mapId, layerId, updates) => {
          set(
            (state) => {
              const existingLayers = state.mapLayers.get(mapId);
              if (!existingLayers) return state;

              const updatedLayers = existingLayers.map(layer => 
                layer.id === layerId ? { ...layer, ...updates } : layer
              );

              const newMapLayers = new Map(state.mapLayers);
              newMapLayers.set(mapId, updatedLayers);

              return {
                mapLayers: newMapLayers,
              };
            },
            false,
            'updateMapLayer'
          );
        },

        removeMapLayer: (mapId, layerId) => {
          set(
            (state) => {
              const existingLayers = state.mapLayers.get(mapId);
              if (!existingLayers) return state;

              const filteredLayers = existingLayers.filter(layer => layer.id !== layerId);
              const newMapLayers = new Map(state.mapLayers);
              newMapLayers.set(mapId, filteredLayers);

              return {
                mapLayers: newMapLayers,
              };
            },
            false,
            'removeMapLayer'
          );
        },

        clearMapLayers: (mapId) => {
          set(
            (state) => {
              const newMapLayers = new Map(state.mapLayers);
              newMapLayers.delete(mapId);
              
              return {
                mapLayers: newMapLayers,
              };
            },
            false,
            'clearMapLayers'
          );
        },

        // Estados de carregamento
        setLoadingMap: (loading) => {
          set({ isLoadingMap: loading }, false, 'setLoadingMap');
        },

        setInitializing: (initializing) => {
          set({ isInitializing: initializing }, false, 'setInitializing');
        },

        // Gerenciamento de erros
        setError: (error) => {
          set({ error }, false, 'setError');
        },

        clearError: () => {
          set({ error: null }, false, 'clearError');
        },

        // UI
        toggleMapSwitcher: () => {
          set(
            (state) => ({ showMapSwitcher: !state.showMapSwitcher }),
            false,
            'toggleMapSwitcher'
          );
        },

        setShowMapSwitcher: (show) => {
          set({ showMapSwitcher: show }, false, 'setShowMapSwitcher');
        },

        // Viewport management
        saveViewport: (mapId, center, zoom) => {
          set(
            (state) => {
              const newLastViewports = new Map(state.lastViewports);
              newLastViewports.set(mapId, { center, zoom });
              
              return {
                lastViewports: newLastViewports,
              };
            },
            false,
            'saveViewport'
          );
        },

        getLastViewport: (mapId) => {
          const state = get();
          return state.lastViewports.get(mapId) || null;
        },

        // Utilitários
        getActiveMapLayers: () => {
          const state = get();
          if (!state.activeMapId) return null;
          return state.mapLayers.get(state.activeMapId) || null;
        },

        isMapLoaded: (mapId) => {
          const state = get();
          return state.loadedMaps.has(mapId);
        },

        // Reset
        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'maps-store',
        // Apenas persistir dados essenciais
        partialize: (state) => ({
          activeMapId: state.activeMapId,
          lastViewports: state.lastViewports,
        }),
        // Converter Map para object para serialização
        serialize: (state) => {
          return JSON.stringify({
            ...state.state,
            lastViewports: Object.fromEntries(state.state.lastViewports),
          });
        },
        // Converter object de volta para Map na deserialização
        deserialize: (str) => {
          const data = JSON.parse(str);
          return {
            ...data,
            lastViewports: new Map(Object.entries(data.lastViewports || {})),
          };
        },
      }
    ),
    {
      name: 'maps-store',
    }
  )
);

// Seletores úteis
export const useMapsSelectors = () => {
  const store = useMapsStore();
  
  return {
    // Estados derivados
    hasActiveMap: store.activeMap !== null,
    activeMapName: store.activeMap?.name || null,
    activeMapLayerCount: store.getActiveMapLayers()?.length || 0,
    loadedMapCount: store.loadedMaps.size,
    isReady: !store.isInitializing && !store.isLoadingMap,
    hasError: store.error !== null,
    
    // Configurações ativas
    currentCenter: store.activeMap?.center || [-51.2177, -30.0346] as [number, number],
    currentZoom: store.activeMap?.zoom || 10,
    
    // Layers do mapa ativo
    activeLayers: store.getActiveMapLayers(),
    visibleLayers: store.getActiveMapLayers()?.filter(layer => layer.visible) || [],
  };
};

// Hook para ações específicas de mapas
export const useMapsActions = () => {
  const actions = useMapsStore((state) => ({
    setActiveMap: state.setActiveMap,
    setActiveMapData: state.setActiveMapData,
    updateActiveMapData: state.updateActiveMapData,
    addLoadedMap: state.addLoadedMap,
    setMapLayers: state.setMapLayers,
    setLoadingMap: state.setLoadingMap,
    setError: state.setError,
    clearError: state.clearError,
    saveViewport: state.saveViewport,
    toggleMapSwitcher: state.toggleMapSwitcher,
    reset: state.reset,
  }));

  return actions;
};

// Hook para cache management
export const useMapsCache = () => {
  const store = useMapsStore();
  
  return {
    // Verificações
    isMapLoaded: store.isMapLoaded,
    getLoadedMap: (mapId: string) => store.loadedMaps.get(mapId),
    getMapLayers: (mapId: string) => store.mapLayers.get(mapId),
    
    // Operações de cache
    addLoadedMap: store.addLoadedMap,
    updateLoadedMap: store.updateLoadedMap,
    removeLoadedMap: store.removeLoadedMap,
    setMapLayers: store.setMapLayers,
    updateMapLayer: store.updateMapLayer,
    removeMapLayer: store.removeMapLayer,
  };
};