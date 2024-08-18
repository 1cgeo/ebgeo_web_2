import { create } from 'zustand';
import maplibregl from 'maplibre-gl';
import baseStyle from '../styles/baseMapStyles';

const useMapStore = create((set, get) => ({
  map: null,

  initializeMap: (container) => {
    const map = new maplibregl.Map({
      container,
      style: baseStyle,
      attributionControl: false,
      minZoom: 11,
      maxZoom: 17.9,
      maxPitch: 65,
      bounds: [[-45.82515, -22.69950], [-43.92333, -21.30216]],
    });

    map.addControl(new maplibregl.AttributionControl({
      customAttribution: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
      compact: true
    }), 'bottom-right');

    set({ map });

    return map;
  },
  addLayers: () => {
    const map = get().map;
    if (!map) return;
    // Add your layers here, similar to the original map.js file
  },

  cleanupMap: () => {
    const map = get().map;
    if (map) {
      map.remove();
      set({ map: null });
    }
  }
}));

export { useMapStore };