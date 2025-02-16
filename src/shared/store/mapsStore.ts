import { create } from 'zustand';

interface MapsState {
  map: any | null;
  cesium: any | null;
  maplibregl: any | null;
  cesiumMap: any | null;
  setMap: (map: any) => void;
  setCesium: (cesium: any) => void;
  setMapLibregl: (maplibregl: any) => void;
  setCesiumMap: (cesiumMap: any) => void;
}

export const useMapsStore = create<MapsState>((set) => ({
  map: null,
  cesium: null,
  maplibregl: null,
  cesiumMap: null,
  setMap: (map) => set({ map }),
  setCesium: (cesium) => set({ cesium }),
  setMapLibregl: (maplibregl) => set({ maplibregl }),
  setCesiumMap: (cesiumMap) => set({ cesiumMap }),
}));