// Path: mapSig\features\vectorInfo\store.ts
import { create } from 'zustand';

import { getMap } from '../../store';
import { type VectorFeature, type VectorLayer } from './types';

interface VectorInfoState {
  isPanelOpen: boolean;
  isActive: boolean;
  layers: VectorLayer[];
  selectedFeature: VectorFeature | null;

  // Panel controls
  openPanel: () => void;
  closePanel: () => void;

  // Layer management
  setLayers: (layers: VectorLayer[]) => void;
  updateLayerVisibility: (layerId: string, visible: boolean) => void;

  // Feature selection
  selectFeature: (feature: VectorFeature | null) => void;

  // Tool state
  setActive: (active: boolean) => void;
  refreshLayers: () => void;
}

export const useVectorInfoStore = create<VectorInfoState>(set => ({
  isPanelOpen: false,
  isActive: false,
  layers: [],
  selectedFeature: null,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => {
    set({
      isPanelOpen: false,
      selectedFeature: null,
    });
  },

  setLayers: layers => set({ layers }),

  updateLayerVisibility: (layerId, visible) => {
    const map = getMap();
    if (!map) return;

    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');

    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer,
      ),
    }));
  },

  selectFeature: feature => {
    set({
      selectedFeature: feature,
      isPanelOpen: !!feature,
    });
  },

  setActive: active => {
    const map = getMap();
    if (map) {
      map.getCanvas().style.cursor = active ? 'pointer' : '';
    }
    set({ isActive: active });
  },

  refreshLayers: () => {
    const map = getMap();
    if (!map) return;

    const vectorLayers = map
      .getStyle()
      .layers.filter(layer =>
        ['fill', 'line', 'symbol', 'circle'].includes(layer.type),
      )
      .map(layer => ({
        id: layer.id,
        name: layer.id.split('-').join(' '),
        sourceLayer: layer['source-layer'] || '',
        type: layer.type as VectorLayer['type'],
        minzoom: layer.minzoom,
        maxzoom: layer.maxzoom,
        visible: map.getLayoutProperty(layer.id, 'visibility') !== 'none',
      }));

    set({ layers: vectorLayers });
  },
}));
